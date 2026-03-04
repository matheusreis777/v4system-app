import { Stack } from "expo-router";
import { ThemeProvider } from "../contexts/ThemeContext";
import { AuthProvider } from "../contexts/AuthContext";
import { LoadingProvider } from "../contexts/LoadingContext";
import Toast from "react-native-toast-message";
import toastConfig from "../components/alerts/toastConfig";
import { LookupProvider } from "../contexts/LookupContext";
import { LookupProviderEstoque } from "../contexts/LookupEstoqueContext";
import { useEffect } from "react";
import { registerForPushNotificationsAsync } from "../config/pushNotification";

export default function RootLayout() {
  useEffect(() => {
    let receivedSub: any;
    let responseSub: any;

    async function setup() {
      try {
        const Notifications = await import("expo-notifications");

        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });

        // configure pushes and token
        const token = await registerForPushNotificationsAsync();
        console.log("✅ PUSH TOKEN (layout):", token);

        // listeners for debugging
        receivedSub = Notifications.addNotificationReceivedListener(
          (notification) => {
            console.log("📬 notificação recebida:", notification);
          },
        );
        responseSub = Notifications.addNotificationResponseReceivedListener(
          (response) => {
            console.log("🎯 resposta da notificação:", response);
          },
        );
      } catch (error) {
        console.log("Push setup error (expected in Expo Go Android):", error);
      }
    }

    setup();

    return () => {
      receivedSub?.remove();
      responseSub?.remove();
    };
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
