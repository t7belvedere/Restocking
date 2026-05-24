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
import { supabase } from "@/lib/supabase";

const shadowBrutalSm = {
  shadowColor: "#262626",
  shadowOffset: { width: 2, height: 2 },
  shadowOpacity: 1,
  shadowRadius: 0,
} as const;

export default function Login() {
  const { signIn } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    const res = await signIn(email, password);
    if (res.error) setError(res.error);
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: Platform.OS === "web" ? undefined : "restocking://auth/callback",
      },
    });
    if (error) setError(error.message);
    setGoogleLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-cream"
    >
      <ScrollView
        contentContainerClassName="flex-1 justify-center px-6"
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Wordmark ── */}
        <View className="mb-2 items-center">
          <Text className="font-italiana text-5xl tracking-tight text-ink">
            restocking<Text className="text-orange">.</Text>
          </Text>
        </View>

        {/* ── Eyebrow badge ── */}
        <View className="mb-6 items-center">
          <View
            className="rounded-full border-2 border-ink bg-lime/20 px-3 py-1"
            style={shadowBrutalSm}
          >
            <Text className="font-display text-xs font-bold uppercase tracking-[0.18em] text-ink">
              Surveillance de stock
            </Text>
          </View>
        </View>

        {/* ── Heading ── */}
        <Text className="font-display text-5xl font-extrabold tracking-tighter text-ink">
          Bon retour.
        </Text>
        <Text className="mb-8 text-lg text-ink/70">{t.login}</Text>

        {/* ── Google OAuth ── */}
        <TouchableOpacity
          onPress={handleGoogleSignIn}
          disabled={googleLoading}
          className="mb-4 h-12 items-center justify-center rounded-xl border-2 border-ink bg-paper"
          style={shadowBrutalSm}
          activeOpacity={0.8}
        >
          {googleLoading ? (
            <ActivityIndicator color="#262626" />
          ) : (
            <Text className="font-display text-sm font-bold uppercase tracking-widest text-ink">
              Continuer avec Google
            </Text>
          )}
        </TouchableOpacity>

        {/* ── Divider ── */}
        <View className="mb-4 flex-row items-center gap-3">
          <View className="h-px flex-1 bg-ink/20" />
          <Text className="text-xs uppercase tracking-wider text-ink/50">
            ou continuer avec
          </Text>
          <View className="h-px flex-1 bg-ink/20" />
        </View>

        {/* ── Email input ── */}
        <TextInput
          className="mb-3 h-12 rounded-xl border-2 border-ink bg-paper px-4 text-base text-ink"
          style={shadowBrutalSm}
          placeholder="hello@example.com"
          placeholderTextColor="#A3A3A3"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />

        {/* ── Password input ── */}
        <TextInput
          className="mb-2 h-12 rounded-xl border-2 border-ink bg-paper px-4 text-base text-ink"
          style={shadowBrutalSm}
          placeholder="..."
          placeholderTextColor="#A3A3A3"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={handleLogin}
        />

        {/* ── Forgot password link ── */}
        <View className="mb-4 items-end">
          <Link href="/(auth)/forgot-password">
            <Text className="font-mono text-xs uppercase tracking-[0.2em] text-ink/60">
              {t.forgotPassword}
            </Text>
          </Link>
        </View>

        {/* ── Error message ── */}
        {error ? (
          <Text className="mb-3 text-center text-sm text-destructive">{error}</Text>
        ) : null}

        {/* ── Submit button ── */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          className="h-12 items-center justify-center rounded-xl border-2 border-ink bg-ink shadow-brutal"
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#F9F8F6" />
          ) : (
            <Text className="font-display text-sm font-bold uppercase tracking-widest text-cream">
              {t.signIn}
            </Text>
          )}
        </TouchableOpacity>

        {/* ── Bottom links ── */}
        <View className="mt-6 flex-row justify-center gap-x-1">
          <Text className="text-sm text-ink-soft">{t.noAccount} </Text>
          <Link href="/(auth)/register">
            <Text className="text-sm font-bold text-orange">{t.signUp}</Text>
          </Link>
        </View>

        {/* ── Legal blurb ── */}
        <Text className="mt-8 px-4 text-center text-xs text-ink/50">
          En continuant, tu acceptes nos conditions d'utilisation et notre
          politique de confidentialite.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
