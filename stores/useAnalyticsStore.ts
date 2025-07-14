import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AnalyticsData {
  totalScans: number;
  averageConfidence: number;
  mostCommonConditions: Array<{
    condition: string;
    count: number;
  }>;
  scanTrends: Array<{
    date: string;
    count: number;
  }>;
  healthScore: number;
}

export interface AnalyticsState {
  // State
  analytics: AnalyticsData | null;
  healthScore: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;

  // Actions
  loadAnalytics: () => Promise<void>;
  updateAnalytics: (data: Partial<AnalyticsData>) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAnalytics: () => void;
  calculateHealthScore: (scans: any[]) => void;
}

const defaultAnalytics: AnalyticsData = {
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
      lastUpdated: null,

      // Actions
      loadAnalytics: async () => {
        try {
          set({ isLoading: true, error: null });

          // Load from AsyncStorage only
          const analyticsData = await AsyncStorage.getItem(
            "@DermaScanAI:analytics"
          );
          if (analyticsData) {
            const analytics = JSON.parse(analyticsData) as AnalyticsData;
            set({
              analytics,
              healthScore: analytics.healthScore,
              lastUpdated: Date.now(),
            });
          } else {
            // Initialize with defaults
            set({
              analytics: defaultAnalytics,
              healthScore: 0,
              lastUpdated: Date.now(),
            });
          }
        } catch (error) {
          console.error("Error loading analytics:", error);
          set({ error: "Failed to load analytics" });
        } finally {
          set({ isLoading: false });
        }
      },

      updateAnalytics: async (data: Partial<AnalyticsData>) => {
        try {
          set({ isLoading: true, error: null });
          const { analytics } = get();

          const updatedAnalytics = {
            ...(analytics || defaultAnalytics),
            ...data,
          };

          set({
            analytics: updatedAnalytics,
            healthScore: updatedAnalytics.healthScore,
            lastUpdated: Date.now(),
          });

          // Save to AsyncStorage
          await AsyncStorage.setItem(
            "@DermaScanAI:analytics",
            JSON.stringify(updatedAnalytics)
          );
        } catch (error) {
          console.error("Error updating analytics:", error);
          set({ error: "Failed to update analytics" });
        } finally {
          set({ isLoading: false });
        }
      },

      calculateHealthScore: (scans: any[]) => {
        if (scans.length === 0) {
          set({ healthScore: 0 });
          return;
        }

        // Simple health score calculation based on scan data
        const totalScans = scans.length;
        const averageConfidence =
          scans.reduce((sum, scan) => sum + (scan.confidence || 0), 0) /
          totalScans;

        // Calculate health score (0-100) based on confidence and scan frequency
        const healthScore = Math.min(
          100,
          Math.round(averageConfidence * 0.7 + Math.min(totalScans, 10) * 3)
        );

        set({ healthScore });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearAnalytics: () => {
        set({
          analytics: null,
          healthScore: 0,
          lastUpdated: null,
        });
        AsyncStorage.removeItem("@DermaScanAI:analytics");
      },
    }),
    {
      name: "analytics-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        analytics: state.analytics,
        healthScore: state.healthScore,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);
