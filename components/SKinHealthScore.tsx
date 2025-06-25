import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

const MAIN_COLOR = "#FF8E6E";

interface Props {
  score: number;
  streakDays: number;
  onInfoPress: () => void;
}

export const SkinHealthScore = ({ score, streakDays, onInfoPress }: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Skin Health Score</Text>
        <TouchableOpacity onPress={onInfoPress}>
          <Text style={styles.infoLink}>Learn More</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.circle}>
          <Text style={styles.value}>{score}</Text>
          <Text style={styles.max}>/100</Text>
        </View>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Feather name="trending-up" size={16} color={MAIN_COLOR} />
            </View>
            <View>
              <Text style={styles.detailLabel}>Improving</Text>
              <Text style={styles.detailValue}>+3 points this month</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Feather name="calendar" size={16} color={MAIN_COLOR} />
            </View>
            <View>
              <Text style={styles.detailLabel}>Streak</Text>
              <Text style={styles.detailValue}>{streakDays} days of care</Text>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionText}>View Full Report</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    paddingBottom: 10,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  infoLink: {
    fontSize: 14,
    color: MAIN_COLOR,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${MAIN_COLOR}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  value: {
    fontSize: 28,
    fontWeight: "700",
    color: MAIN_COLOR,
  },
  max: {
    fontSize: 14,
    color: "#999999",
    marginTop: -5,
  },
  details: {
    flex: 1,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${MAIN_COLOR}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666666",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
  },
  actionButton: {
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    marginTop: 5,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: MAIN_COLOR,
  },
});
