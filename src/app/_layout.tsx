import { Stack } from "expo-router";
import { ThemeProvider } from "../contexts/ThemeContext";
import { AuthProvider } from "../contexts/AuthContext";
import { LoadingProvider } from "../contexts/LoadingContext";
import { LookupProvider } from "../contexts/LookupContext";
import LoadingOverlay from "../components/LoadingOverlay";
import Toast from "react-native-toast-message";
import toastConfig from "../components/alerts/toastConfig";
import { AuthGate } from "../components/AuthGate";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LoadingProvider>
          <AuthGate>
            <LookupProvider>
              <>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    animation: "fade",
                  }}
                />
                <LoadingOverlay />
                <Toast config={toastConfig} />
              </>
            </LookupProvider>
          </AuthGate>
        </LoadingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
