import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { OnboardingUtils } from "@/utils/onboarding-utils";

interface PermissionItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: string[];
  permissionType: "camera" | "mediaLibrary";
}

const permissionItems: PermissionItem[] = [
  {
    id: "camera",
    title: "Camera Access",
    description: "Take photos of skin conditions for AI analysis",
    icon: "camera-outline",
    gradient: ["#4ECDC4", "#44A08D"],
    permissionType: "camera",
  },
  {
    id: "mediaLibrary",
    title: "Photo Library",
    description: "Select existing photos for skin analysis",
    icon: "images-outline",
    gradient: ["#A8E6CF", "#7FCDCD"],
    permissionType: "mediaLibrary",
  },
];

export default function PermissionsScreen() {
  const router = useRouter();
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  const requestPermission = async (
    permissionType: "camera" | "mediaLibrary"
  ) => {
    try {
      let result;

      if (permissionType === "camera") {
        result = await ImagePicker.requestCameraPermissionsAsync();
      } else {
        result = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }

      if (result.granted) {
        setPermissions((prev) => ({ ...prev, [permissionType]: true }));
        Alert.alert(
          "Permission Granted",
          `Camera access has been granted. You can now take photos for skin analysis.`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Permission Required",
          "Camera access is required to analyze your skin. Please enable it in your device settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Settings", onPress: () => {} },
          ]
        );
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
    }
  };

  const handleContinue = () => {
    // Check if at least one permission is granted
    const hasAnyPermission = Object.values(permissions).some(Boolean);

    if (hasAnyPermission) {
      router.replace("/(tabs)");
    } else {
      Alert.alert(
        "Permissions Required",
        "Please grant at least camera or photo library access to use DermaScan.",
        [{ text: "OK" }]
      );
    }
  };

  const handleSkip = () => {
    router.replace("/(tabs)");
  };

  const renderPermissionItem = (item: PermissionItem) => {
    const isGranted = permissions[item.permissionType];

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.permissionItem}
        onPress={() => requestPermission(item.permissionType)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={item.gradient}
          style={[
            styles.permissionIconContainer,
            isGranted && styles.permissionGranted,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons
            name={isGranted ? "checkmark" : item.icon}
            size={32}
            color="white"
          />
        </LinearGradient>

        <View style={styles.permissionContent}>
          <ThemedText type="subtitle" style={styles.permissionTitle}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.permissionDescription}>
            {item.description}
          </ThemedText>
        </View>

        <View style={styles.permissionStatus}>
          {isGranted ? (
            <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />
          ) : (
            <Ionicons name="chevron-forward" size={24} color="#687076" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <ThemedText style={styles.skipText}>Skip</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <ThemedText type="title" style={styles.title}>
            Enable Permissions
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Grant access to camera and photo library to get the most out of
            DermaScan
          </ThemedText>
        </View>

        <View style={styles.permissionsContainer}>
          {permissionItems.map(renderPermissionItem)}
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark" size={20} color="#4ECDC4" />
            <ThemedText style={styles.infoText}>
              Your data is encrypted and secure
            </ThemedText>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="eye-off" size={20} color="#4ECDC4" />
            <ThemedText style={styles.infoText}>
              Photos are not stored permanently
            </ThemedText>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="lock-closed" size={20} color="#4ECDC4" />
            <ThemedText style={styles.infoText}>
              Analysis is done locally when possible
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#FF8E6E", "#FF6B4A"]}
            style={styles.continueButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <ThemedText style={styles.continueButtonText}>Continue</ThemedText>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    color: "#687076",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    textAlign: "center",
    marginBottom: 12,
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 16,
    color: "#687076",
    lineHeight: 24,
    maxWidth: 300,
  },
  permissionsContainer: {
    marginBottom: 40,
  },
  permissionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  permissionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  permissionGranted: {
    backgroundColor: "#4ECDC4",
  },
  permissionContent: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 14,
    color: "#687076",
    lineHeight: 20,
  },
  permissionStatus: {
    marginLeft: 16,
  },
  infoContainer: {
    backgroundColor: "#F0F8FF",
    borderRadius: 12,
    padding: 20,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#687076",
    marginLeft: 12,
    flex: 1,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  continueButton: {
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  continueButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
});
