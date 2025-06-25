import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Dimensions,
  StatusBar,
} from "react-native";
import {
  MaterialIcons,
  Feather,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { format } from "date-fns";
import { deleteHistoryItem } from "@/utils/storage-utils";
import { router, useGlobalSearchParams } from "expo-router";

const { width } = Dimensions.get("window");
const MAIN_COLOR = "#FF8E6E"; // Coral color as the main theme

export default function HistoryDetailScreen() {
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    id,
    condition,
    confidence,
    severity,
    imageUri,
    symptoms,
    description,
    recommendations,
    date: dateParam,
  }: {
    id: string;
    condition: string;
    confidence: string;
    severity: string;
    imageUri: string;
    symptoms: any;
    description: string;
    recommendations: any;
    date: any;
  } = useGlobalSearchParams();

  // Parse the recommendations and symptoms JSON string
  const parsedSymptoms = symptoms ? JSON.parse(symptoms) : [];
  const parsedRecommendations = recommendations
    ? JSON.parse(recommendations)
    : [];

  const date = dateParam ? parseInt(dateParam) : Date.now();

  // Update formatDate function to handle invalid dates
  const formatDate = (timestamp: number) => {
    try {
      return format(new Date(timestamp), "MMMM d, yyyy 'at' h:mm a");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Unknown date";
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `DermaScanAI Analysis from ${formatDate(
          date
        )}: ${condition} (${confidence}% confidence)`,
        url: imageUri,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Scan",
      "Are you sure you want to remove this scan from your history? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);
              await deleteHistoryItem(id);
              router.back();
            } catch (error) {
              console.error("Error deleting scan:", error);
              Alert.alert("Error", "Failed to delete scan");
              setIsDeleting(false);
            }
          },
        },
      ]
    );
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan History</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Feather name="share" size={22} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleDelete}
            disabled={isDeleting}
          >
            <Feather name="trash-2" size={22} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Badge */}
        <View style={styles.dateBadgeContainer}>
          <View style={styles.dateBadge}>
            <Feather name="calendar" size={14} color="#666" />
            <Text style={styles.dateBadgeText}>{formatDate(date)}</Text>
          </View>
        </View>

        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>{confidence}% Match</Text>
          </View>
        </View>

        {/* Diagnosis Section */}
        <View style={styles.diagnosisContainer}>
          <View style={styles.diagnosisHeader}>
            <Text style={styles.diagnosisTitle}>{condition}</Text>
            <View style={styles.severityContainer}>
              <View
                style={[
                  styles.severityIndicator,
                  { backgroundColor: getSeverityColor(severity) },
                ]}
              />
              <Text style={styles.severityText}>{severity} Severity</Text>
            </View>
          </View>

          <Text style={styles.diagnosisDescription}>
            {description || "No description available"}
          </Text>
        </View>

        {/* Symptoms Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Common Symptoms</Text>
          <View style={styles.symptomsContainer}>
            {parsedSymptoms.map((symptom: any, index: number) => (
              <View key={index} style={styles.symptomItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.symptomText}>{symptom}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recommendations Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <View style={styles.recommendationsContainer}>
            {parsedRecommendations.length > 0 &&
              parsedRecommendations.map(
                (recommendation: any, index: number) => (
                  <View key={index} style={styles.recommendationCard}>
                    <View style={styles.recommendationIconContainer}>
                      <MaterialCommunityIcons
                        name={recommendation.icon as any}
                        size={24}
                        color="#FFF"
                      />
                    </View>
                    <View style={styles.recommendationContent}>
                      <Text style={styles.recommendationTitle}>
                        {recommendation.title}
                      </Text>
                      <Text style={styles.recommendationDescription}>
                        {recommendation.description}
                      </Text>
                    </View>
                  </View>
                )
              )}
          </View>
        </View>

        {/* Timeline Section (Placeholder for future feature) */}
        <View style={styles.sectionContainer}>
          <View style={styles.timelineHeader}>
            <Text style={styles.sectionTitle}>Condition Timeline</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.timelinePlaceholder}>
            <Feather name="activity" size={24} color="#CCC" />
            <Text style={styles.timelinePlaceholderText}>
              Track this condition over time as you add more scans
            </Text>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <FontAwesome5 name="info-circle" size={16} color="#999" />
          <Text style={styles.disclaimerText}>
            This analysis is for informational purposes only and should not
            replace professional medical advice.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.primaryButtonText}>Scan Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleDelete}
            disabled={isDeleting}
          >
            <Text style={styles.secondaryButtonText}>
              {isDeleting ? "Deleting..." : "Delete from History"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    color: "#333333",
    fontSize: 18,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
  },
  scrollView: {
    flex: 1,
  },
  dateBadgeContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  dateBadgeText: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 6,
  },
  imageContainer: {
    position: "relative",
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  image: {
    width: "100%",
    height: width * 0.7,
    resizeMode: "cover",
  },
  confidenceBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  confidenceText: {
    color: MAIN_COLOR,
    fontWeight: "600",
    fontSize: 14,
  },
  diagnosisContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  diagnosisHeader: {
    marginBottom: 12,
  },
  diagnosisTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 4,
  },
  severityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  severityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  severityText: {
    fontSize: 14,
    color: "#666666",
  },
  diagnosisDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: "#666666",
  },
  sectionContainer: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 12,
  },
  symptomsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  symptomItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: MAIN_COLOR,
    marginRight: 10,
  },
  symptomText: {
    fontSize: 15,
    color: "#666666",
  },
  recommendationsContainer: {
    gap: 12,
  },
  recommendationCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  recommendationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: MAIN_COLOR,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  timelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  viewAllButton: {
    padding: 4,
  },
  viewAllText: {
    color: MAIN_COLOR,
    fontSize: 14,
    fontWeight: "500",
  },
  timelinePlaceholder: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  timelinePlaceholderText: {
    fontSize: 14,
    color: "#999999",
    textAlign: "center",
    marginTop: 12,
  },
  disclaimerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    padding: 16,
    borderRadius: 12,
    margin: 16,
    marginTop: 0,
  },
  disclaimerText: {
    fontSize: 12,
    color: "#999999",
    marginLeft: 8,
    flex: 1,
  },
  actionsContainer: {
    margin: 16,
    marginTop: 8,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: MAIN_COLOR,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  secondaryButtonText: {
    color: "#666666",
    fontSize: 16,
    fontWeight: "600",
  },
});
