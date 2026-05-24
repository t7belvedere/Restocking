import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
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
    const { error } = await signUp(email, password);
    if (error) {
      setError(error);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <View className="flex-1 items-center justify-center bg-cream px-8">
        <Text className="text-center font-display text-3xl font-bold text-ink">
          {t.checkEmail}
        </Text>
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
          <Text className="font-display text-5xl font-extrabold text-ink tracking-tighter">
            restocking
          </Text>
          <Text className="mt-2 font-sans text-lg text-ink-soft">
            {t.register}
          </Text>
        </View>

        <View className="gap-4">
          <View>
            <Text className="mb-2 font-sans text-sm font-semibold text-ink">
              {t.email}
            </Text>
            <TextInput
              className="rounded-lg border-2 border-ink bg-paper px-4 py-3.5 font-sans text-base text-ink"
              placeholder="hello@example.com"
              placeholderTextColor="#737373"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View>
            <Text className="mb-2 font-sans text-sm font-semibold text-ink">
              {t.password}
            </Text>
            <TextInput
              className="rounded-lg border-2 border-ink bg-paper px-4 py-3.5 font-sans text-base text-ink"
              placeholder="········"
              placeholderTextColor="#737373"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={handleRegister}
            />
          </View>

          {error ? (
            <Text className="font-sans text-sm text-destructive">{error}</Text>
          ) : null}

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            className="mt-2 rounded-lg border-2 border-ink bg-primary px-6 py-4 shadow-brutal active:translate-y-0.5"
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-center font-display text-lg font-bold text-primary-foreground">
                {t.signUp}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="mt-6 flex-row justify-center gap-x-1">
          <Text className="font-sans text-sm text-ink-soft">
            {t.hasAccount}
          </Text>
          <Link href="/(auth)/login" className="py-1">
            <Text className="font-sans text-sm font-bold text-primary underline">
              {t.signIn}
            </Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
