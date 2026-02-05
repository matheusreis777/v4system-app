import { Stack, Redirect } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";

export default function AppLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  return <Stack screenOptions={{ headerShown: false, animation: "fade" }} />;
}
