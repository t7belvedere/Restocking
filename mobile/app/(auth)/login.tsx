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
import { brutalSm, brutal, brutalXl } from "@/lib/shadows";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

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
        redirectTo:
          Platform.OS === "web" ? undefined : "restocking://auth/callback",
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
        {/* ── Eyebrow badge ── */}
        <View className="mb-5 items-center">
          <View
            className="flex-row items-center gap-2 rounded-full border-2 border-ink bg-paper px-3.5 py-1.5"
            style={brutalSm}
          >
            <View className="h-2 w-2 rounded-full bg-orange" />
            <Text className="font-display text-xs font-bold uppercase tracking-[0.2em] text-ink">
              Se connecter
            </Text>
          </View>
        </View>

        {/* ── Heading ── */}
        <Text className="mb-1 text-center font-display text-5xl font-extrabold leading-[0.95] tracking-tighter text-ink">
          Bon retour.
        </Text>

        {/* ── Subtitle ── */}
        <Text className="mb-8 text-center text-base text-ink/70">
          Connecte-toi pour continuer.
        </Text>

        {/* ── Form card ── */}
        <View
          className="rounded-3xl border-2 border-ink bg-paper p-7"
          style={brutalXl}
        >
          {/* ── Logo wordmark ── */}
          <View className="mb-6 items-center">
            <View style={{ position: "relative" }}>
              {/* Orange dot above the 'o' */}
              <View
                style={{
                  position: "absolute",
                  top: -6,
                  left: "49%",
                  width: 5,
                  height: 5,
                  borderRadius: 2.5,
                  backgroundColor: "#ff803d",
                }}
              />
              <Text className="font-italiana text-4xl tracking-tight text-ink">
                restocking<Text className="text-orange">.</Text>
              </Text>
            </View>
          </View>

          {/* ── Google OAuth button ── */}
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
            className="mb-4 h-12 w-full flex-row items-center justify-center gap-3 rounded-xl border-2 border-ink bg-paper"
            style={brutal}
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
            <Text className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/50">
              ou continue avec
            </Text>
            <View className="h-px flex-1 bg-ink/20" />
          </View>

          {/* ── Email label ── */}
          <Text className="mb-1.5 font-display text-xs font-bold uppercase tracking-[0.2em] text-ink">
            Email
          </Text>

          {/* ── Email input ── */}
          <TextInput
            className="mb-4 h-12 rounded-xl border-2 border-ink bg-paper px-4 text-base text-ink"
            style={brutalSm}
            placeholder="hello@example.com"
            placeholderTextColor="rgba(11,11,11,0.4)"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          {/* ── Password label ── */}
          <Text className="mb-1.5 font-display text-xs font-bold uppercase tracking-[0.2em] text-ink">
            Mot de passe
          </Text>

          {/* ── Password input ── */}
          <TextInput
            className="mb-2 h-12 rounded-xl border-2 border-ink bg-paper px-4 text-base text-ink"
            style={brutalSm}
            placeholder="..."
            placeholderTextColor="rgba(11,11,11,0.4)"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={handleLogin}
          />

          {/* ── Forgot password link ── */}
          <View className="mb-5 items-end">
            <Link href="/(auth)/forgot-password">
              <Text className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">
                {t.forgotPassword}
              </Text>
            </Link>
          </View>

          {/* ── Error message ── */}
          {error ? (
            <Text className="mb-3 text-center text-sm text-destructive">
              {error}
            </Text>
          ) : null}

          {/* ── Submit button ── */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className="h-12 w-full items-center justify-center rounded-xl border-2 border-ink bg-ink"
            style={brutal}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fbf8f0" />
            ) : (
              <Text className="font-display text-sm font-bold uppercase tracking-widest text-cream">
                Se connecter
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Bottom link ── */}
        <View className="mt-6 flex-row items-center justify-center gap-x-1">
          <Text className="text-sm text-ink/70">Pas de compte ?</Text>
          <Link href="/(auth)/register">
            <Text
              style={{ color: "#ff803d", textDecorationLine: "underline" }}
              className="text-sm font-bold"
            >
              S{"'"}inscrire
            </Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
