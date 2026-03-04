import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

// helper that loads the notifications library on-demand.  this avoids the
// dangerous side-effects that occur when importing it in Expo Go on
// Android (the module throws an error immediately because the feature was
// removed).
async function loadNotifications() {
  // if we're running inside Expo Go on Android, there's no point importing
  // the package at all. calling `import(...)` would still trigger the
  // warning/error, so we bail first.
  if (Constants.appOwnership === "expo" && Platform.OS === "android") {
    throw new Error(
      "remote notifications are not supported in Expo Go on Android; use a dev or production build",
    );
  }
  return await import("expo-notifications");
}

/**
 * Central helper used throughout the app when we need a push token.
 *
 * - asks for permissions if necessary
 * - creates an Android channel
 * - takes care of the EAS projectId option so that tokens are valid
 *   both in Expo Go and in standalone/dev builds
 *
 * returns the token string or `null` if anything fails or the user
 * denies permission. Logs are kept for troubleshooting.
 */
export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  try {
    if (!Device.isDevice) {
      return null;
    }

    // skip completely when running in Expo Go on Android, since the
    // library will crash before we even have a chance to ask for
    // permissions. callers should be prepared to receive `null`.
    if (Constants.appOwnership === "expo" && Platform.OS === "android") {
      return null;
    }

    const Notifications = await loadNotifications();

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("Permissão de notificação negada");
      return null;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    const projectId =
      // expo constants moved in SDK 48; try both places for compatibility
      Constants?.expoConfig?.extra?.eas?.projectId ||
      // fallback for older SDKs
      (Constants.manifest as any)?.extra?.eas?.projectId;

    const tokenResp = await Notifications.getExpoPushTokenAsync({ projectId });
    return tokenResp.data;
  } catch (error) {
    return null;
  }
}
