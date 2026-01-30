import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { useLoading } from "../contexts/LoadingContext";

export default function LoadingOverlay() {
  const { loading } = useLoading();

  if (!loading) return null;

  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color="#2563EB" />
      <Text style={styles.text}>Carregando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  text: {
    marginTop: 10,
    color: "#fff",
    fontSize: 14,
  },
});
