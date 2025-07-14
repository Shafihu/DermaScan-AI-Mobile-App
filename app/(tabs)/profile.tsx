import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  TextInput,
  Alert,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore, useScanStore, useAppStore } from "@/stores";
import { handleLogout } from "@/utils/navigation-utils";
import { runApiTests } from "@/services/apiTest";

export default function ProfileScreen() {
  const { user, updateProfile } = useAuthStore();
  const { scanHistory } = useScanStore();
  const { settings, updateSettings } = useAppStore();

  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);

        // Data is now loaded from stores automatically
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading user data:", error);
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Save user data
  const saveUserData = async () => {
    try {
      setIsLoading(true);

      // Update profile in store
      if (user) {
        await updateProfile({
          fullName: user.fullName,
          profileImage: user.profileImage,
        });
      }

      setIsLoading(false);
      setIsEditing(false);

      Alert.alert("Success", "Your profile has been updated successfully.");
    } catch (error) {
      console.error("Error saving user data:", error);
      setIsLoading(false);
      Alert.alert("Error", "Failed to save your profile. Please try again.");
    }
  };

  // Pick image from gallery
  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "You need to grant permission to access your photos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        if (user) {
          await updateProfile({ profileImage: result.assets[0].uri });
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          // Clear user data and navigate to welcome screen
          await handleLogout();
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8E6E" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => (isEditing ? saveUserData() : setIsEditing(true))}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? "Save" : "Edit"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.profileImageContainer}
            onPress={isEditing ? pickImage : undefined}
            disabled={!isEditing}
          >
            {user?.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={40} color="#FFF" />
              </View>
            )}
            {isEditing && (
              <View style={styles.editProfileImageButton}>
                <Ionicons name="camera" size={16} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            {isEditing ? (
              <TextInput
                style={styles.nameInput}
                value={user?.fullName || ""}
                onChangeText={(text) =>
                  user && updateProfile({ fullName: text })
                }
                placeholder="Full Name"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.nameText}>
                {user?.fullName || "Add your name"}
              </Text>
            )}

            {isEditing ? (
              <TextInput
                style={styles.emailInput}
                value={user?.email || ""}
                onChangeText={(text) => user && updateProfile({ email: text })}
                placeholder="Email Address"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text style={styles.emailText}>
                {user?.email || "Add your email"}
              </Text>
            )}
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="scan-outline" size={24} color="#FFF" />
              </View>
              <Text style={styles.statValue}>{scanHistory.length}</Text>
              <Text style={styles.statLabel}>Total Scans</Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: "#4ECDC4" },
                ]}
              >
                <Ionicons name="calendar-outline" size={24} color="#FFF" />
              </View>
              <Text style={styles.statValue}>
                {scanHistory.length > 0 ? "Active" : "None"}
              </Text>
              <Text style={styles.statLabel}>Last Scan</Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsContainer}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications-outline" size={24} color="#666" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Notifications</Text>
                  <Text style={styles.settingSubtitle}>
                    Receive scan reminders
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(value) =>
                  updateSettings({ notificationsEnabled: value })
                }
                trackColor={{ false: "#E0E0E0", true: "#FF8E6E" }}
                thumbColor="#FFF"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="moon-outline" size={24} color="#666" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Dark Mode</Text>
                  <Text style={styles.settingSubtitle}>
                    Switch to dark theme
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.darkModeEnabled}
                onValueChange={(value) =>
                  updateSettings({ darkModeEnabled: value })
                }
                trackColor={{ false: "#E0E0E0", true: "#FF8E6E" }}
                thumbColor="#FFF"
              />
            </View>
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.supportContainer}>
            <TouchableOpacity style={styles.supportItem}>
              <Ionicons name="help-circle-outline" size={24} color="#666" />
              <Text style={styles.supportText}>Help & FAQ</Text>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.supportItem}>
              <Ionicons name="mail-outline" size={24} color="#666" />
              <Text style={styles.supportText}>Contact Support</Text>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.supportItem}>
              <Ionicons name="document-text-outline" size={24} color="#666" />
              <Text style={styles.supportText}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>
          </View>
        </View>

        {/* API Test */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Development</Text>
          <View style={styles.supportContainer}>
            <TouchableOpacity
              style={styles.supportItem}
              onPress={async () => {
                Alert.alert("API Test", "Testing API connection...");
                const results = await runApiTests();

                let message = `Connection: ${
                  results.connection ? "✅" : "❌"
                }\n`;
                message += `Auth Endpoints: ${results.auth ? "✅" : "❌"}\n`;
                message += `Signup Test: ${
                  results.signup.success ? "✅" : "❌"
                }`;

                if (!results.signup.success && results.signup.error) {
                  message += `\n\nSignup Error: ${JSON.stringify(
                    results.signup.error
                  )}`;
                }

                Alert.alert("API Test Results", message);
              }}
            >
              <Ionicons name="wifi-outline" size={24} color="#666" />
              <Text style={styles.supportText}>Test API Connection</Text>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={20} color="#F44336" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  editButtonText: {
    fontSize: 16,
    color: "#FF8E6E",
    fontWeight: "500",
  },
  profileSection: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FF8E6E",
    justifyContent: "center",
    alignItems: "center",
  },
  editProfileImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF8E6E",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFF",
  },
  profileInfo: {
    alignItems: "center",
    width: "100%",
  },
  nameInput: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#FF8E6E",
    paddingVertical: 8,
    marginBottom: 8,
    width: "80%",
  },
  nameText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emailInput: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#FF8E6E",
    paddingVertical: 8,
    width: "80%",
  },
  emailText: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FF8E6E",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  settingsContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  supportContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  supportItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  supportText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 16,
    flex: 1,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  signOutText: {
    fontSize: 16,
    color: "#F44336",
    fontWeight: "500",
    marginLeft: 8,
  },
});
