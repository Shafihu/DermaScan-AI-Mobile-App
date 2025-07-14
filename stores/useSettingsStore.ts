import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserSettings {
  notifications: {
    enabled: boolean;
    scanReminders: boolean;
    healthTips: boolean;
  };
  privacy: {
    shareData: boolean;
    anonymousMode: boolean;
  };
  preferences: {
    theme: "light" | "dark" | "auto";
    language: string;
    units: "metric" | "imperial";
  };
}

export interface SettingsState {
  // State
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
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

      // Actions
      loadSettings: async () => {
        try {
          set({ isLoading: true, error: null });

          // Load from AsyncStorage only
          const settingsData = await AsyncStorage.getItem(
            "@DermaScanAI:settings"
          );
          if (settingsData) {
            const settings = JSON.parse(settingsData) as UserSettings;
            set({ settings });
          }
          // If no settings found, use defaults
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
          const { settings } = get();

          const updatedSettings = { ...settings, ...updates };
          set({ settings: updatedSettings });

          // Save to AsyncStorage
          await AsyncStorage.setItem(
            "@DermaScanAI:settings",
            JSON.stringify(updatedSettings)
          );
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

      resetSettings: () => {
        set({ settings: defaultSettings });
        AsyncStorage.setItem(
          "@DermaScanAI:settings",
          JSON.stringify(defaultSettings)
        );
      },
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        settings: state.settings,
      }),
    }
  )
);
