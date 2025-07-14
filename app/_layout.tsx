import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useEffect } from "react";

import { useColorScheme } from "@/hooks/useColorScheme";
import { OnboardingUtils } from "@/utils/onboarding-utils";
import NavigationGuard from "@/components/NavigationGuard";
import { networkService } from "@/services/networkService";
import { useAuthStore } from "@/stores/useAuthStore";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Initialize network service and check auth status
  useEffect(() => {
    const initializeApp = async () => {
      // Initialize network monitoring
      networkService.initialize();

      // Check authentication status
      const { checkAuthStatus } = useAuthStore.getState();
      await checkAuthStatus();
    };

    initializeApp();
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <NavigationGuard>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="welcome"
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="onboarding"
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen name="permissions" options={{ headerShown: false }} />
          <Stack.Screen
            name="auth"
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              gestureEnabled: false,
              headerBackVisible: false,
            }}
          />
          <Stack.Screen name="scan_screen" options={{ headerShown: false }} />
          <Stack.Screen name="result_screen" options={{ headerShown: false }} />
          <Stack.Screen
            name="dermatologist_profile"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="history_details_screen"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
      </NavigationGuard>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
