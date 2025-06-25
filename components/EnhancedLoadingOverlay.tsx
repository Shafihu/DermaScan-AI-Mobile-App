/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import Lottie from "./Lottie";

type EnhancedLoadingOverlayProps = {
  message?: string;
};

const MAIN_COLOR = Colors.light.tint;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CONTENT_WIDTH = SCREEN_WIDTH * 0.8;
const PROGRESS_BAR_WIDTH = 100;

const EnhancedLoadingOverlay: React.FC<EnhancedLoadingOverlayProps> = ({
  message = "Processing...",
}) => {
  // Animation values
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Content pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Spinner animations
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Spinner scale animation
    Animated.loop(
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress bar animation
    Animated.loop(
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1600,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    return () => {
      pulseAnim.stopAnimation();
      spinAnim.stopAnimation();
      fadeAnim.stopAnimation();
      progressAnim.stopAnimation();
      glowAnim.stopAnimation();
      scaleAnim.stopAnimation();
    };
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "720deg"], // Double rotation for smoother effect
  });

  const progressTranslateX = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-PROGRESS_BAR_WIDTH, CONTENT_WIDTH],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.15],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.View
        style={[
          styles.content,
          {
            transform: [
              {
                scale: pulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.05],
                }),
              },
            ],
          },
        ]}
      >
        <Lottie src={"../assets/animations/Scanning_Loader.json"} />
        {/* <View style={styles.iconContainer}>
          <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />
          <Animated.View
            style={{ transform: [{ rotate: spin }, { scale: scaleAnim }] }}
          >
            <Feather name="loader" size={40} color={MAIN_COLOR} />
          </Animated.View>
        </View> */}

        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBarIndeterminate,
              {
                transform: [{ translateX: progressTranslateX }],
                width: PROGRESS_BAR_WIDTH,
              },
            ]}
          />
        </View>

        <Text style={styles.message}>{message}</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  content: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    width: CONTENT_WIDTH,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: MAIN_COLOR,
    borderRadius: 40,
  },
  progressBarContainer: {
    width: "100%",
    height: 4,
    backgroundColor: "#F0F0F0",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressBarIndeterminate: {
    height: "100%",
    backgroundColor: MAIN_COLOR,
    borderRadius: 2,
  },
  message: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
    textAlign: "center",
  },
});

export default EnhancedLoadingOverlay;
