import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Animated,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const animations = [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ];

    Animated.parallel(animations).start();
  }, []);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }
    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsEmailSent(true);
    } catch (error) {
      Alert.alert("Error", "Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  const handleResendEmail = () => {
    setIsEmailSent(false);
    setEmail("");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
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
                transform: [{ translateY: slideAnim }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.floatingElement,
              styles.floatingElement2,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          />

          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToLogin}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <Animated.View
              style={[
                styles.logoContainer,
                {
                  transform: [{ scale: logoScale }],
                },
              ]}
            >
              <LinearGradient
                colors={[
                  "rgba(255, 255, 255, 0.2)",
                  "rgba(255, 255, 255, 0.1)",
                ]}
                style={styles.logoBackground}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="lock-open-outline" size={50} color="white" />
              </LinearGradient>
            </Animated.View>

            <Text style={styles.appName}>DermaScan</Text>
            <Text style={styles.tagline}>Reset your password</Text>
          </Animated.View>

          {/* Form */}
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.formCard}>
              {!isEmailSent ? (
                <>
                  <Text style={styles.formTitle}>Forgot Password?</Text>
                  <Text style={styles.formSubtitle}>
                    Enter your email address and we'll send you a link to reset
                    your password.
                  </Text>

                  {/* Email Input */}
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color="#666"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Email Address"
                      placeholderTextColor="#999"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  {/* Reset Button */}
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={handleResetPassword}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={["#FF8E6E", "#FF6B4A"]}
                      style={styles.resetButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      {isLoading ? (
                        <Text style={styles.resetButtonText}>Sending...</Text>
                      ) : (
                        <>
                          <Text style={styles.resetButtonText}>
                            Send Reset Link
                          </Text>
                          <Ionicons name="mail" size={20} color="white" />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.successContainer}>
                    <View style={styles.successIcon}>
                      <Ionicons
                        name="checkmark-circle"
                        size={60}
                        color="#4CAF50"
                      />
                    </View>
                    <Text style={styles.successTitle}>Email Sent!</Text>
                    <Text style={styles.successMessage}>
                      We've sent a password reset link to{" "}
                      <Text style={styles.emailHighlight}>{email}</Text>
                    </Text>
                    <Text style={styles.successSubtitle}>
                      Please check your email and follow the instructions to
                      reset your password.
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.resendButton}
                    onPress={handleResendEmail}
                  >
                    <Text style={styles.resendButtonText}>Resend Email</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Back to Login */}
              <View style={styles.backToLoginContainer}>
                <Text style={styles.backToLoginText}>
                  Remember your password?{" "}
                </Text>
                <TouchableOpacity onPress={handleBackToLogin}>
                  <Text style={styles.backToLoginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Bottom Section */}
          <Animated.View
            style={[
              styles.bottomSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
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
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
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
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 24,
    padding: 8,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 24,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  formCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
  },
  formSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 16,
  },
  resetButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 32,
    shadowColor: "#FF8E6E",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  resetButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  resetButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
  successContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 12,
  },
  emailHighlight: {
    fontWeight: "600",
    color: "#333",
  },
  successSubtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
  resendButton: {
    alignItems: "center",
    marginBottom: 32,
  },
  resendButtonText: {
    fontSize: 16,
    color: "#FF8E6E",
    fontWeight: "600",
  },
  backToLoginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  backToLoginText: {
    fontSize: 14,
    color: "#666",
  },
  backToLoginLink: {
    fontSize: 14,
    color: "#FF8E6E",
    fontWeight: "600",
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
