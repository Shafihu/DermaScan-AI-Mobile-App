import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/useAuthStore";
import { useScanStore } from "@/stores/useScanStore";

interface OfflineIndicatorProps {
  showSyncStatus?: boolean;
}

export default function OfflineIndicator({
  showSyncStatus = false,
}: OfflineIndicatorProps) {
  const { isOnline } = useAuthStore();
  const { syncStatus } = useScanStore();

  if (isOnline) return null;

  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline" size={16} color="#fff" />
      <Text style={styles.text}>Offline Mode</Text>
      {showSyncStatus && syncStatus === "syncing" && (
        <Text style={styles.syncText}>Syncing...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  text: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  syncText: {
    color: "#fff",
    fontSize: 10,
    marginLeft: "auto",
  },
});
