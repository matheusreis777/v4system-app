import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

type InputType = "cpf" | "phone" | "date" | "plate" | "default";

interface InputProps extends TextInputProps {
  label?: string;
  type?: InputType;
  isPassword?: boolean;

  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  leftIcon?: keyof typeof Feather.glyphMap;
}

export default function Input({
  label,
  type = "default",
  isPassword = false,
  value,
  onChangeText,
  containerStyle,
  inputStyle,
  labelStyle,
  leftIcon,
  ...rest
}: InputProps) {
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  /* =======================
     MÁSCARAS
  ======================= */

  const maskCPF = (text: string) =>
    text
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .slice(0, 14);

  const maskPhone = (text: string) =>
    text
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15);

  const maskDate = (text: string) =>
    text
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .slice(0, 10);

  const maskPlate = (text: string) => {
    let cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (cleaned.length > 7) cleaned = cleaned.slice(0, 7);

    return cleaned.length > 3
      ? `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
      : cleaned;
  };

  /* =======================
     HANDLER CENTRAL
  ======================= */

  const handleChange = (text: string) => {
    let formatted = text;

    switch (type) {
      case "cpf":
        formatted = maskCPF(text);
        break;
      case "phone":
        formatted = maskPhone(text);
        break;
      case "date":
        formatted = maskDate(text);
        break;
      case "plate":
        formatted = maskPlate(text);
        break;
    }

    onChangeText?.(formatted);
  };

  /* =======================
     STYLES
  ======================= */

  const styles = StyleSheet.create({
    container: {
      width: "100%",
      marginBottom: 16,
    },
    label: {
      marginBottom: 8,
      fontSize: 11,
      color: theme.text,
      fontFamily: "Barlow-Bold",
      textTransform: "uppercase",
      letterSpacing: 3,
    },
    inputWrapper: {
      position: "relative",
      justifyContent: "center",
    },
    input: {
      width: "100%",
      height: 52,
      borderRadius: 12,
      paddingHorizontal: leftIcon ? 44 : 16,
      paddingRight: isPassword ? 48 : 16,
      fontSize: 15,
      color: theme.text,
      backgroundColor: theme.mode === "light" ? "#EDF0F4" : "#1A4480",
      fontFamily: "Barlow-Regular",
      borderWidth: 1,
      borderColor: theme.borderColor,
    },
    eyeIcon: {
      position: "absolute",
      right: 16,
      height: "100%",
      justifyContent: "center",
    },
    leftIcon: {
      position: "absolute",
      left: 14,
      zIndex: 1,
    },
  });

  const placeholderTextColor = theme.mode === "dark" ? "#aaaaaa" : "#888888";

  /* =======================
     RENDER
  ======================= */

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

      <View style={styles.inputWrapper}>
        {leftIcon && (
          <View style={styles.leftIcon}>
            <Feather name={leftIcon} size={20} color={placeholderTextColor} />
          </View>
        )}
        <TextInput
          {...rest}
          value={value}
          style={[styles.input, inputStyle]}
          placeholderTextColor={placeholderTextColor}
          secureTextEntry={isPassword && !showPassword}
          onChangeText={handleChange}
        />

        {isPassword && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword((prev) => !prev)}
          >
            <Feather
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color={placeholderTextColor}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
