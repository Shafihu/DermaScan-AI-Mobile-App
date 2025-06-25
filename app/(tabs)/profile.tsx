"use client";

import { useState, useEffect } from "react";
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
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { getHistory } from "@/utils/storage-utils";

const MAIN_COLOR = "#FF8E6E"; // Coral color as the main theme

// Skin types for selection
const SKIN_TYPES = [
  {
    id: "type1",
    label: "Type I - Very Fair",
    description: "Always burns, never tans",
  },
  {
    id: "type2",
    label: "Type II - Fair",
    description: "Burns easily, tans minimally",
  },
  {
    id: "type3",
    label: "Type III - Medium",
    description: "Burns moderately, tans gradually",
  },
  {
    id: "type4",
    label: "Type IV - Olive",
    description: "Burns minimally, tans well",
  },
  {
    id: "type5",
    label: "Type V - Brown",
    description: "Rarely burns, tans darkly",
  },
  {
    id: "type6",
    label: "Type VI - Dark Brown/Black",
    description: "Never burns, tans darkly",
  },
];

export default function ProfileScreen() {
  // User profile state
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [selectedSkinType, setSelectedSkinType] = useState<string | null>(null);
  const [skinConditions, setSkinConditions] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // App settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [scanRemindersEnabled, setScanRemindersEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [biometricLoginEnabled, setBiometricLoginEnabled] = useState(false);
  const [dataBackupEnabled, setDataBackupEnabled] = useState(true);

  // App usage stats
  const [totalScans, setTotalScans] = useState(0);
  const [lastScanDate, setLastScanDate] = useState<string | null>(null);
  const [mostCommonCondition, setMostCommonCondition] = useState<string | null>(
    null
  );

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);

        // Load profile data
        const storedProfileImage = await AsyncStorage.getItem(
          "@DermaScanAI:profileImage"
        );
        const storedFullName = await AsyncStorage.getItem(
          "@DermaScanAI:fullName"
        );
        const storedEmail = await AsyncStorage.getItem("@DermaScanAI:email");
        const storedDateOfBirth = await AsyncStorage.getItem(
          "@DermaScanAI:dateOfBirth"
        );
        const storedSkinType = await AsyncStorage.getItem(
          "@DermaScanAI:skinType"
        );
        const storedSkinConditions = await AsyncStorage.getItem(
          "@DermaScanAI:skinConditions"
        );

        // Load app settings
        const storedNotificationsEnabled = await AsyncStorage.getItem(
          "@DermaScanAI:notificationsEnabled"
        );
        const storedScanRemindersEnabled = await AsyncStorage.getItem(
          "@DermaScanAI:scanRemindersEnabled"
        );
        const storedDarkModeEnabled = await AsyncStorage.getItem(
          "@DermaScanAI:darkModeEnabled"
        );
        const storedBiometricLoginEnabled = await AsyncStorage.getItem(
          "@DermaScanAI:biometricLoginEnabled"
        );
        const storedDataBackupEnabled = await AsyncStorage.getItem(
          "@DermaScanAI:dataBackupEnabled"
        );

        // Set profile data
        if (storedProfileImage) setProfileImage(storedProfileImage);
        if (storedFullName) setFullName(storedFullName);
        if (storedEmail) setEmail(storedEmail);
        if (storedDateOfBirth) setDateOfBirth(storedDateOfBirth);
        if (storedSkinType) setSelectedSkinType(storedSkinType);
        if (storedSkinConditions)
          setSkinConditions(JSON.parse(storedSkinConditions));

        // Set app settings
        if (storedNotificationsEnabled)
          setNotificationsEnabled(storedNotificationsEnabled === "true");
        if (storedScanRemindersEnabled)
          setScanRemindersEnabled(storedScanRemindersEnabled === "true");
        if (storedDarkModeEnabled)
          setDarkModeEnabled(storedDarkModeEnabled === "true");
        if (storedBiometricLoginEnabled)
          setBiometricLoginEnabled(storedBiometricLoginEnabled === "true");
        if (storedDataBackupEnabled)
          setDataBackupEnabled(storedDataBackupEnabled === "true");

        // Load scan history for stats
        const history = await getHistory();
        setTotalScans(history.length);

        if (history.length > 0) {
          // Get last scan date
          const lastScan = history[0];
          setLastScanDate(new Date(lastScan.date).toLocaleDateString());

          // Find most common condition
          const conditionCounts: Record<string, number> = {};
          history.forEach((scan) => {
            conditionCounts[scan.condition] =
              (conditionCounts[scan.condition] || 0) + 1;
          });

          let maxCount = 0;
          let maxCondition = null;

          for (const [condition, count] of Object.entries(conditionCounts)) {
            if (count > maxCount) {
              maxCount = count;
              maxCondition = condition;
            }
          }

          setMostCommonCondition(maxCondition);
        }

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

      // Save profile data
      if (profileImage)
        await AsyncStorage.setItem("@DermaScanAI:profileImage", profileImage);
      await AsyncStorage.setItem("@DermaScanAI:fullName", fullName);
      await AsyncStorage.setItem("@DermaScanAI:email", email);
      await AsyncStorage.setItem("@DermaScanAI:dateOfBirth", dateOfBirth);
      if (selectedSkinType)
        await AsyncStorage.setItem("@DermaScanAI:skinType", selectedSkinType);
      await AsyncStorage.setItem(
        "@DermaScanAI:skinConditions",
        JSON.stringify(skinConditions)
      );

      // Save app settings
      await AsyncStorage.setItem(
        "@DermaScanAI:notificationsEnabled",
        notificationsEnabled.toString()
      );
      await AsyncStorage.setItem(
        "@DermaScanAI:scanRemindersEnabled",
        scanRemindersEnabled.toString()
      );
      await AsyncStorage.setItem(
        "@DermaScanAI:darkModeEnabled",
        darkModeEnabled.toString()
      );
      await AsyncStorage.setItem(
        "@DermaScanAI:biometricLoginEnabled",
        biometricLoginEnabled.toString()
      );
      await AsyncStorage.setItem(
        "@DermaScanAI:dataBackupEnabled",
        dataBackupEnabled.toString()
      );

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

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  // Toggle skin condition
  const toggleSkinCondition = (condition: string) => {
    if (skinConditions.includes(condition)) {
      setSkinConditions(skinConditions.filter((c) => c !== condition));
    } else {
      setSkinConditions([...skinConditions, condition]);
    }
  };

  // Sign out
  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          // In a real app, you would clear auth tokens here
          // router.replace("/login");
        },
      },
    ]);
  };

  // Delete account
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Confirm Deletion",
              "Please confirm that you want to permanently delete your account and all associated data.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Confirm Delete",
                  style: "destructive",
                  onPress: async () => {
                    setIsLoading(true);
                    // In a real app, you would make an API call to delete the account
                    setTimeout(() => {
                      setIsLoading(false);
                      // router.replace("/login");
                    }, 2000);
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MAIN_COLOR} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => (isEditing ? saveUserData() : setIsEditing(true))}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? "Save" : "Edit"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.profileImageContainer}
            onPress={isEditing ? pickImage : undefined}
            disabled={!isEditing}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImagePlaceholderText}>
                  {fullName ? fullName.charAt(0).toUpperCase() : "U"}
                </Text>
              </View>
            )}
            {isEditing && (
              <View style={styles.editProfileImageButton}>
                <Feather name="camera" size={16} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            {isEditing ? (
              <TextInput
                style={styles.nameInput}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Full Name"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.nameText}>{fullName || "Add your name"}</Text>
            )}

            {isEditing ? (
              <TextInput
                style={styles.emailInput}
                value={email}
                onChangeText={setEmail}
                placeholder="Email Address"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text style={styles.emailText}>{email || "Add your email"}</Text>
            )}
          </View>
        </View>

        {/* Medical Information */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Medical Information</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date of Birth</Text>
              {isEditing ? (
                <TextInput
                  style={styles.infoInput}
                  value={dateOfBirth}
                  onChangeText={setDateOfBirth}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor="#999"
                  keyboardType="numbers-and-punctuation"
                />
              ) : (
                <Text style={styles.infoValue}>
                  {dateOfBirth || "Not specified"}
                </Text>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Skin Type</Text>
              {isEditing ? (
                <TouchableOpacity
                  style={styles.skinTypeSelector}
                  onPress={() => {
                    Alert.alert(
                      "Select Skin Type",
                      "Choose your Fitzpatrick skin type:",
                      SKIN_TYPES.map((type) => ({
                        text: type.label,
                        onPress: () => setSelectedSkinType(type.id),
                      }))
                    );
                  }}
                >
                  <Text style={styles.skinTypeSelectorText}>
                    {selectedSkinType
                      ? SKIN_TYPES.find((type) => type.id === selectedSkinType)
                          ?.label
                      : "Select skin type"}
                  </Text>
                  <Feather name="chevron-down" size={16} color="#666" />
                </TouchableOpacity>
              ) : (
                <Text style={styles.infoValue}>
                  {selectedSkinType
                    ? SKIN_TYPES.find((type) => type.id === selectedSkinType)
                        ?.label
                    : "Not specified"}
                </Text>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRowColumn}>
              <Text style={styles.infoLabel}>Skin Conditions</Text>
              {isEditing ? (
                <View style={styles.conditionsContainer}>
                  {[
                    "Eczema",
                    "Psoriasis",
                    "Acne",
                    "Rosacea",
                    "Melasma",
                    "Vitiligo",
                  ].map((condition) => (
                    <TouchableOpacity
                      key={condition}
                      style={[
                        styles.conditionTag,
                        skinConditions.includes(condition) &&
                          styles.conditionTagSelected,
                      ]}
                      onPress={() => toggleSkinCondition(condition)}
                    >
                      <Text
                        style={[
                          styles.conditionTagText,
                          skinConditions.includes(condition) &&
                            styles.conditionTagTextSelected,
                        ]}
                      >
                        {condition}
                      </Text>
                      {skinConditions.includes(condition) && (
                        <Feather
                          name="check"
                          size={14}
                          color="#FFF"
                          style={styles.conditionTagIcon}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.conditionsContainer}>
                  {skinConditions.length > 0 ? (
                    skinConditions.map((condition) => (
                      <View key={condition} style={styles.conditionTag}>
                        <Text style={styles.conditionTagText}>{condition}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.infoValue}>None specified</Text>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Usage Statistics */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Usage Statistics</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Feather name="camera" size={20} color="#FFF" />
              </View>
              <Text style={styles.statValue}>{totalScans}</Text>
              <Text style={styles.statLabel}>Total Scans</Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: "#4CAF50" },
                ]}
              >
                <Feather name="calendar" size={20} color="#FFF" />
              </View>
              <Text style={styles.statValue}>{lastScanDate || "N/A"}</Text>
              <Text style={styles.statLabel}>Last Scan</Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: "#2196F3" },
                ]}
              >
                <Feather name="activity" size={20} color="#FFF" />
              </View>
              <Text style={styles.statValue}>
                {mostCommonCondition || "N/A"}
              </Text>
              <Text style={styles.statLabel}>Common Condition</Text>
            </View>
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>App Settings</Text>

          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Feather
                  name="bell"
                  size={20}
                  color="#666"
                  style={styles.settingIcon}
                />
                <Text style={styles.settingLabel}>Push Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{
                  false: "#E0E0E0",
                  true: "rgba(255, 142, 110, 0.4)",
                }}
                thumbColor={notificationsEnabled ? MAIN_COLOR : "#F5F5F5"}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Feather
                  name="clock"
                  size={20}
                  color="#666"
                  style={styles.settingIcon}
                />
                <Text style={styles.settingLabel}>Scan Reminders</Text>
              </View>
              <Switch
                value={scanRemindersEnabled}
                onValueChange={setScanRemindersEnabled}
                trackColor={{
                  false: "#E0E0E0",
                  true: "rgba(255, 142, 110, 0.4)",
                }}
                thumbColor={scanRemindersEnabled ? MAIN_COLOR : "#F5F5F5"}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Feather
                  name="moon"
                  size={20}
                  color="#666"
                  style={styles.settingIcon}
                />
                <Text style={styles.settingLabel}>Dark Mode</Text>
              </View>
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{
                  false: "#E0E0E0",
                  true: "rgba(255, 142, 110, 0.4)",
                }}
                thumbColor={darkModeEnabled ? MAIN_COLOR : "#F5F5F5"}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons
                  name="finger-print"
                  size={20}
                  color="#666"
                  style={styles.settingIcon}
                />
                <Text style={styles.settingLabel}>Biometric Login</Text>
              </View>
              <Switch
                value={biometricLoginEnabled}
                onValueChange={setBiometricLoginEnabled}
                trackColor={{
                  false: "#E0E0E0",
                  true: "rgba(255, 142, 110, 0.4)",
                }}
                thumbColor={biometricLoginEnabled ? MAIN_COLOR : "#F5F5F5"}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Feather
                  name="cloud"
                  size={20}
                  color="#666"
                  style={styles.settingIcon}
                />
                <Text style={styles.settingLabel}>Data Backup</Text>
              </View>
              <Switch
                value={dataBackupEnabled}
                onValueChange={setDataBackupEnabled}
                trackColor={{
                  false: "#E0E0E0",
                  true: "rgba(255, 142, 110, 0.4)",
                }}
                thumbColor={dataBackupEnabled ? MAIN_COLOR : "#F5F5F5"}
              />
            </View>
          </View>
        </View>

        {/* Support & Help */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Support & Help</Text>

          <View style={styles.supportCard}>
            <TouchableOpacity style={styles.supportRow}>
              <View style={styles.supportInfo}>
                <MaterialIcons
                  name="help-outline"
                  size={20}
                  color="#666"
                  style={styles.supportIcon}
                />
                <Text style={styles.supportLabel}>Help Center</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#CCC" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.supportRow}>
              <View style={styles.supportInfo}>
                <MaterialIcons
                  name="contact-support"
                  size={20}
                  color="#666"
                  style={styles.supportIcon}
                />
                <Text style={styles.supportLabel}>Contact Support</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#CCC" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.supportRow}>
              <View style={styles.supportInfo}>
                <Feather
                  name="file-text"
                  size={20}
                  color="#666"
                  style={styles.supportIcon}
                />
                <Text style={styles.supportLabel}>Privacy Policy</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#CCC" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.supportRow}>
              <View style={styles.supportInfo}>
                <Feather
                  name="shield"
                  size={20}
                  color="#666"
                  style={styles.supportIcon}
                />
                <Text style={styles.supportLabel}>Terms of Service</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#CCC" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.accountActionsCard}>
            <TouchableOpacity
              style={styles.accountActionRow}
              onPress={handleSignOut}
            >
              <View style={styles.accountActionInfo}>
                <Feather
                  name="log-out"
                  size={20}
                  color="#666"
                  style={styles.accountActionIcon}
                />
                <Text style={styles.accountActionLabel}>Sign Out</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#CCC" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.accountActionRow}
              onPress={handleDeleteAccount}
            >
              <View style={styles.accountActionInfo}>
                <Feather
                  name="trash-2"
                  size={20}
                  color="#F44336"
                  style={styles.accountActionIcon}
                />
                <Text style={[styles.accountActionLabel, { color: "#F44336" }]}>
                  Delete Account
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#CCC" />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>DermaScanAI v1.0.0</Text>
        </View>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: MAIN_COLOR,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
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
    backgroundColor: "rgba(255, 142, 110, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImagePlaceholderText: {
    fontSize: 36,
    fontWeight: "600",
    color: MAIN_COLOR,
  },
  editProfileImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: MAIN_COLOR,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileInfo: {
    alignItems: "center",
  },
  nameText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    color: "#666666",
  },
  nameInput: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingBottom: 4,
    width: 250,
  },
  emailInput: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingBottom: 4,
    width: 250,
  },
  sectionContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoRowColumn: {
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    color: "#666666",
  },
  infoInput: {
    fontSize: 16,
    color: "#333333",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingBottom: 4,
    minWidth: 120,
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 8,
  },
  skinTypeSelector: {
    flexDirection: "row",
    alignItems: "center",
  },
  skinTypeSelectorText: {
    fontSize: 16,
    color: "#666666",
    marginRight: 8,
  },
  conditionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  conditionTag: {
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  conditionTagSelected: {
    backgroundColor: MAIN_COLOR,
  },
  conditionTagText: {
    fontSize: 14,
    color: "#666666",
  },
  conditionTagTextSelected: {
    color: "#FFFFFF",
  },
  conditionTagIcon: {
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MAIN_COLOR,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666666",
    textAlign: "center",
  },
  settingsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: "#333333",
  },
  supportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 20,
  },
  supportRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  supportInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  supportIcon: {
    marginRight: 12,
  },
  supportLabel: {
    fontSize: 16,
    color: "#333333",
  },
  accountActionsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 20,
  },
  accountActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  accountActionInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  accountActionIcon: {
    marginRight: 12,
  },
  accountActionLabel: {
    fontSize: 16,
    color: "#333333",
  },
  versionContainer: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  versionText: {
    fontSize: 14,
    color: "#999999",
  },
  bottomPadding: {
    height: 40,
  },
});
