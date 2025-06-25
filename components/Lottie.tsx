import React from "react";
import LottieView from "lottie-react-native";

export default function Lottie({ src }: { src: any }) {
  return (
    <LottieView
      source={require("@/assets/animations/Scanning_Loader.json")}
      style={{ width: 200, height: 200 }}
      autoPlay
      loop={true}
    />
  );
}
