import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code) {
      setError("No auth code received.");
      return;
    }
    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error: err }) => {
        if (err) {
          setError(err.message);
        } else {
          router.replace("/(tabs)");
        }
      });
  }, [code]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-cream px-6">
        <Text className="font-sans-bold text-lg text-destructive">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-cream">
      <Text className="font-sans text-base text-ink/60">Signing you in…</Text>
    </View>
  );
}
