import { Redirect } from "expo-router";
import { useAuth } from "../contexts/AuthContext";

export default function Index() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  return isAuthenticated ? (
    <Redirect href="/app/painel" />
  ) : (
    <Redirect href="/auth/login" />
  );
}
