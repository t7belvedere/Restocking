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
import { Mail } from "lucide-react-native";
import { brutalSm, brutalXl } from "@/lib/shadows";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setError("");
    setLoading(true);
    const res = await resetPassword(email);
    if (res.error) {
      setError(res.error);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  /* ── Success state: email sent ── */
  if (sent) {
    return (
      <View className="flex-1 items-center justify-center bg-cream px-8">
        {/* Lime circle with mail icon */}
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-full border-2 border-ink bg-lime shadow-brutal">
          <Mail size={32} color="#0b0b0b" strokeWidth={2} />
        </View>

        <Text className="mb-2 text-center font-display text-3xl font-extrabold tracking-tighter text-ink">
          Email envoye !
        </Text>
        <Text className="mb-8 text-center text-base text-ink/70">
          {t.emailSent}
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
                Mot de passe
              </Text>
            </View>
          </View>

          {/* ── Heading ── */}
          <Text className="text-center font-display text-3xl font-extrabold tracking-tighter text-ink">
            Mot de passe oublie ?
          </Text>
          <Text className="mb-8 mt-2 text-center text-base text-ink/70">
            Entre ton email pour recevoir un lien de reinitialisation.
          </Text>

          {/* ── Email ── */}
          <Text className="font-display text-xs font-bold uppercase tracking-[0.2em] text-ink mb-2">
            {t.email}
          </Text>
          <TextInput
            className="mb-2 h-12 w-full rounded-xl border-2 border-ink bg-paper px-4 font-medium text-ink"
            style={brutalSm}
            placeholder="hello@example.com"
            placeholderTextColor="#A3A3A3"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            onSubmitEditing={handleReset}
          />

          {/* ── Error message ── */}
          {error ? (
            <Text className="mb-3 text-center text-sm text-destructive">
              {error}
            </Text>
          ) : null}

          {/* ── Submit button ── */}
          <TouchableOpacity
            onPress={handleReset}
            disabled={loading}
            className="h-12 w-full items-center justify-center rounded-xl border-2 border-ink bg-ink shadow-brutal"
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fbf8f0" />
            ) : (
              <Text className="font-display text-sm font-bold uppercase tracking-widest text-cream">
                Envoyer le lien
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Back to login ── */}
        <View className="mt-6 flex-row justify-center">
          <Link href="/(auth)/login">
            <Text className="font-mono text-xs uppercase tracking-[0.2em] text-ink/60">
              Retour
            </Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
