/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  type ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

const { width } = Dimensions.get("window");
const MAIN_COLOR = Colors.light.tint; // Using the app's theme color

type LoadingAnimationProps = {
  progress: number;
  message?: string;
  style?: ViewStyle;
};

const SKIN_FACTS = [
  "Your skin is the largest organ in your body.",
  "The average adult has about 21 square feet of skin.",
  "Your skin regenerates itself every 28 days.",
  "Skin accounts for about 15% of your body weight.",
  "Your skin contains more than 1,000 species of bacteria.",
  "Skin helps regulate your body temperature.",
  "UV rays can damage your skin even on cloudy days.",
  "Drinking water helps maintain skin elasticity.",
  "Your skin has three main layers: epidermis, dermis, and hypodermis.",
  "The skin on your eyelids is the thinnest on your body.",
  "Healthy skin has a pH level between 4.5 and 5.5.",
  "Your skin produces about one million skin cells every 40 minutes.",
];

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  progress,
  message = "Analyzing your skin...",
  style,
}) => {
  // Animation values
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;
  const factOpacity = useRef(new Animated.Value(0)).current;
  const factIndex = useRef(0);
  const [currentFact, setCurrentFact] = React.useState(SKIN_FACTS[0]);

  // Start animations
  useEffect(() => {
    // Pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Scan line animation
    Animated.loop(
      Animated.timing(scanLineAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Particle animation
    Animated.loop(
      Animated.timing(particleAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Fact rotation
    const rotateFacts = () => {
      // Fade out current fact
      Animated.timing(factOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // Change fact
        factIndex.current = (factIndex.current + 1) % SKIN_FACTS.length;
        setCurrentFact(SKIN_FACTS[factIndex.current]);

        // Fade in new fact
        Animated.timing(factOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    };

    // Initial fade in
    Animated.timing(factOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Rotate facts every 5 seconds
    const factInterval = setInterval(rotateFacts, 5000);
    return () => clearInterval(factInterval);
  }, []);

  // Derived animations
  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  const particleOpacity = particleAnim.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 1, 1, 0],
  });

  const particleTranslateY = particleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -100],
  });

  // Special animation for 100% completion
  const completionScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (progress >= 100) {
      Animated.sequence([
        Animated.timing(completionScale, {
          toValue: 1.2,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(completionScale, {
          toValue: 1,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [progress]);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        {/* Skin cell visualization */}
        <View style={styles.skinCellContainer}>
          <Animated.View
            style={[
              styles.pulseCircle,
              {
                transform: [
                  { scale: progress >= 100 ? completionScale : pulseScale },
                ],
                borderColor: progress >= 100 ? "#4CAF50" : MAIN_COLOR,
              },
            ]}
          />

          <View style={styles.skinCellInner}>
            <Animated.View
              style={[
                styles.skinCellCore,
                {
                  transform: [{ scale: progress >= 100 ? completionScale : 1 }],
                  backgroundColor:
                    progress >= 100
                      ? "rgba(76, 175, 80, 0.2)"
                      : "rgba(255, 142, 110, 0.2)",
                },
              ]}
            >
              {progress >= 100 ? (
                <Feather name="check" size={50} color="#4CAF50" />
              ) : (
                <Feather name="activity" size={50} color={MAIN_COLOR} />
              )}
            </Animated.View>
          </View>

          {/* Scan line - only show if not complete */}
          {progress < 100 && (
            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [{ translateY: scanLineTranslateY }],
                },
              ]}
            />
          )}

          {/* Particles - only show if not complete */}
          {progress < 100 &&
            [...Array(8)].map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.particle,
                  {
                    left: `${12.5 * (i + 1)}%`,
                    opacity: particleOpacity,
                    transform: [
                      { translateY: particleTranslateY },
                      { scale: 0.5 + Math.random() * 0.5 },
                    ],
                  },
                ]}
              />
            ))}
        </View>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {progress >= 100 ? "Analysis complete!" : message}
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground} />
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(progress, 100)}%`,
                  backgroundColor: progress >= 100 ? "#4CAF50" : MAIN_COLOR,
                },
              ]}
            />
          </View>
          <Text
            style={[
              styles.progressPercentage,
              { color: progress >= 100 ? "#4CAF50" : MAIN_COLOR },
            ]}
          >
            {Math.round(progress)}%
          </Text>
        </View>

        {/* Processing visualization - only show if not complete */}
        {progress < 100 && (
          <View style={styles.processingContainer}>
            {[...Array(3)].map((_, i) => (
              <View key={i} style={styles.processingDot} />
            ))}
          </View>
        )}

        {/* Skin facts */}
        <View style={styles.factContainer}>
          <Feather
            name="info"
            size={16}
            color={MAIN_COLOR}
            style={styles.factIcon}
          />
          <Animated.Text style={[styles.factText, { opacity: factOpacity }]}>
            {currentFact}
          </Animated.Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  content: {
    width: width * 0.85,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  skinCellContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 142, 110, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    position: "relative",
    overflow: "hidden",
  },
  pulseCircle: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: MAIN_COLOR,
    opacity: 0.5,
  },
  skinCellInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  skinCellCore: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 142, 110, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanLine: {
    position: "absolute",
    width: "100%",
    height: 2,
    backgroundColor: "rgba(255, 142, 110, 0.8)",
    top: 0,
  },
  particle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: MAIN_COLOR,
    bottom: "10%",
  },
  progressContainer: {
    width: "100%",
    marginBottom: 20,
  },
  progressText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    textAlign: "center",
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#F0F0F0",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: MAIN_COLOR,
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: "500",
    color: MAIN_COLOR,
    textAlign: "center",
  },
  processingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  processingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: MAIN_COLOR,
    marginHorizontal: 4,
    opacity: 0.6,
  },
  factContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 142, 110, 0.1)",
    borderRadius: 12,
    padding: 12,
  },
  factIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  factText: {
    fontSize: 14,
    color: "#666666",
    flex: 1,
    lineHeight: 20,
  },
});

export default LoadingAnimation;
