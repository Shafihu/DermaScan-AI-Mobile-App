import type React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Colors } from "@/constants/Colors";

type SimpleLoadingOverlayProps = {
  message?: string;
};

const SimpleLoadingOverlay: React.FC<SimpleLoadingOverlayProps> = ({
  message = "Processing...",
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator
          size="large"
          color={Colors.light.tint}
          style={styles.spinner}
        />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  content: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    width: Dimensions.get("window").width * 0.8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
    textAlign: "center",
  },
});

export default SimpleLoadingOverlay;
