import { Stack } from "expo-router";
import { AuthProvider } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
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
