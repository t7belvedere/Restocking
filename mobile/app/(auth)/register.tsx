import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator,
} from "react-native";
import { Link } from "expo-router";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export default function Register() {
  const { signUp } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("");
    setLoading(true);
    const res = await signUp(email, password);
    if (res.error) {
      setError(res.error);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <View className="flex-1 items-center justify-center bg-cream px-8">
        <Text className="text-center text-2xl font-bold text-ink">
          {t.checkEmail}
        </Text>
        <Link href="/(auth)/login" className="mt-6">
          <Text className="text-sm font-bold text-primary underline">
            {t.signIn}
          </Text>
        </Link>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-cream"
    >
      <ScrollView
        contentContainerClassName="flex-1 justify-center px-8"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-10">
          <Text className="font-extrabold text-5xl text-ink tracking-tighter">
            restocking
          </Text>
          <Text className="mt-2 text-lg text-ink-soft">{t.register}</Text>
        </View>
        <View className="gap-4">
          <Text className="text-sm font-semibold text-ink">{t.email}</Text>
          <TextInput
            className="mb-2 rounded-lg border-2 border-ink bg-paper px-4 py-3.5 text-base text-ink"
            placeholder="hello@example.com"
            placeholderTextColor="#737373"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />
          <Text className="text-sm font-semibold text-ink">{t.password}</Text>
          <TextInput
            className="mb-2 rounded-lg border-2 border-ink bg-paper px-4 py-3.5 text-base text-ink"
            placeholder="..."
            placeholderTextColor="#737373"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={handleRegister}
          />
          {error ? <Text className="text-sm text-destructive">{error}</Text> : null}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            className="mt-2 rounded-lg border-2 border-ink bg-primary px-6 py-4 shadow-brutal"
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-center text-lg font-bold text-primary-foreground">
                {t.signUp}
              </Text>
            )}
          </TouchableOpacity>
        </View>
        <View className="mt-4 flex-row justify-center gap-x-1">
          <Text className="text-sm text-ink-soft">{t.hasAccount} </Text>
          <Link href="/(auth)/login">
            <Text className="text-sm font-bold text-primary underline">
              {t.signIn}
            </Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
