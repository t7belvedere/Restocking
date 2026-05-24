import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { supabase } from "./supabase";

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotifications(userId: string) {
  if (!Device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync();
  const tokenString = token;

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("restocks", {
      name: "Restock Alerts",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
    });
  }

  // Store the push token in Supabase so the worker can use it
  const { error } = await supabase.from("push_tokens").upsert(
    {
      user_id: userId,
      token: tokenString,
      platform: Platform.OS,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    console.warn("Failed to store push token:", error.message);
  }

  return tokenString;
}
