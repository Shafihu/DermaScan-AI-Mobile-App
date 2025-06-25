"use client";

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
  Dimensions,
  StatusBar,
} from "react-native";
import {
  MaterialIcons,
  Feather,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
// import { saveScanToHistory } from "@/utils/storage-utils";
import { router, useGlobalSearchParams } from "expo-router";
import { Colors } from "@/constants/Colors";

const { width } = Dimensions.get("window");

export default function ResultsScreen() {
  const [savedToLibrary, setSavedToLibrary] = useState(false);

  const { imageUri, analysisResult } = useGlobalSearchParams();
  const parsedResult = JSON.parse(analysisResult as string) || [];

  const handleShare = async () => {
    try {
      await Share.share({
        message: `DermaScanAI Analysis: ${parsedResult.condition} (${parsedResult.confidence}% confidence)`,
        url: imageUri as string,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleSave = () => {
    setSavedToLibrary(true);
    setTimeout(() => setSavedToLibrary(false), 2000);
  };

  const handleConsultDoctor = () => {
    router.navigate("/(tabs)/dermatologist");
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
        <Text style={styles.headerTitle}>Scan Results</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
          <Feather name="share" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri as string }} style={styles.image} />
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>
              {parsedResult.confidence}% Match
            </Text>
          </View>
        </View>

        {/* Diagnosis Section */}
        <View style={styles.diagnosisContainer}>
          <View style={styles.diagnosisHeader}>
            <View>
              <Text style={styles.diagnosisTitle}>
                {parsedResult.condition}
              </Text>
              <View style={styles.severityContainer}>
                <View
                  style={[
                    styles.severityIndicator,
                    {
                      backgroundColor: getSeverityColor(parsedResult.severity),
                    },
                  ]}
                />
                <Text style={styles.severityText}>
                  {parsedResult.severity} Severity
                </Text>
              </View>
            </View>
            {savedToLibrary ? (
              <View style={styles.savedBadge}>
                <Text style={styles.savedText}>Saved</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Feather name="bookmark" size={20} color={Colors.light.tint} />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.diagnosisDescription}>
            {parsedResult.description}
          </Text>
        </View>

        {/* Symptoms Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Common Symptoms</Text>
          <View style={styles.symptomsContainer}>
            {parsedResult.symptoms.map((symptom: string, index: number) => (
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
            {parsedResult.recommendations.map(
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
            onPress={handleConsultDoctor}
          >
            <Text style={styles.primaryButtonText}>
              Consult a Dermatologist
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>Scan Again</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper function to get color based on severity
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
  scrollView: {
    flex: 1,
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
    color: Colors.light.tint,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
  saveButton: {
    padding: 8,
  },
  savedBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savedText: {
    color: "#4CAF50",
    fontSize: 12,
    fontWeight: "500",
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
    backgroundColor: Colors.light.tint,
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
    backgroundColor: Colors.light.tint,
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
    backgroundColor: Colors.light.tint,
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
