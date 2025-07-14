import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ThemedView } from "@/components/ThemedView";

export default function Index() {
  const router = useRouter();

  React.useEffect(() => {
    // Simple direct navigation to welcome screen
    router.replace("/welcome" as any);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ActivityIndicator size="large" color="#FF8E6E" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
