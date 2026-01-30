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
      marginBottom: 14,
    },
    label: {
      marginBottom: 6,
      fontSize: 14,
      color: theme.text,
      fontFamily: "Poppins",
    },
    inputWrapper: {
      position: "relative",
      justifyContent: "center",
    },
    input: {
      width: "100%",
      height: 52,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.borderColor,
      paddingHorizontal: 16,
      paddingRight: isPassword ? 48 : 16,
      fontSize: 16,
      color: theme.text,
      backgroundColor: "transparent",
    },
    eyeIcon: {
      position: "absolute",
      right: 16,
      height: "100%",
      justifyContent: "center",
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
