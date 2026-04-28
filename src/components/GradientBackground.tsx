import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View, Text } from "react-native";

export default function GradientBackground() {
  return (
    <LinearGradient
      colors={["#061D3D", "#1A4480", "#CC6600", "#FF8000"]}
      locations={[0, 0.35, 0.65, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }} // horizontal
      style={styles.container}
    >
      <Text style={[styles.text, { fontFamily: "Barlow-Bold" }]}>ConnectCar System</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 18,
  },
});
