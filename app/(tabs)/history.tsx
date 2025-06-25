// import React from "react";
// import { View, Text, ScrollView, StyleSheet } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { MaterialCommunityIcons } from "@expo/vector-icons";

// export default function HistoryScreen() {
//   const insets = useSafeAreaInsets();

//   const historyItems = [
//     {
//       date: "Today",
//       time: "14:30",
//       condition: "Acne",
//       severity: "Moderate",
//       score: 85,
//     },
//     {
//       date: "Yesterday",
//       time: "09:15",
//       condition: "Dry Skin",
//       severity: "Mild",
//       score: 80,
//     },
//   ];

//   return (
//     <View style={[styles.container, { paddingTop: insets.top }]}>
//       <Text style={styles.header}>Scan History</Text>
//       <ScrollView style={styles.scrollView}>
//         {historyItems.map((item, index) => (
//           <View key={index} style={styles.historyCard}>
//             <View style={styles.dateContainer}>
//               <Text style={styles.date}>{item.date}</Text>
//               <Text style={styles.time}>{item.time}</Text>
//             </View>
//             <View style={styles.detailsContainer}>
//               <View style={styles.conditionContainer}>
//                 <Text style={styles.condition}>{item.condition}</Text>
//                 <Text style={styles.severity}>{item.severity}</Text>
//               </View>
//               <View style={styles.scoreContainer}>
//                 <MaterialCommunityIcons
//                   name="chart-bar"
//                   size={20}
//                   color="#FF8E6E"
//                 />
//                 <Text style={styles.score}>{item.score}</Text>
//               </View>
//             </View>
//           </View>
//         ))}
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FAF9F6",
//   },
//   header: {
//     fontSize: 28,
//     fontWeight: "700",
//     color: "#2D3142",
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   historyCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     padding: 16,
//     marginHorizontal: 20,
//     marginVertical: 8,
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   dateContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 12,
//   },
//   date: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#2D3142",
//   },
//   time: {
//     fontSize: 14,
//     color: "#9A9CB8",
//   },
//   detailsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   conditionContainer: {
//     flex: 1,
//   },
//   condition: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#2D3142",
//   },
//   severity: {
//     fontSize: 14,
//     color: "#9A9CB8",
//     marginTop: 4,
//   },
//   scoreContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#FFF5F2",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 12,
//   },
//   score: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#FF8E6E",
//     marginLeft: 4,
//   },
// });

"use client";

import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { format } from "date-fns";
import { router, useFocusEffect } from "expo-router";

const MAIN_COLOR = "#FF8E6E"; // Coral color as the main theme
const HISTORY_STORAGE_KEY = "@DermaScanAI:history";

// Type definitions
type ScanResult = {
  id: string;
  imageUri: string;
  condition: string;
  confidence: number;
  severity: string;
  description: string;
  symptoms: string[];
  recommendations?: string;
  date: number;
};

export default function HistoryScreen({ navigation }: { navigation?: any }) {
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load history when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  // Load history from AsyncStorage
  const loadHistory = async () => {
    try {
      setLoading(true);
      const historyData = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
      if (historyData) {
        const parsedHistory = JSON.parse(historyData) as ScanResult[];
        // Sort by date, newest first
        setHistory(parsedHistory.sort((a, b) => b.date - a.date));
      }
    } catch (error) {
      console.error("Failed to load history:", error);
      Alert.alert("Error", "Failed to load scan history");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  // Delete a single history item
  const deleteHistoryItem = async (id: string) => {
    Alert.alert(
      "Delete Scan",
      "Are you sure you want to remove this scan from your history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedHistory = history.filter((item) => item.id !== id);
              await AsyncStorage.setItem(
                HISTORY_STORAGE_KEY,
                JSON.stringify(updatedHistory)
              );
              setHistory(updatedHistory);
            } catch (error) {
              console.error("Failed to delete history item:", error);
              Alert.alert("Error", "Failed to delete scan");
            }
          },
        },
      ]
    );
  };

  // Clear all history
  const clearAllHistory = () => {
    if (history.length === 0) return;

    Alert.alert(
      "Clear History",
      "Are you sure you want to clear all scan history? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);
              setHistory([]);
            } catch (error) {
              console.error("Failed to clear history:", error);
              Alert.alert("Error", "Failed to clear scan history");
            }
          },
        },
      ]
    );
  };

  // View a specific scan result
  const viewScanResult = (item: ScanResult) => {
    router.navigate({
      pathname: "/history_details_screen",
      params: {
        id: item.id,
        imageUri: item.imageUri,
        condition: item.condition,
        confidence: item.confidence,
        severity: item.severity,
        description: item.description,
        symptoms: JSON.stringify(item.symptoms),
        recommendations: JSON.stringify(item.recommendations),
        date: item.date,
      },
    });
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "MMM d, yyyy 'at' h:mm a");
  };

  // Get severity color
  const getSeverityColor = (severity: string): string => {
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
  };

  // Render empty state
  const renderEmptyState = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyStateContainer}>
        <FontAwesome5 name="history" size={64} color="#DDDDDD" />
        <Text style={styles.emptyStateTitle}>No Scan History</Text>
        <Text style={styles.emptyStateText}>
          Your previous skin scans will appear here. Start by scanning your skin
          condition.
        </Text>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => router.push("/scan_screen")}
          activeOpacity={0.9}
        >
          <Text style={styles.scanButtonText}>Scan Skin</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render a history item
  const renderHistoryItem = ({ item }: { item: ScanResult }) => (
    <TouchableOpacity
      style={styles.historyCard}
      onPress={() => viewScanResult(item)}
    >
      <Image source={{ uri: item.imageUri }} style={styles.historyImage} />
      <View style={styles.historyContent}>
        <View style={styles.historyHeader}>
          <Text style={styles.conditionName}>{item.condition}</Text>
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>{item.confidence}%</Text>
          </View>
        </View>
        <View style={styles.historyDetails}>
          <View style={styles.severityContainer}>
            <View
              style={[
                styles.severityIndicator,
                { backgroundColor: getSeverityColor(item.severity) },
              ]}
            />
            <Text style={styles.severityText}>{item.severity}</Text>
          </View>
          <Text style={styles.dateText}>{formatDate(item.date)}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteHistoryItem(item.id)}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        <Feather name="trash-2" size={18} color="#999" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan History</Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearAllHistory}
          disabled={history.length === 0}
        >
          <Text
            style={[
              styles.clearButtonText,
              history.length === 0 && styles.disabledText,
            ]}
          >
            Clear All
          </Text>
        </TouchableOpacity>
      </View>

      {/* History List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MAIN_COLOR} />
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderHistoryItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[MAIN_COLOR]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    color: "#333333",
    fontSize: 18,
    fontWeight: "600",
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    color: MAIN_COLOR,
    fontSize: 14,
    fontWeight: "500",
  },
  disabledText: {
    color: "#CCCCCC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  historyCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  historyImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  conditionName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  confidenceBadge: {
    backgroundColor: "rgba(255, 142, 110, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  confidenceText: {
    color: MAIN_COLOR,
    fontSize: 12,
    fontWeight: "500",
  },
  historyDetails: {
    flexDirection: "column",
    gap: 4,
  },
  severityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  severityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  severityText: {
    fontSize: 13,
    color: "#666666",
  },
  dateText: {
    fontSize: 12,
    color: "#999999",
  },
  deleteButton: {
    padding: 8,
    justifyContent: "center",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    minHeight: 400,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: 24,
  },
  scanButton: {
    backgroundColor: MAIN_COLOR,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  scanButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
});
