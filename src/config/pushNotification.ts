import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Central helper used throughout the app when we need a push token.
 *
 * - asks for permissions if necessary
 * - creates an Android channel
 * - takes care of the EAS projectId option so that tokens are valid
 *   both in Expo Go (iOS only) and in dev/standalone builds
 *
 * returns the token string or `null` if anything fails or the user
 * denies permission. Logs are kept for troubleshooting.
 *
 * Note: On Expo Go + Android, loading the library will throw an error
 * which is caught here and returns null.
 */
export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  try {
    if (!Device.isDevice) {
      return null;
    }

    console.log("📱 INICIANDO REGISTRO DE PUSH...");

    // Dynamically import to avoid crashes in Expo Go Android at module load time
    const Notifications = await import("expo-notifications");
    console.log("✅ expo-notifications CARREGADO");

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    console.log("🔐 STATUS PERMISSÃO EXISTENTE:", existingStatus);
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log("🔐 STATUS PERMISSÃO APÓS REQUEST:", finalStatus);
    }

    if (finalStatus !== "granted") {
      return null;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
      console.log("📱 CANAL ANDROID CRIADO");
    }

    const projectId =
      // expo constants moved in SDK 48; try both places for compatibility
      Constants?.expoConfig?.extra?.eas?.projectId ||
      // fallback for older SDKs
      (Constants.manifest as any)?.extra?.eas?.projectId;

    console.log("🆔 PROJECT ID:", projectId);

    const tokenResp = await Notifications.getExpoPushTokenAsync({ projectId });
    console.log("🎫 TOKEN RESPONSE:", tokenResp);
    return tokenResp.data;
  } catch (error) {
    console.log("❌ ERRO NO REGISTER PUSH:", error);
    return null;
  }
}
