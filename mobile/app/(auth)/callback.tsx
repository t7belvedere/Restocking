import { useEffect, useRef } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import * as Linking from "expo-linking";
import { supabase } from "@/lib/supabase";
import AppLogo from "@/components/AppLogo";

export default function CallbackScreen() {
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    async function handleCallback() {
      try {
        const url = await Linking.getInitialURL();

        if (!url) {
          router.replace("/(auth)/login");
          return;
        }

        const parsed = new URL(url);
        const hash = parsed.hash?.replace(/^#/, "") ?? "";
        const search = parsed.search ?? "";
        const combined = hash || search;

        if (!combined) {
          router.replace("/(auth)/login");
          return;
        }

        const params = new URLSearchParams(combined);
        const code = params.get("code");

        if (!code) {
          router.replace("/(auth)/login");
          return;
        }

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error("OAuth callback error:", error.message);
          router.replace("/(auth)/login");
          return;
        }

        router.replace("/(tabs)");
      } catch (err) {
        console.error("OAuth callback unexpected error:", err);
        router.replace("/(auth)/login");
      }
    }

    handleCallback();
  }, []);

  return (
    <View className="flex-1 bg-cream items-center justify-center gap-8">
      <AppLogo />
      <View className="items-center">
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text className="font-sans text-ink-soft mt-4">Connexion en cours...</Text>
      </View>
    </View>
  );
}
