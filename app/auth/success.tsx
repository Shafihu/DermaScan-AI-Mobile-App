import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function AuthSuccessScreen() {
  const router = useRouter();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Success animation sequence
    const animationSequence = Animated.sequence([
      // Fade in and scale up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Animate checkmark
      Animated.timing(checkmarkScale, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]);

    animationSequence.start();

    // Auto navigate after 2 seconds
    const timer = setTimeout(() => {
      router.replace("/(tabs)");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient
        colors={["#FF8E6E", "#FF6B4A", "#FF4A2C"]}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Floating Elements */}
        <Animated.View
          style={[
            styles.floatingElement,
            styles.floatingElement1,
            {
              opacity: fadeAnim,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.floatingElement,
            styles.floatingElement2,
            {
              opacity: fadeAnim,
            },
          ]}
        />

        {/* Main Content */}
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.successContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.2)", "rgba(255, 255, 255, 0.1)"]}
              style={styles.successCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Animated.View
                style={[
                  styles.checkmarkContainer,
                  {
                    transform: [{ scale: checkmarkScale }],
                  },
                ]}
              >
                <Ionicons name="checkmark-circle" size={80} color="white" />
              </Animated.View>

              <Text style={styles.successTitle}>Welcome to DermaScan!</Text>
              <Text style={styles.successMessage}>
                Your account has been successfully created. You're now ready to
                start your skin health journey.
              </Text>

              <View style={styles.featuresContainer}>
                <View style={styles.featureItem}>
                  <Ionicons
                    name="scan-outline"
                    size={20}
                    color="rgba(255, 255, 255, 0.9)"
                  />
                  <Text style={styles.featureText}>AI-Powered Analysis</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons
                    name="medical-outline"
                    size={20}
                    color="rgba(255, 255, 255, 0.9)"
                  />
                  <Text style={styles.featureText}>Professional Insights</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons
                    name="shield-checkmark"
                    size={20}
                    color="rgba(255, 255, 255, 0.9)"
                  />
                  <Text style={styles.featureText}>Secure & Private</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Continue Button */}
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#FF8E6E", "#FF6B4A"]}
                style={styles.continueButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.continueButtonText}>Continue to App</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Bottom Section */}
        <Animated.View
          style={[
            styles.bottomSection,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.securityInfo}>
            <Ionicons
              name="shield-checkmark"
              size={16}
              color="rgba(255, 255, 255, 0.8)"
            />
            <Text style={styles.securityText}>
              Your data is encrypted and secure
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: "space-between",
  },
  floatingElement: {
    position: "absolute",
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  floatingElement1: {
    width: 100,
    height: 100,
    top: "10%",
    left: "10%",
  },
  floatingElement2: {
    width: 60,
    height: 60,
    top: "20%",
    right: "15%",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  successContainer: {
    alignItems: "center",
    width: "100%",
  },
  successCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  checkmarkContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  featuresContainer: {
    width: "100%",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    marginLeft: 12,
  },
  buttonContainer: {
    marginTop: 40,
    width: "100%",
  },
  continueButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  continueButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  securityInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  securityText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    marginLeft: 6,
  },
});
