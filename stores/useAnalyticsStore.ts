import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiService, AnalyticsResponse } from "../services/apiService";

export interface AnalyticsState {
  // State
  analytics: AnalyticsResponse | null;
  healthScore: number;
  isLoading: boolean;
  error: string | null;
  isOnline: boolean;
  lastUpdated: number | null;

  // Actions
  loadAnalytics: () => Promise<void>;
  loadHealthScore: () => Promise<void>;
  refreshAnalytics: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  clearAnalytics: () => void;
}

const defaultAnalytics: AnalyticsResponse = {
  totalScans: 0,
  averageConfidence: 0,
  mostCommonConditions: [],
  scanTrends: [],
  healthScore: 0,
};

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      // Initial state
      analytics: null,
      healthScore: 0,
      isLoading: false,
      error: null,
      isOnline: true,
      lastUpdated: null,

      // Actions
      loadAnalytics: async () => {
        try {
          set({ isLoading: true, error: null });
          const { isOnline } = get();

          if (isOnline) {
            try {
              const [analytics, healthScoreData] = await Promise.all([
                apiService.getAnalytics(),
                apiService.getHealthScore(),
              ]);

              set({
                analytics,
                healthScore: healthScoreData.score,
                lastUpdated: Date.now(),
              });
            } catch (error) {
              console.error("Error loading analytics from server:", error);
              // Keep local analytics if server fails
            }
          }
          // If offline, keep local analytics
        } catch (error) {
          console.error("Error loading analytics:", error);
          set({ error: "Failed to load analytics" });
        } finally {
          set({ isLoading: false });
        }
      },

      loadHealthScore: async () => {
        try {
          const { isOnline } = get();

          if (isOnline) {
            try {
              const healthScoreData = await apiService.getHealthScore();
              set({ healthScore: healthScoreData.score });
            } catch (error) {
              console.error("Error loading health score from server:", error);
            }
          }
        } catch (error) {
          console.error("Error loading health score:", error);
        }
      },

      refreshAnalytics: async () => {
        const { isOnline } = get();
        if (!isOnline) return;

        try {
          set({ isLoading: true });
          const [analytics, healthScoreData] = await Promise.all([
            apiService.getAnalytics(),
            apiService.getHealthScore(),
          ]);

          set({
            analytics,
            healthScore: healthScoreData.score,
            lastUpdated: Date.now(),
          });
        } catch (error) {
          console.error("Error refreshing analytics:", error);
          set({ error: "Failed to refresh analytics" });
        } finally {
          set({ isLoading: false });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setOnlineStatus: (isOnline: boolean) => {
        set({ isOnline });
        if (isOnline) {
          // Try to refresh analytics when coming back online
          get().refreshAnalytics();
        }
      },

      clearAnalytics: () => {
        set({
          analytics: null,
          healthScore: 0,
          lastUpdated: null,
        });
      },
    }),
    {
      name: "analytics-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        analytics: state.analytics,
        healthScore: state.healthScore,
        lastUpdated: state.lastUpdated,
        isOnline: state.isOnline,
      }),
    }
  )
);
