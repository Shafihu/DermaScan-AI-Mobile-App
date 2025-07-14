import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { format } from "date-fns";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { type ScanResult, getHistory } from "../../utils/storage-utils";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

// Get greeting based on time of day
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

// Get user's first name
const getUserName = async () => {
  try {
    const name = await AsyncStorage.getItem("@DermaScanAI:userName");
    return name || "";
  } catch (error) {
    console.error("Error getting user name:", error);
    return "";
  }
};

export default function HomeScreen() {
  const [userName, setUserName] = useState("");
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
  const [skinHealthScore, setSkinHealthScore] = useState(78);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  // Load user data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadUserData();
      animateContent();
    }, [])
  );

  const loadUserData = async () => {
    const name = await getUserName();
    setUserName(name);

    const history = await getHistory();
    setRecentScans(history.slice(0, 2)); // Get 2 most recent scans
  };

  const animateContent = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "MMM d");
  };

  // Navigate to scan screen
  const handleScan = () => {
    router.push("/scan_screen");
  };

  // Navigate to history detail
  const viewScanDetail = (scan: ScanResult) => {
    router.navigate({
      pathname: "/history_details_screen",
      params: {
        id: scan.id,
        imageUri: scan.imageUri,
        condition: scan.condition,
        confidence: scan.confidence,
        severity: scan.severity,
        description: scan.description,
        symptoms: JSON.stringify(scan.symptoms),
        recommendations: JSON.stringify(scan.recommendations),
        date: scan.date,
      },
    });
  };

  // Navigate to history screen
  const viewAllHistory = () => {
    router.push("/(tabs)/history");
  };

  // Get severity color
  const getSeverityColor = (severity: string): string => {
    switch (severity.toLowerCase()) {
      case "mild":
        return "#4CAF50";
      case "moderate":
        return "#FF9800";
      case "severe":
        return "#F44336";
      default:
        return "#757575";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{userName || "Welcome back"}</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <Ionicons name="person-circle-outline" size={32} color="#333" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Main Scan Button */}
        <Animated.View
          style={[
            styles.scanSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY }],
            },
          ]}
        >
          <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
            <LinearGradient
              colors={["#FF8E6E", "#FF6B4A"]}
              style={styles.scanButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.scanButtonContent}>
                <View style={styles.scanIconContainer}>
                  <Ionicons name="scan-outline" size={32} color="white" />
                </View>
                <View style={styles.scanTextContainer}>
                  <Text style={styles.scanButtonTitle}>Scan Your Skin</Text>
                  <Text style={styles.scanButtonSubtitle}>
                    AI-powered analysis in seconds
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={24} color="white" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Skin Health Score */}
        <Animated.View
          style={[
            styles.scoreSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <Text style={styles.scoreTitle}>Skin Health Score</Text>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#666"
              />
            </View>
            <View style={styles.scoreContent}>
              <Text style={styles.scoreValue}>{skinHealthScore}</Text>
              <Text style={styles.scoreLabel}>out of 100</Text>
            </View>
            <View style={styles.scoreBar}>
              <View
                style={[styles.scoreBarFill, { width: `${skinHealthScore}%` }]}
              />
            </View>
          </View>
        </Animated.View>

        {/* Recent Scans */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Scans</Text>
            {recentScans.length > 0 && (
              <TouchableOpacity onPress={viewAllHistory}>
                <Text style={styles.sectionLink}>View All</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentScans.length > 0 ? (
            <View style={styles.scansContainer}>
              {recentScans.map((scan) => (
                <TouchableOpacity
                  key={scan.id}
                  style={styles.scanCard}
                  onPress={() => viewScanDetail(scan)}
                >
                  <Image
                    source={{ uri: scan.imageUri }}
                    style={styles.scanImage}
                  />
                  <View style={styles.scanInfo}>
                    <Text style={styles.scanCondition} numberOfLines={1}>
                      {scan.condition}
                    </Text>
                    <View style={styles.scanMeta}>
                      <View
                        style={[
                          styles.severityDot,
                          { backgroundColor: getSeverityColor(scan.severity) },
                        ]}
                      />
                      <Text style={styles.scanDate}>
                        {formatDate(scan.date)}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#CCC" />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="camera-outline" size={48} color="#DDD" />
              <Text style={styles.emptyStateTitle}>No scans yet</Text>
              <Text style={styles.emptyStateSubtitle}>
                Start by taking your first skin scan
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push("/(tabs)/tips")}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="bulb-outline" size={24} color="#FF8E6E" />
              </View>
              <Text style={styles.actionTitle}>Skin Tips</Text>
              <Text style={styles.actionSubtitle}>Expert advice</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push("/(tabs)/dermatologist")}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="medical-outline" size={24} color="#4ECDC4" />
              </View>
              <Text style={styles.actionTitle}>Consult</Text>
              <Text style={styles.actionSubtitle}>Find dermatologists</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
  },
  profileButton: {
    padding: 4,
  },
  scanSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  scanButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#FF8E6E",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  scanButtonGradient: {
    padding: 24,
  },
  scanButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  scanIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  scanTextContainer: {
    flex: 1,
  },
  scanButtonTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    marginBottom: 4,
  },
  scanButtonSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  scoreSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  scoreCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  scoreContent: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: "700",
    color: "#FF8E6E",
    marginRight: 8,
  },
  scoreLabel: {
    fontSize: 16,
    color: "#666",
  },
  scoreBar: {
    height: 6,
    backgroundColor: "#F0F0F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  scoreBarFill: {
    height: "100%",
    backgroundColor: "#FF8E6E",
    borderRadius: 3,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  sectionLink: {
    fontSize: 14,
    color: "#FF8E6E",
    fontWeight: "500",
  },
  scansContainer: {
    gap: 12,
  },
  scanCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scanImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 16,
  },
  scanInfo: {
    flex: 1,
  },
  scanCondition: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  scanMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  scanDate: {
    fontSize: 14,
    color: "#666",
  },
  emptyState: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: "#666",
  },
});
