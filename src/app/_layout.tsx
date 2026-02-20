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
import { Platform } from "react-native";
import Constants from "expo-constants";

// ✅ HANDLER (fora do componente)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    configurarPush();
  }, []);

  async function configurarPush() {
    try {
      if (!Device.isDevice) {
        console.log("Use um dispositivo físico");
        return;
      }

      // ✅ ANDROID → CRIA CHANNEL (OBRIGATÓRIO)
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      // ✅ PERMISSÃO
      const { status } = await Notifications.requestPermissionsAsync();

      if (status !== "granted") {
        console.log("Permissão de notificação negada");
        return;
      }

      // ✅ TOKEN CORRETO PARA APK / EAS
      const token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: Constants.easConfig?.projectId,
        })
      ).data;

      console.log("✅ PUSH TOKEN:", token);
    } catch (error) {
      console.log("❌ Erro ao configurar push:", error);
    }
  }

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
