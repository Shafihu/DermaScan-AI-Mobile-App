/* eslint-disable react-hooks/exhaustive-deps */
"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  CameraView,
  type CameraType,
  useCameraPermissions,
  type FlashMode,
} from "expo-camera";
import { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  Image,
  Dimensions,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { saveScanToHistory } from "@/utils/storage-utils";
import { getSkinConditionAnalysis } from "@/services/geminiService";
import EnhancedLoadingOverlay from "@/components/EnhancedLoadingOverlay";

const { width } = Dimensions.get("window");
const API_ENDPOINT = "http://172.20.10.4:5000/api/scan";

// Fallback data in case API is unavailable
const fallbackAnalysisResult = {
  condition: "Eczema",
  confidence: 92,
  severity: "Moderate",
  description:
    "Eczema (atopic dermatitis) is a condition that makes your skin red and itchy. It's common in children but can occur at any age. Eczema is long lasting (chronic) and tends to flare periodically.",
  symptoms: [
    "Dry, sensitive skin",
    "Intense itching",
    "Red, inflamed skin",
    "Recurring rash",
    "Scaly patches",
  ],
  recommendations: [
    {
      title: "Moisturize daily",
      description:
        "Apply moisturizer at least twice daily to help heal the skin and prevent dryness.",
      icon: "droplet",
    },
    {
      title: "Avoid triggers",
      description:
        "Identify and avoid things that trigger your eczema, such as certain soaps, detergents, or foods.",
      icon: "alert-circle",
    },
    {
      title: "Apply prescribed medication",
      description:
        "Use corticosteroid creams or ointments as directed by your healthcare provider.",
      icon: "package",
    },
  ],
};

export default function ScanScreen() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Analyzing skin...");
  const cameraRef = useRef<any>(null);
  const isProcessing = useRef(false);

  const controller = new AbortController();
  const signal = controller.signal;

  // Process the scan
  useEffect(() => {
    if (!isScanning || !capturedImage || isProcessing.current) return;

    let isMounted = true;
    isProcessing.current = true;
    setIsLoading(true);

    const processScan = async () => {
      try {
        setLoadingMessage("Analyzing skin...");
        console.log("Sending image to server:", capturedImage);

        const formData: any = new FormData();
        formData.append("scan_image", {
          uri: capturedImage,
          name: "skin.jpg",
          type: "image/jpeg",
        });

        const res = await fetch(API_ENDPOINT, {
          method: "POST",
          signal,
          body: formData,
        });

        const scanData = await res.json();
        if (scanData.error) {
          throw new Error(scanData.message || "Could not analyze the image.");
        }

        setLoadingMessage("Generating recommendations...");
        console.log("Generating recommendatons...");

        const geminiData = {
          condition: scanData.condition || "Unknown",
          confidence: scanData.confidence || 0,
          severity: scanData.severity || "Unknown",
        };

        const geminiResult = await getSkinConditionAnalysis(geminiData);

        const finalResult = {
          condition: geminiResult.condition || scanData.condition,
          confidence: geminiResult.confidence || scanData.confidence,
          severity: geminiResult.severity || scanData.severity,
          description:
            geminiResult.description ||
            `${scanData.condition || "This condition"} was detected with ${
              scanData.confidence || 0
            }% confidence.`,
          symptoms: geminiResult.symptoms?.length
            ? geminiResult.symptoms
            : scanData.symptoms || [],
          recommendations: geminiResult.recommendations?.length
            ? geminiResult.recommendations
            : scanData.recommendations || [],
        };

        setLoadingMessage("Saving results...");
        await saveScanToHistory(
          capturedImage,
          finalResult.condition,
          finalResult.confidence,
          finalResult.severity,
          finalResult.description,
          finalResult.symptoms,
          finalResult.recommendations
        );

        if (isMounted) {
          // First hide the loading overlay
          setIsLoading(false);

          // Then navigate after a very short delay
          setTimeout(() => {
            if (isMounted) {
              console.log("Navigating to result screen...");
              router.navigate({
                pathname: "/result_screen",
                params: {
                  imageUri: capturedImage,
                  analysisResult: JSON.stringify(finalResult) as any,
                },
              });

              // Reset state after navigation
              setIsScanning(false);
              isProcessing.current = false;
            }
          }, 50);
        }
      } catch (err: any) {
        console.log("Error during scan:", err.message);

        if (isMounted) {
          setIsLoading(false);
          setIsScanning(false);
          isProcessing.current = false;

          Alert.alert(
            "Scan Failed",
            `Analysis failed: ${err.message}\n\nPlease ensure:
1. You're connected to the internet
2. The image is clear and well-lit
3. You're focusing on the affected area`
          );
        }
      }
    };

    processScan();

    return () => {
      isMounted = false;
    };
  }, [isScanning, capturedImage]);

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.permissionText}>Initializing camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          DermaScanAI needs camera access to scan and analyze your skin
          condition
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const toggleCameraFacing = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const toggleFlash = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlash((current) => (current === "off" ? "on" : "off"));
  };

  const takePicture = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: true,
        });

        // Reset all flags when taking a new picture
        isProcessing.current = false;
        setCapturedImage(photo.uri);
        setIsScanning(true);
      } catch (error) {
        console.log("Error taking picture:", error);
      }
    }
  };

  const cancelRequest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    controller.abort();
    setIsLoading(false);
    setIsScanning(false);
    setCapturedImage(null);
    // isProcessing.current = false;
  };

  const cancelScan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(false);
    setIsScanning(false);
    setCapturedImage(null);
    isProcessing.current = false;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {!isScanning ? (
        <>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <MaterialIcons name="arrow-back-ios" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Scan Skin</Text>
            <View style={styles.headerControls}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={toggleFlash}
              >
                <Ionicons
                  name={flash === "on" ? "flash" : "flash-off"}
                  size={24}
                  color="#333"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={toggleCameraFacing}
              >
                <Ionicons
                  name="camera-reverse-outline"
                  size={24}
                  color="#333"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.cameraContainer}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={facing}
              flash={flash}
            >
              <View style={styles.scanOverlay}>
                <View style={styles.scanArea}>
                  <View style={styles.cornerTL} />
                  <View style={styles.cornerTR} />
                  <View style={styles.cornerBL} />
                  <View style={styles.cornerBR} />
                </View>
              </View>
            </CameraView>
          </View>

          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Scanning Instructions</Text>
            <Text style={styles.instructionsText}>
              Position the affected skin area within the frame and ensure good
              lighting for accurate analysis
            </Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <View style={styles.tipContainer}>
              <FontAwesome5
                name="lightbulb"
                size={16}
                color={Colors.light.tint}
              />
              <Text style={styles.tipText}>Hold steady for best results</Text>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.scanningContainer}>
          {capturedImage && (
            <Image
              source={{ uri: capturedImage }}
              style={styles.previewImage}
            />
          )}

          {/* Simple loading overlay */}
          {isLoading && <EnhancedLoadingOverlay message={loadingMessage} />}

          {/* Cancel button */}
          <TouchableOpacity
            style={styles.cancelScanButton}
            onPress={cancelRequest}
          >
            <Text style={styles.cancelScanButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    color: "#333333",
    fontSize: 18,
    fontWeight: "600",
  },
  headerControls: {
    flexDirection: "row",
  },
  cameraContainer: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 20,
    margin: 16,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  camera: {
    flex: 1,
  },
  scanOverlay: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 20,
    position: "relative",
  },
  cornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: Colors.light.tint,
    borderTopLeftRadius: 20,
  },
  cornerTR: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: Colors.light.tint,
    borderTopRightRadius: 20,
  },
  cornerBL: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: Colors.light.tint,
    borderBottomLeftRadius: 20,
  },
  cornerBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: Colors.light.tint,
    borderBottomRightRadius: 20,
  },
  instructionsContainer: {
    padding: 20,
  },
  instructionsTitle: {
    color: "#333333",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  instructionsText: {
    color: "#666666",
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingBottom: 40,
    alignItems: "center",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,142,110,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  captureButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.light.tint,
  },
  tipContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,142,110,0.1)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  tipText: {
    color: "#666666",
    fontSize: 14,
    marginLeft: 8,
  },
  scanningContainer: {
    flex: 1,
    position: "relative",
  },
  previewImage: {
    flex: 1,
    resizeMode: "cover",
  },

  cancelScanButton: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    marginHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1001,
  },
  cancelScanButtonText: {
    color: "#666666",
    fontSize: 16,
    fontWeight: "500",
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionTitle: {
    color: "#333333",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  permissionText: {
    color: "#666666",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
