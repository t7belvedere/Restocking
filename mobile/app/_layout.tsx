import { useState, useEffect } from "react";
import "../global.css";
import { Stack } from "expo-router";
import { AuthProvider } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";
import {
  useFonts,
  BricolageGrotesque_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from "@expo-google-fonts/bricolage-grotesque";
import {
  DMSans_300Light,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import {
  DMMono_400Regular,
  DMMono_500Medium,
} from "@expo-google-fonts/dm-mono";
import { Italiana_400Regular } from "@expo-google-fonts/italiana";
import { PlayfairDisplay_400Regular } from "@expo-google-fonts/playfair-display";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    BricolageGrotesque_400Regular,
    BricolageGrotesque_500Medium,
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    DMSans_300Light,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    DMMono_400Regular,
    DMMono_500Medium,
    Italiana_400Regular,
    PlayfairDisplay_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  // If fonts don't load within 3s, show app anyway with system fonts
  const [showAnyway, setShowAnyway] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowAnyway(true), 3000);
    return () => clearTimeout(t);
  }, []);

  if (!showAnyway && !fontsLoaded) {
    return null;
  }

  return (
    <I18nProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </AuthProvider>
    </I18nProvider>
  );
}
