import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "./../contexts/ThemeContext";

export default function MeuBotao() {
  const { theme, toggleTheme } = useTheme();

  return (
    <TouchableOpacity style={styles.container} onPress={toggleTheme}>
      <Feather
        name={theme.mode === "dark" ? "sun" : "moon"}
        size={18}
        color={theme.text}
        style={styles.icon}
      />
      <Text style={[styles.text, { color: theme.text }]}>
        {theme.mode === "dark" ? "Modo Claro" : "Modo Escuro"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  icon: {
    marginRight: 16,
  },
  text: {
    fontSize: 16,
  },
});
