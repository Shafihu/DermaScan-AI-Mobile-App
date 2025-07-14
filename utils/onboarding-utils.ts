import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_COMPLETE_KEY = "onboarding_complete";
const WELCOME_SHOWN_KEY = "welcome_shown";

export const OnboardingUtils = {
  /**
   * Check if onboarding has been completed
   */
  async isOnboardingComplete(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
      return value === "true";
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      return false;
    }
  },

  /**
   * Mark onboarding as complete
   */
  async setOnboardingComplete(): Promise<void> {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
    } catch (error) {
      console.error("Error setting onboarding complete:", error);
    }
  },

  /**
   * Check if welcome screen has been shown
   */
  async isWelcomeShown(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(WELCOME_SHOWN_KEY);
      return value === "true";
    } catch (error) {
      console.error("Error checking welcome status:", error);
      return false;
    }
  },

  /**
   * Mark welcome screen as shown
   */
  async setWelcomeShown(): Promise<void> {
    try {
      await AsyncStorage.setItem(WELCOME_SHOWN_KEY, "true");
    } catch (error) {
      console.error("Error setting welcome shown:", error);
    }
  },

  /**
   * Reset onboarding state (for testing or user preference)
   */
  async resetOnboarding(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        ONBOARDING_COMPLETE_KEY,
        WELCOME_SHOWN_KEY,
      ]);
    } catch (error) {
      console.error("Error resetting onboarding:", error);
    }
  },

  /**
   * Get the initial route based on onboarding state
   */
  async getInitialRoute(): Promise<string> {
    const welcomeShown = await this.isWelcomeShown();
    const onboardingComplete = await this.isOnboardingComplete();

    if (!welcomeShown) {
      return "/welcome";
    } else if (!onboardingComplete) {
      return "/onboarding";
    } else {
      return "/(tabs)";
    }
  },
};
