import React, { createContext, useContext, useState, ReactNode } from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";

interface LoadingContextData {
  loading: boolean;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextData>(
  {} as LoadingContextData,
);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<string>("Carregando...");

  const showLoading = (text?: string) => {
    setMessage(text || "Carregando...");
    setVisible(true);
  };

  const hideLoading = () => {
    setVisible(false);
    setMessage("Carregando...");
  };

  return (
    <LoadingContext.Provider value={{ loading, showLoading, hideLoading }}>
      {children}

      {visible && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.text}>{message}</Text>
        </View>
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading deve estar dentro de LoadingProvider");
  }
  return context;
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  text: {
    marginTop: 12,
    color: "#fff",
    fontSize: 14,
  },
});
