import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiService, UserSettings } from "../services/apiService";

export interface SettingsState {
  // State
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;
  isOnline: boolean;

  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  resetSettings: () => void;
}

const defaultSettings: UserSettings = {
  notifications: {
    enabled: true,
    scanReminders: true,
    healthTips: true,
  },
  privacy: {
    shareData: false,
    anonymousMode: false,
  },
  preferences: {
    theme: "auto",
    language: "en",
    units: "metric",
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Initial state
      settings: defaultSettings,
      isLoading: false,
      error: null,
      isOnline: true,

      // Actions
      loadSettings: async () => {
        try {
          set({ isLoading: true, error: null });
          const { isOnline } = get();

          if (isOnline) {
            try {
              const serverSettings = await apiService.getUserSettings();
              set({ settings: serverSettings });
            } catch (error) {
              console.error("Error loading settings from server:", error);
              // Keep local settings if server fails
            }
          }
          // If offline, keep local settings
        } catch (error) {
          console.error("Error loading settings:", error);
          set({ error: "Failed to load settings" });
        } finally {
          set({ isLoading: false });
        }
      },

      updateSettings: async (updates: Partial<UserSettings>) => {
        try {
          set({ isLoading: true, error: null });
          const { settings, isOnline } = get();

          const updatedSettings = { ...settings, ...updates };
          set({ settings: updatedSettings });

          if (isOnline) {
            try {
              const serverSettings = await apiService.updateUserSettings(
                updates
              );
              set({ settings: serverSettings });
            } catch (error) {
              console.error("Error updating settings on server:", error);
              // Keep local changes even if server update fails
            }
          }
        } catch (error) {
          console.error("Error updating settings:", error);
          set({ error: "Failed to update settings" });
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
          // Try to sync settings when coming back online
          get().loadSettings();
        }
      },

      resetSettings: () => {
        set({ settings: defaultSettings });
      },
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        settings: state.settings,
        isOnline: state.isOnline,
      }),
    }
  )
);
