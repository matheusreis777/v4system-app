import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Fonts } from "../../styles/fonts";
import { useTheme } from "../../contexts/ThemeContext";

interface HeaderProps {
  title: string;

  leftIcon?: keyof typeof Feather.glyphMap;
  onLeftPress?: () => void;

  rightIcons?: {
    icon: keyof typeof Feather.glyphMap;
    onPress: () => void;
  }[];
}

export default function Header({
  title,
  leftIcon,
  onLeftPress,
  rightIcons = [],
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [empresa, setEmpresa] = useState<string | null>(null);

  useEffect(() => {
    async function carregarEmpresa() {
      const nomeEmpresa = await AsyncStorage.getItem("@nameempresa");
      setEmpresa(nomeEmpresa);
    }

    carregarEmpresa();
  }, []);

  return (
    <LinearGradient
      colors={["#061D3D", "#1A4480"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[
        styles.gradient,
        {
          paddingTop: insets.top + 12,
        },
      ]}
    >
      <View style={styles.content}>
        {/* ESQUERDA */}
        <View style={styles.side}>
          {leftIcon && (
            <TouchableOpacity onPress={onLeftPress} style={styles.iconButton}>
              <Feather name={leftIcon} size={28} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* CENTRO */}
        <View style={styles.center}>
          {empresa && (
            <Text
              style={[styles.subtitle, { fontFamily: Fonts.medium }]}
              numberOfLines={1}
              onPress={() => router.replace("/app/intro")}
            >
              {empresa}
            </Text>
          )}
          <Text style={[styles.title, { fontFamily: Fonts.condensedBold }]} numberOfLines={2}>
            {title.toUpperCase()}
          </Text>
        </View>

        {/* DIREITA */}
        <View style={[styles.side, styles.right]}>
          {rightIcons.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.onPress}
              style={styles.iconButton}
            >
              <Feather name={item.icon} size={22} color="#fff" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,

    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },

    elevation: Platform.OS === "android" ? 0 : 12,
    zIndex: 20,
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingBottom: 14,
  },

  side: {
    width: 60,
    flexDirection: "row",
    alignItems: "center",
  },

  right: {
    justifyContent: "flex-end",
  },

  center: {
    flex: 1,
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    color: "#ffffff",
    letterSpacing: 1.5,
  },

  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: "#FF8000",
    textTransform: "uppercase",
    letterSpacing: 2,
  },

  iconButton: {
    padding: 8,
  },
});
