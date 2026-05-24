import { Platform } from "react-native";
import { supabase } from "./supabase";

export async function registerForPushNotifications(userId: string) {
  if (Platform.OS === "web") {
    return null;
  }

  try {
    const Notifications = require("expo-notifications");
    const Device = require("expo-device");

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    if (!Device.isDevice) {
      return null;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
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
  } catch {
    return null;
  }
}
