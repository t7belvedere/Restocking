import "react-native-reanimated";
import "../global.css";

import { Stack } from "expo-router";
import { AuthProvider } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";
import { PushRegistration } from "@/components/push-registration";

export default function RootLayout() {
  return (
    <I18nProvider>
      <AuthProvider>
        <PushRegistration />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </AuthProvider>
    </I18nProvider>
  );
}
