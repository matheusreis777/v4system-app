// src/components/alerts/toastConfig.tsx
import { View, Text, StyleSheet, Animated } from "react-native";
import { Feather } from "@expo/vector-icons";

const ToastItem = ({
  text1,
  text2,
  type,
}: {
  text1?: string;
  text2?: string;
  type: "success" | "error" | "info";
}) => {
  const slideAnim = new Animated.Value(50);

  Animated.timing(slideAnim, {
    toValue: 0,
    duration: 400,
    useNativeDriver: true,
  }).start();

  return (
    <Animated.View
      style={[
        styles.toast,
        type === "success"
          ? styles.success
          : type === "error"
            ? styles.error
            : styles.info,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Feather
        name={
          type === "success"
            ? "check-circle"
            : type === "error"
              ? "x-circle"
              : "info"
        }
        size={22}
        color="#fff"
      />

      <View style={{ marginLeft: 10 }}>
        {text1 && <Text style={styles.toastTitle}>{text1}</Text>}
        {text2 && <Text style={styles.toastDesc}>{text2}</Text>}
      </View>
    </Animated.View>
  );
};

const toastConfig = {
  success: (props: any) => <ToastItem {...props} type="success" />,
  error: (props: any) => <ToastItem {...props} type="error" />,
  info: (props: any) => <ToastItem {...props} type="info" />,
};

const styles = StyleSheet.create({
  toast: {
    width: "90%",
    flexDirection: "row",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
    elevation: 8,
  },
  toastTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  toastDesc: {
    color: "#fff",
    fontSize: 13,
    marginTop: 2,
  },
  success: { backgroundColor: "#16A34A" },
  error: { backgroundColor: "#DC2626" },
  info: { backgroundColor: "#2563EB" },
});

export default toastConfig;
