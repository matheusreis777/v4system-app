import { Stack } from "expo-router";
import { Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { ThemeProvider } from "../contexts/ThemeContext";
import { AuthProvider } from "../contexts/AuthContext";
import { LoadingProvider } from "../contexts/LoadingContext";
import Toast from "react-native-toast-message";
import toastConfig from "../components/alerts/toastConfig";
import { LookupProvider } from "../contexts/LookupContext";
import { LookupProviderEstoque } from "../contexts/LookupEstoqueContext";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { registerForPushNotificationsAsync } from "../config/pushNotification";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Barlow-Regular": require("../../assets/fonts/Barlow-Regular.ttf"),
    "Barlow-Medium": require("../../assets/fonts/Barlow-Medium.ttf"),
    "Barlow-SemiBold": require("../../assets/fonts/Barlow-SemiBold.ttf"),
    "Barlow-Bold": require("../../assets/fonts/Barlow-Bold.ttf"),
    "BarlowCondensed-SemiBold": require("../../assets/fonts/BarlowCondensed-SemiBold.ttf"),
    "BarlowCondensed-Bold": require("../../assets/fonts/BarlowCondensed-Bold.ttf"),
    "BarlowCondensed-Black": require("../../assets/fonts/BarlowCondensed-Black.ttf"),
    "Poppins-Regular": require("../../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../../assets/fonts/Poppins-Bold.ttf"),
  });

  const router = useRouter();

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync("#061D3D");
      NavigationBar.setButtonStyleAsync("light");
    }
  }, []);

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
        //console.log("✅ PUSH TOKEN (layout):", token);

        // listeners for debugging
        receivedSub = Notifications.addNotificationReceivedListener(
          (notification) => {
            //console.log("📬 notificação recebida:", notification);
          },
        );
        // helper so we can reuse for both the listener and initial response
        function handleResponse(response: any) {
          //console.log("🎯 resposta da notificação:", response);
          const data: any = response.notification.request.content.data;
          const route = data?.screen || data?.route || data?.url;
          if (route) {
            router.push(route);
          }
        }

        responseSub =
          Notifications.addNotificationResponseReceivedListener(handleResponse);

        // if the app was opened by tapping the notification (cold start) we also
        // need to handle that case
        const last = await Notifications.getLastNotificationResponseAsync();
        if (last) {
          handleResponse(last);
        }
      } catch (error) {
        //console.log("Push setup error (expected in Expo Go Android):", error);
      }
    }

    setup();

    return () => {
      receivedSub?.remove();
      responseSub?.remove();
    };
  }, [router]);

  if (!loaded && !error) {
    return null;
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
                <StatusBar style="light" />
                <Toast config={toastConfig} />
              </>
            </LookupProviderEstoque>
          </LookupProvider>
        </LoadingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
