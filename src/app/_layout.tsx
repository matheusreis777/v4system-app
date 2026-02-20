import { Stack } from "expo-router";
import { ThemeProvider } from "../contexts/ThemeContext";
import { AuthProvider } from "../contexts/AuthContext";
import { LoadingProvider } from "../contexts/LoadingContext";
import Toast from "react-native-toast-message";
import toastConfig from "../components/alerts/toastConfig";
import { LookupProvider } from "../contexts/LookupContext";
import { LookupProviderEstoque } from "../contexts/LookupEstoqueContext";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { useEffect } from "react";

// ✅ TEM QUE FICAR FORA DO COMPONENTE
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,

    // 👇 NOVO (obrigatório nas versões recentes)
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function getPushToken() {
  if (!Device.isDevice) {
    alert("Use um celular físico");
    return;
  }

  const { status } = await Notifications.requestPermissionsAsync();

  if (status !== "granted") {
    alert("Permissão negada para notificações");
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
}

export default function RootLayout() {
  // ✅ PEGA O TOKEN QUANDO O APP ABRE
  useEffect(() => {
    getPushToken();
  }, []);

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
