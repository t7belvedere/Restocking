import { useState, useEffect } from "react";
import "../global.css";
import { Stack } from "expo-router";
import { AuthProvider } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";
import { PushRegistration } from "@/components/push-registration";
import {
  useFonts,
  BricolageGrotesque_800ExtraBold,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_600SemiBold,
} from "@expo-google-fonts/bricolage-grotesque";
import {
  DMSans_400Regular,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import { DMMono_400Regular } from "@expo-google-fonts/dm-mono";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    BricolageGrotesque_800ExtraBold,
    BricolageGrotesque_700Bold,
    BricolageGrotesque_600SemiBold,
    DMSans_400Regular,
    DMSans_600SemiBold,
    DMSans_700Bold,
    DMMono_400Regular,
  });

  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 3000);
    return () => clearTimeout(t);
  }, []);

  if (!fontsLoaded && !timedOut) {
    return null;
  }

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
