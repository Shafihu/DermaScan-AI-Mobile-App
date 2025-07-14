import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuthStore, useScanStore, useAppStore } from "@/stores";

export default function StoreExample() {
  // Auth store usage
  const { user, isAuthenticated, login, logout } = useAuthStore();

  // Scan store usage
  const { scanHistory, addScanResult, clearHistory } = useScanStore();

  // App store usage
  const { settings, updateSettings } = useAppStore();

  const handleLogin = async () => {
    try {
      await login("demo@example.com", "password123");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleToggleNotifications = () => {
    updateSettings({ notificationsEnabled: !settings.notificationsEnabled });
  };

  const handleAddDemoScan = () => {
    const demoScan = {
      id: `demo_${Date.now()}`,
      imageUri: "https://example.com/demo-image.jpg",
      condition: "Demo Condition",
      confidence: 85,
      severity: "mild",
      date: Date.now(),
      description: "This is a demo scan result",
      symptoms: ["Demo symptom 1", "Demo symptom 2"],
      recommendations: [
        {
          title: "Demo Recommendation",
          description: "This is a demo recommendation",
          icon: "💡",
        },
      ],
    };
    addScanResult(demoScan);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Zustand Store Example</Text>

      {/* Auth Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Authentication</Text>
        <Text>User: {user?.fullName || "Not logged in"}</Text>
        <Text>Authenticated: {isAuthenticated ? "Yes" : "No"}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={isAuthenticated ? handleLogout : handleLogin}
        >
          <Text style={styles.buttonText}>
            {isAuthenticated ? "Logout" : "Login"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Scan Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Scan History</Text>
        <Text>Total Scans: {scanHistory.length}</Text>
        <TouchableOpacity style={styles.button} onPress={handleAddDemoScan}>
          <Text style={styles.buttonText}>Add Demo Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={clearHistory}>
          <Text style={styles.buttonText}>Clear History</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        <Text>
          Notifications: {settings.notificationsEnabled ? "On" : "Off"}
        </Text>
        <Text>Dark Mode: {settings.darkModeEnabled ? "On" : "Off"}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleToggleNotifications}
        >
          <Text style={styles.buttonText}>Toggle Notifications</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  button: {
    backgroundColor: "#FF8E6E",
    padding: 12,
    borderRadius: 6,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
