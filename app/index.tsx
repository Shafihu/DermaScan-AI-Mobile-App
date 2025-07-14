import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { OnboardingUtils } from "@/utils/onboarding-utils";
import { ThemedView } from "@/components/ThemedView";

export default function Index() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const determineInitialRoute = async () => {
      try {
        const initialRoute = await OnboardingUtils.getInitialRoute();
        if (initialRoute === "/(tabs)") {
          router.replace("/(tabs)");
        } else {
          router.push(initialRoute as any);
        }
      } catch (error) {
        console.error("Error determining initial route:", error);
        // Fallback to welcome screen
        router.replace("/welcome");
      } finally {
        setIsLoading(false);
      }
    };

    determineInitialRoute();
  }, []);

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#FF8E6E" />
      </ThemedView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
