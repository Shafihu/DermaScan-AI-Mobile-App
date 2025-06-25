import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function HealthScoreCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Skin Health Score</Text>
      <View style={styles.scoreContainer}>
        <Text style={styles.score}>85</Text>
        <Text style={styles.maxScore}>/100</Text>
      </View>
      <View style={styles.trendContainer}>
        <MaterialCommunityIcons name="trending-up" size={20} color="#4CAF50" />
        <Text style={styles.trendText}>+5% from last scan</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    margin: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3142",
    marginBottom: 15,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 15,
  },
  score: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FF8E6E",
  },
  maxScore: {
    fontSize: 20,
    color: "#9A9CB8",
    marginLeft: 4,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  trendText: {
    fontSize: 14,
    color: "#4CAF50",
    marginLeft: 4,
  },
});
