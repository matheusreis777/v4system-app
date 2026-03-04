import { Stack } from "expo-router";
import { ThemeProvider } from "../contexts/ThemeContext";
import { AuthProvider } from "../contexts/AuthContext";
import { LoadingProvider } from "../contexts/LoadingContext";
import Toast from "react-native-toast-message";
import toastConfig from "../components/alerts/toastConfig";
import { LookupProvider } from "../contexts/LookupContext";
import { LookupProviderEstoque } from "../contexts/LookupEstoqueContext";
import { useEffect } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { registerForPushNotificationsAsync } from "../config/pushNotification";

// note: we intentionally avoid importing `expo-notifications` at the
// module level because doing so on Android when running Expo Go causes a
// runtime crash (the feature was removed as of SDK53). we dynamically load
// it below once we've determined we're on a supported build.

export default function RootLayout() {
  useEffect(() => {
    // Android Expo Go no longer supports push; bail early to avoid the
    // import crash and inform developer.
    if (Constants.appOwnership === "expo" && Platform.OS === "android") {
      return;
    }

    let receivedSub: any;
    let responseSub: any;

    async function setup() {
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

      // listeners for debugging
      receivedSub = Notifications.addNotificationReceivedListener(
        (notification) => {},
      );
      responseSub = Notifications.addNotificationResponseReceivedListener(
        (response) => {},
      );
    }

    setup();

    return () => {
      receivedSub?.remove();
      responseSub?.remove();
    };
  }, []);

  async function configurarPush() {
    const token = await registerForPushNotificationsAsync();
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
