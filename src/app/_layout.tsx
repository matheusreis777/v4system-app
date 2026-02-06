import { Stack } from "expo-router";
import { ThemeProvider } from "../contexts/ThemeContext";
import { AuthProvider } from "../contexts/AuthContext";
import { LoadingProvider } from "../contexts/LoadingContext";
import Toast from "react-native-toast-message";
import toastConfig from "../components/alerts/toastConfig";
import { LookupProvider } from "../contexts/LookupContext";
import { LookupProviderEstoque } from "../contexts/LookupEstoqueContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LoadingProvider>
          <LookupProvider>
            <LookupProviderEstoque>
              <>
                <Stack
                  screenOptions={{ headerShown: false, animation: "fade" }}
                />
                <Toast config={toastConfig} />
              </>
            </LookupProviderEstoque>
          </LookupProvider>
        </LoadingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
