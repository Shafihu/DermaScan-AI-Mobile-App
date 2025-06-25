import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface DiagnosisCardProps {
  condition: string;
  severity: string;
  confidence: number;
  recommendation: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

export default function DiagnosisCard({
  condition,
  severity,
  confidence,
  recommendation,
  icon,
}: DiagnosisCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={icon} size={24} color="#FF8E6E" />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.condition}>{condition}</Text>
          <Text style={styles.severity}>{severity}</Text>
        </View>
        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceText}>{confidence}%</Text>
          <Text style={styles.confidenceLabel}>confidence</Text>
        </View>
      </View>
      <Text style={styles.recommendation}>{recommendation}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FFF5F2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  condition: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3142",
  },
  severity: {
    fontSize: 14,
    color: "#9A9CB8",
    marginTop: 2,
  },
  confidenceContainer: {
    alignItems: "flex-end",
  },
  confidenceText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF8E6E",
  },
  confidenceLabel: {
    fontSize: 12,
    color: "#9A9CB8",
  },
  recommendation: {
    fontSize: 14,
    color: "#2D3142",
    lineHeight: 20,
  },
});
