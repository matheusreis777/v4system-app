import { Stack } from "expo-router";
import { ThemeProvider } from "../contexts/ThemeContext";
import { AuthProvider } from "../contexts/AuthContext";
import { LoadingProvider } from "../contexts/LoadingContext";
import LoadingOverlay from "../components/LoadingOverlay";
import Toast from "react-native-toast-message";
import toastConfig from "../components/alerts/toastConfig";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LoadingProvider>
          <>
            <Stack screenOptions={{ headerShown: false }} />
            <LoadingOverlay />
            <Toast config={toastConfig} />
          </>
        </LoadingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
