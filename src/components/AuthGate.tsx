// components/AuthGate.tsx
import { ReactNode } from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { Redirect } from "expo-router";

export function AuthGate({ children }: { children: ReactNode }) {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <>{children}</>;
}
