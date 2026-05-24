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
import { KeyRound, Mail } from "lucide-react-native";
import { brutalSm } from "@/lib/shadows";

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
        {/* Lime circle with check icon */}
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-lime">
          <Mail size={32} color="#262626" strokeWidth={2} />
        </View>

        <Text className="mb-2 text-center font-display text-3xl font-extrabold tracking-tighter text-ink">
          Email envoye !
        </Text>
        <Text className="mb-8 text-center text-base text-ink/70">
          {t.emailSent}
        </Text>

        <Link href="/(auth)/login" asChild>
          <TouchableOpacity
            className="h-12 items-center justify-center rounded-xl border-2 border-ink bg-ink px-8 shadow-brutal"
            activeOpacity={0.8}
          >
            <Text className="font-display text-sm font-bold uppercase tracking-widest text-cream">
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
        {/* ── Wordmark ── */}
        <View className="mb-2 items-center">
          <Text className="font-italiana text-5xl tracking-tight text-ink">
            restocking<Text className="text-orange">.</Text>
          </Text>
        </View>

        {/* ── Key icon in lime circle ── */}
        <View className="mb-6 items-center">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-lime/30">
            <KeyRound size={28} color="#262626" strokeWidth={2} />
          </View>
        </View>

        {/* ── Heading ── */}
        <Text className="text-center font-display text-3xl font-extrabold tracking-tighter text-ink">
          {t.forgotPassword}
        </Text>
        <Text className="mb-8 mt-2 text-center text-base text-ink/70">
          Entre ton email pour recevoir un lien de reinitialisation.
        </Text>

        {/* ── Email input ── */}
        <TextInput
          className="mb-3 h-12 rounded-xl border-2 border-ink bg-paper px-4 text-base text-ink"
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
          <Text className="mb-3 text-center text-sm text-destructive">{error}</Text>
        ) : null}

        {/* ── Submit button ── */}
        <TouchableOpacity
          onPress={handleReset}
          disabled={loading}
          className="h-12 items-center justify-center rounded-xl border-2 border-ink bg-ink shadow-brutal"
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#F9F8F6" />
          ) : (
            <Text className="font-display text-sm font-bold uppercase tracking-widest text-cream">
              {t.sendReset}
            </Text>
          )}
        </TouchableOpacity>

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
