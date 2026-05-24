import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { Link } from "expo-router";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { brutalSm, brutal, brutalXl } from "@/lib/shadows";
import { supabase } from "@/lib/supabase";

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const { t } = useI18n();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignUp = async () => {
    setError("");
    setLoading(true);
    const { error: err } = await signUp(email.trim(), password);
    if (err) {
      setError(err);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          typeof window !== "undefined" ? window.location.origin : "",
      },
    });
  };

  if (success) {
    return (
      <View className="flex-1 items-center justify-center bg-cream px-6">
        {/* Lime circle with checkmark */}
        <View
          className="mb-8 h-24 w-24 items-center justify-center rounded-full bg-lime"
          style={brutal}
        >
          <Text className="font-display text-4xl text-ink">OK</Text>
        </View>
        <Text className="font-display text-3xl font-extrabold tracking-tighter text-ink">
          {t.checkEmailTitle}
        </Text>
        <Text className="mt-3 text-center font-sans text-base leading-relaxed text-ink/70">
          {t.checkEmail}
        </Text>
        <Link href="/(auth)/login" asChild>
          <Pressable className="mt-10">
            <Text className="font-mono text-xs uppercase tracking-[0.2em] text-ink/60">
              {t.back}
            </Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-cream"
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="px-6 py-12">
        {/* Eyebrow badge */}
        <View className="mb-6 self-start flex-row items-center gap-2 rounded-full border-2 border-ink bg-paper px-4 py-1.5">
          <View className="h-2 w-2 rounded-full bg-orange" />
          <Text className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink">
            {t.register}
          </Text>
        </View>

        {/* Heading */}
        <Text className="font-display text-5xl font-extrabold tracking-tighter text-ink">
          {t.createAccount}
        </Text>
        <Text className="mt-2 font-sans text-base leading-relaxed text-ink/70">
          {t.registerSubtitle}
        </Text>

        {/* Form card */}
        <View
          className="mt-8 rounded-3xl border-2 border-ink bg-paper p-7"
          style={brutalXl}
        >
          {/* Logo wordmark */}
          <View className="mb-8 items-center">
            <View className="flex-row items-baseline">
              <Text className="font-display text-2xl tracking-tighter text-ink">
                restocking
              </Text>
              <Text className="font-display text-2xl tracking-tighter text-orange">
                .
              </Text>
            </View>
          </View>

          {/* Google OAuth button */}
          <Pressable
            onPress={handleGoogleSignIn}
            className="h-12 w-full flex-row items-center justify-center rounded-xl border-2 border-ink bg-paper"
            style={brutal}
          >
            <Text className="font-display text-sm font-bold uppercase tracking-widest text-ink">
              {t.googleContinue}
            </Text>
          </Pressable>

          {/* Divider */}
          <View className="my-6 flex-row items-center gap-3">
            <View className="h-px flex-1 bg-ink/15" />
            <Text className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/50">
              {t.orContinueWith}
            </Text>
            <View className="h-px flex-1 bg-ink/15" />
          </View>

          {/* Error message */}
          {error !== "" && (
            <View className="mb-4 rounded-xl border-2 border-destructive bg-destructive/10 px-4 py-3">
              <Text className="font-sans text-sm font-semibold text-destructive">
                {error}
              </Text>
            </View>
          )}

          {/* Email field */}
          <View className="mb-4">
            <Text className="mb-2 font-display text-xs font-bold uppercase tracking-[0.2em] text-ink">
              {t.email}
            </Text>
            <TextInput
              className="h-12 rounded-xl border-2 border-ink bg-paper px-4 font-sans text-base text-ink"
              style={brutalSm}
              placeholder="ton@email.com"
              placeholderTextColor="rgba(11,11,11,0.35)"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              inputMode="email"
              editable={!loading}
            />
          </View>

          {/* Password field */}
          <View className="mb-2">
            <Text className="mb-2 font-display text-xs font-bold uppercase tracking-[0.2em] text-ink">
              {t.password}
            </Text>
            <TextInput
              className="h-12 rounded-xl border-2 border-ink bg-paper px-4 font-sans text-base text-ink"
              style={brutalSm}
              placeholder="••••••••"
              placeholderTextColor="rgba(11,11,11,0.35)"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              secureTextEntry
              editable={!loading}
            />
          </View>

          {/* Submit button */}
          <Pressable
            onPress={handleSignUp}
            disabled={loading || !email || !password}
            className="mt-6 h-12 w-full items-center justify-center rounded-xl border-2 border-ink bg-ink"
            style={brutal}
          >
            {loading ? (
              <Text className="font-display text-sm font-bold uppercase tracking-widest text-cream/60">
                ...
              </Text>
            ) : (
              <Text className="font-display text-sm font-bold uppercase tracking-widest text-cream">
                {t.signUp}
              </Text>
            )}
          </Pressable>
        </View>

        {/* Bottom link */}
        <View className="mt-8 flex-row items-center justify-center gap-1">
          <Text className="font-sans text-sm text-ink/70">{t.hasAccount}</Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text className="font-sans text-sm font-bold text-orange underline decoration-orange underline-offset-2">
                {t.signIn}
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
