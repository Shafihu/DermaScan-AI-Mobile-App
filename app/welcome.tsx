import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    const animations = [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ];

    Animated.parallel(animations).start();
  }, []);

  const handleGetStarted = () => {
    router.push("/onboarding");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ImageBackground
        source={require("@/assets/images/welcome.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Gradient Overlay - Darker at bottom */}
        <LinearGradient
          colors={[
            "rgba(0, 0, 0, 0.1)",
            "rgba(0, 0, 0, 0.3)",
            "rgba(0, 0, 0, 0.6)",
            "rgba(0, 0, 0, 0.8)",
          ]}
          style={styles.gradientOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {/* Top Section - Logo and App Name */}
          <Animated.View
            style={[
              styles.topSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <View style={styles.logoBackground}>
                <Ionicons name="scan-outline" size={60} color="white" />
              </View>
            </Animated.View>

            <Animated.View
              style={[
                styles.appNameContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <ThemedText style={styles.appName}>DermaScan</ThemedText>
              <ThemedText style={styles.tagline}>
                AI-Powered Skin Health
              </ThemedText>
            </Animated.View>
          </Animated.View>

          {/* Bottom Section - Button and Terms */}
          <Animated.View
            style={[
              styles.bottomSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={handleGetStarted}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#FF8E6E", "#FF6B4A"]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <ThemedText style={styles.buttonText}>Get Started</ThemedText>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.termsContainer}>
              <ThemedText style={styles.termsText}>
                By continuing, you agree to our Terms of Service and Privacy
                Policy
              </ThemedText>
            </View>
          </Animated.View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    flex: 1,
    justifyContent: "space-between",
  },
  topSection: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 120,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  appNameContainer: {
    alignItems: "center",
  },
  appName: {
    fontSize: 48,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
    paddingTop: 24,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    includeFontPadding: false,
  },
  tagline: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    includeFontPadding: false,
  },
  bottomSection: {
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  getStartedButton: {
    borderRadius: 30,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 40,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
  termsContainer: {
    alignItems: "center",
  },
  termsText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
