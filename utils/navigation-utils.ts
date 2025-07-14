import { router } from "expo-router";
import { useAuthStore } from "@/stores";

export const handleLogout = async () => {
  const { logout } = useAuthStore.getState();

  try {
    await logout();
    // Reset navigation stack and go to welcome screen
    router.replace("/welcome");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

export const handleLoginSuccess = () => {
  // Reset navigation stack and go to main app
  router.replace("/(tabs)");
};

export const handleSignupSuccess = () => {
  // Reset navigation stack and go to main app
  router.replace("/(tabs)");
};
