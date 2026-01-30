import { View, Text, Button, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Fonts } from "../styles/fonts";

export default function Painel() {
  return (
    <View style={styles.container}>
      <Text>Painel</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("Login")}
      >
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#2563EB", // azul moderno
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    letterSpacing: 0.3,
    fontFamily: Fonts.medium,
  },
});
