import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View, Text } from "react-native";

export default function GradientBackground() {
  return (
    <LinearGradient
      colors={["#1844a2", "#2563EB"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }} // horizontal
      style={styles.container}
    >
      <Text style={styles.text}>Conteúdo aqui</Text>
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
