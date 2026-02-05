import { ReactNode, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useRouter, usePathname } from "expo-router";

export function AuthGate({ children }: { children: ReactNode }) {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!pathname) return; // 🔥 FIX CRÍTICO

    if (!isAuthenticated && pathname !== "/login") {
      router.replace("/login");
    }

    if (isAuthenticated && pathname === "/login") {
      router.replace("/painel");
    }
  }, [loading, isAuthenticated, pathname]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}
