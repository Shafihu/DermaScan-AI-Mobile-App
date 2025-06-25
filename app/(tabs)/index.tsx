/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState, useRef, useCallback } from "react";
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
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { format } from "date-fns";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { type ScanResult, getHistory } from "../../utils/storage-utils";
import { SkinHealthScore } from "@/components/SKinHealthScore";
import { router } from "expo-router";

const { width } = Dimensions.get("window");
const MAIN_COLOR = "#FF8E6E"; // Coral color as the main theme

// Get greeting based on time of day
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

// Get user's first name (placeholder - would be from user profile)
const getUserName = async () => {
  try {
    const name = await AsyncStorage.getItem("@DermaScanAI:userName");
    return name || "";
  } catch (error) {
    console.error("Error getting user name:", error);
    return "";
  }
};

export default function HomeScreen({ navigation }: { navigation?: any }) {
  const [userName, setUserName] = useState("");
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
  const [skinHealthScore, setSkinHealthScore] = useState(78); // Mock score
  const [streakDays, setStreakDays] = useState(5); // Mock streak
  const [todayTip, setTodayTip] = useState({
    title: "Hydration Reminder",
    content:
      "Drinking at least 8 glasses of water daily helps maintain skin elasticity and flush toxins.",
    category: "hydration",
  });
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Weekly Skin Report",
      message: "Your skin health report for this week is ready to view.",
      time: new Date(Date.now() - 3600000).getTime(), // 1 hour ago
      read: false,
    },
    {
      id: "2",
      title: "Scan Reminder",
      message:
        "It's been 7 days since your last skin scan. Consider a follow-up scan.",
      time: new Date(Date.now() - 86400000).getTime(), // 1 day ago
      read: true,
    },
  ]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // Load user data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadUserData();
      animateContent();

      return () => {
        // Reset animations when screen loses focus
        fadeAnim.setValue(0);
        translateY.setValue(20);
      };
    }, [])
  );

  const loadUserData = async () => {
    const name = await getUserName();
    setUserName(name);

    const history = await getHistory();
    setRecentScans(history.slice(0, 3)); // Get 3 most recent scans
  };

  const animateContent = () => {
    // Animate content in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "MMM d, yyyy");
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

  // Navigate to tips screen
  const viewTips = () => {
    navigation?.navigate("Tips");
  };

  // Navigate to history screen
  const viewAllHistory = () => {
    navigation?.navigate("History");
  };

  // Navigate to dermatologist screen
  const viewDermatologist = () => {
    navigation?.navigate("Dermatologist");
  };

  // Mark notification as read
  const markNotificationRead = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const handleInfoPress = () => {
    // Show modal or navigate to info screen
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Animated Header */}
      <View style={[styles.header]}>
        <View style={[styles.headerContent]}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>
              {userName || "Skin Health Enthusiast"}
            </Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <FontAwesome5 name="user-circle" size={32} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Scan Button */}
        <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
          <View style={styles.scanButtonInner}>
            <View style={styles.scanIconWrapper}>
              <Feather name="camera" size={24} color="#FFF" />
            </View>
            <View style={styles.scanTextContainer}>
              <Text style={styles.scanButtonText}>Scan Your Skin</Text>
              <Text style={styles.scanButtonSubtext}>
                Quick analysis with AI
              </Text>
            </View>
          </View>
          <View style={styles.arrowContainer}>
            <Feather name="arrow-right" size={24} color="#FFF" />
          </View>
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Skin Health Score Component */}
        <View style={styles.scoreWrapper}>
          <SkinHealthScore
            score={skinHealthScore}
            streakDays={streakDays}
            onInfoPress={handleInfoPress}
          />
        </View>

        {/* Recent Scans */}
        <Animated.View
          style={[
            styles.sectionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Scans</Text>
            <TouchableOpacity onPress={viewAllHistory}>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>

          {recentScans.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.recentScansScroll}
            >
              {recentScans.map((scan) => (
                <TouchableOpacity
                  key={scan.id}
                  style={styles.recentScanCard}
                  onPress={() => viewScanDetail(scan)}
                >
                  <Image
                    source={{ uri: scan.imageUri }}
                    style={styles.recentScanImage}
                  />
                  <View style={styles.recentScanInfo}>
                    <Text style={styles.recentScanCondition}>
                      {scan.condition}
                    </Text>
                    <View style={styles.recentScanMeta}>
                      <View
                        style={[
                          styles.severityIndicator,
                          { backgroundColor: getSeverityColor(scan.severity) },
                        ]}
                      />
                      <Text style={styles.recentScanDate}>
                        {formatDate(scan.date)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyScansContainer}>
              <FontAwesome5 name="camera" size={40} color="#DDD" />
              <Text style={styles.emptyScansText}>No scans yet</Text>
              <TouchableOpacity
                style={styles.emptyScanButton}
                onPress={handleScan}
              >
                <Text style={styles.emptyScanButtonText}>
                  Take Your First Scan
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        {/* Tip of the Day */}
        <Animated.View
          style={[
            styles.sectionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tip of the Day</Text>
            <TouchableOpacity onPress={viewTips}>
              <Text style={styles.sectionLink}>More Tips</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.tipCard} onPress={viewTips}>
            <View style={styles.tipCardHeader}>
              <View style={styles.tipCategoryBadge}>
                <Text style={styles.tipCategoryText}>
                  {todayTip.category.charAt(0).toUpperCase() +
                    todayTip.category.slice(1)}
                </Text>
              </View>
              <Feather name="bookmark" size={20} color="#999" />
            </View>
            <Text style={styles.tipTitle}>{todayTip.title}</Text>
            <Text style={styles.tipContent} numberOfLines={3}>
              {todayTip.content}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Dermatologist Consultation */}
        <Animated.View
          style={[
            styles.sectionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.consultCard}
            onPress={viewDermatologist}
          >
            <View style={styles.consultCardContent}>
              <View style={styles.consultCardIcon}>
                <FontAwesome5 name="user-md" size={24} color="#FFF" />
              </View>
              <View style={styles.consultCardText}>
                <Text style={styles.consultCardTitle}>
                  Consult a Dermatologist
                </Text>
                <Text style={styles.consultCardDescription}>
                  Connect with board-certified dermatologists for personalized
                  advice
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={24} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>

        {/* Notifications */}
        <Animated.View
          style={[
            styles.sectionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.notificationsCard}>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationItem,
                    notification.read && styles.notificationRead,
                  ]}
                  onPress={() => markNotificationRead(notification.id)}
                >
                  {!notification.read && (
                    <View style={styles.notificationDot} />
                  )}
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationMessage}>
                      {notification.message}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {formatRelativeTime(notification.time)}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={20} color="#CCC" />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyNotifications}>
                <Feather name="bell" size={32} color="#DDD" />
                <Text style={styles.emptyNotificationsText}>
                  No notifications yet
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Upcoming Features */}
        <Animated.View
          style={[
            styles.sectionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.upcomingCard}>
            <View style={styles.upcomingBadge}>
              <Text style={styles.upcomingBadgeText}>Coming Soon</Text>
            </View>
            <Text style={styles.upcomingTitle}>
              AI-Powered Skin Condition Tracking
            </Text>
            <Text style={styles.upcomingDescription}>
              Track the progress of your skin conditions over time with advanced
              AI analysis and personalized treatment recommendations.
            </Text>
            <TouchableOpacity style={styles.upcomingButton}>
              <Text style={styles.upcomingButtonText}>Join Waitlist</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

// Helper function to get severity color
function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case "mild":
      return "#4CAF50"; // Green
    case "moderate":
      return "#FFC107"; // Amber
    case "severe":
      return "#F44336"; // Red
    default:
      return "#757575"; // Gray
  }
}

// Helper function to format relative time
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffInSeconds = Math.floor((now - timestamp) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: "#666666",
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333333",
    marginTop: 4,
  },
  profileButton: {
    padding: 8,
  },
  scanButtonContainer: {
    paddingBottom: 15,
  },
  scanButton: {
    backgroundColor: MAIN_COLOR,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: MAIN_COLOR,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  scanButtonIcon: {
    marginRight: 10,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  sectionContainer: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  scanButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  scanIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  scanTextContainer: {
    flex: 1,
  },
  scanButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  scanButtonSubtext: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
  },
  arrowContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreWrapper: {
    margin: 20,
    marginTop: 0,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  sectionLink: {
    fontSize: 14,
    color: MAIN_COLOR,
  },
  recentScansScroll: {
    paddingBottom: 10,
  },
  recentScanCard: {
    width: 160,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginRight: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  recentScanImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  recentScanInfo: {
    padding: 12,
  },
  recentScanCondition: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  recentScanMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  severityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  recentScanDate: {
    fontSize: 12,
    color: "#999999",
  },
  emptyScansContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  emptyScansText: {
    fontSize: 16,
    color: "#666666",
    marginTop: 10,
    marginBottom: 15,
  },
  emptyScanButton: {
    backgroundColor: MAIN_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyScanButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  tipCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  tipCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  tipCategoryBadge: {
    backgroundColor: "rgba(255, 142, 110, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tipCategoryText: {
    color: MAIN_COLOR,
    fontSize: 12,
    fontWeight: "500",
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  tipContent: {
    fontSize: 14,
    lineHeight: 22,
    color: "#666666",
  },
  consultCard: {
    backgroundColor: MAIN_COLOR,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  consultCardContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  consultCardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  consultCardText: {
    flex: 1,
  },
  consultCardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  consultCardDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
  },
  notificationsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    position: "relative",
  },
  notificationRead: {
    backgroundColor: "#FFFFFF",
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: MAIN_COLOR,
    position: "absolute",
    left: 8,
    top: "50%",
    marginTop: -4,
  },
  notificationContent: {
    flex: 1,
    marginRight: 10,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: "#999999",
  },
  emptyNotifications: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  emptyNotificationsText: {
    fontSize: 14,
    color: "#999999",
    marginTop: 10,
  },
  upcomingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  upcomingBadge: {
    backgroundColor: "#2196F3",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  upcomingBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  upcomingTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  upcomingDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: "#666666",
    marginBottom: 15,
  },
  upcomingButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  upcomingButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  bottomPadding: {
    height: 100,
  },
  floatingButton: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: MAIN_COLOR,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});
