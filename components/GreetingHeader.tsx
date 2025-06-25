import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function GreetingHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <Text style={styles.greeting}>Hello, Shafihu!</Text>
      <Text style={styles.subtitle}>
        Let&apos;s check your skin health today
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#FFF",
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2D3142",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#9A9CB8",
  },
});
