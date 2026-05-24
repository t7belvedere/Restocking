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
import { Check } from "lucide-react-native";
import { brutalSm, brutalXl } from "@/lib/shadows";

export default function Register() {
  const { signUp } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          Platform.OS === "web" ? undefined : "restocking://auth/callback",
      },
    });
    if (error) setError(error.message);
    setGoogleLoading(false);
  };

  /* ── Success state: email verification sent ── */
  if (sent) {
    return (
      <View className="flex-1 items-center justify-center bg-cream px-8">
        {/* Lime circle with checkmark */}
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-full border-2 border-ink bg-lime shadow-brutal">
          <Check size={32} color="#0b0b0b" strokeWidth={3} />
        </View>

        <Text className="mb-2 text-center font-display text-3xl font-extrabold tracking-tighter text-ink">
          Verifie ta boite mail
        </Text>
        <Text className="mb-8 text-center text-base text-ink/70">
          {t.checkEmail}
        </Text>

        <Link href="/(auth)/login" asChild>
          <TouchableOpacity
            className="h-12 items-center justify-center rounded-xl border-2 border-ink bg-paper px-8 shadow-brutal"
            activeOpacity={0.8}
          >
            <Text className="font-display text-sm font-bold uppercase tracking-widest text-ink">
              {t.signIn}
            </Text>
          </TouchableOpacity>
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
        contentContainerClassName="flex-1 justify-center px-6"
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Form card ── */}
        <View
          className="rounded-3xl border-2 border-ink bg-paper p-7"
          style={brutalXl}
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
              style={brutalSm}
            >
              <Text className="font-display text-xs font-bold uppercase tracking-[0.18em] text-ink">
                Inscription
              </Text>
            </View>
          </View>

          {/* ── Heading ── */}
          <Text className="font-display text-5xl font-extrabold tracking-tighter text-ink">
            Cree ton compte.
          </Text>
          <Text className="mb-8 text-lg text-ink/70">{t.register}</Text>

          {/* ── Google OAuth ── */}
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
            className="mb-4 h-12 items-center justify-center rounded-xl border-2 border-ink bg-paper"
            style={brutalSm}
            activeOpacity={0.8}
          >
            {googleLoading ? (
              <ActivityIndicator color="#0b0b0b" />
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
              ou continue avec
            </Text>
            <View className="h-px flex-1 bg-ink/20" />
          </View>

          {/* ── Email ── */}
          <Text className="font-display text-xs font-bold uppercase tracking-[0.2em] text-ink mb-2">
            {t.email}
          </Text>
          <TextInput
            className="mb-4 h-12 w-full rounded-xl border-2 border-ink bg-paper px-4 font-medium text-ink"
            style={brutalSm}
            placeholder="hello@example.com"
            placeholderTextColor="#A3A3A3"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          {/* ── Password ── */}
          <Text className="font-display text-xs font-bold uppercase tracking-[0.2em] text-ink mb-2">
            {t.password}
          </Text>
          <TextInput
            className="mb-2 h-12 w-full rounded-xl border-2 border-ink bg-paper px-4 font-medium text-ink"
            style={brutalSm}
            placeholder="..."
            placeholderTextColor="#A3A3A3"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={handleRegister}
          />

          {/* ── Error message ── */}
          {error ? (
            <Text className="mb-3 text-center text-sm text-destructive">
              {error}
            </Text>
          ) : null}

          {/* ── Submit button ── */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            className="h-12 w-full items-center justify-center rounded-xl border-2 border-ink bg-ink shadow-brutal"
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fbf8f0" />
            ) : (
              <Text className="font-display text-sm font-bold uppercase tracking-widest text-cream">
                S'inscrire
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Bottom links ── */}
        <View className="mt-6 flex-row justify-center gap-x-1">
          <Text className="text-sm text-ink-soft">{t.hasAccount} </Text>
          <Link href="/(auth)/login">
            <Text className="text-sm font-bold text-orange">{t.signIn}</Text>
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
