import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AppSettings {
  notificationsEnabled: boolean;
  darkModeEnabled: boolean;
  hapticFeedbackEnabled: boolean;
  autoSaveScans: boolean;
  language: string;
  favoriteTips: string[];
}

export interface AppState {
  // State
  settings: AppSettings;
  isOnboardingComplete: boolean;
  isWelcomeShown: boolean;
  isLoading: boolean;

  // Actions
  updateSettings: (updates: Partial<AppSettings>) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setWelcomeShown: (shown: boolean) => void;
  setLoading: (loading: boolean) => void;
  resetApp: () => void;
}

const defaultSettings: AppSettings = {
  notificationsEnabled: true,
  darkModeEnabled: false,
  hapticFeedbackEnabled: true,
  autoSaveScans: true,
  language: "en",
  favoriteTips: [],
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      settings: defaultSettings,
      isOnboardingComplete: false,
      isWelcomeShown: false,
      isLoading: false,

      // Actions
      updateSettings: (updates: Partial<AppSettings>) => {
        const { settings } = get();
        set({
          settings: { ...settings, ...updates },
        });
      },

      setOnboardingComplete: (complete: boolean) => {
        set({ isOnboardingComplete: complete });
      },

      setWelcomeShown: (shown: boolean) => {
        set({ isWelcomeShown: shown });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      resetApp: () => {
        set({
          settings: defaultSettings,
          isOnboardingComplete: false,
          isWelcomeShown: false,
        });
      },
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        settings: state.settings,
        isOnboardingComplete: state.isOnboardingComplete,
        isWelcomeShown: state.isWelcomeShown,
      }),
    }
  )
);
