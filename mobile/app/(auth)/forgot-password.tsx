import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import AppLogo from "@/components/AppLogo";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleResetPassword() {
    if (!email.trim()) {
      Alert.alert("Erreur", "Veuillez saisir votre adresse email.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: "restock://auth/callback",
      });

      if (error) {
        Alert.alert("Erreur", error.message);
        return;
      }

      setSent(true);
    } catch (err: any) {
      Alert.alert("Erreur", err?.message ?? "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <View className="flex-1 bg-cream px-6 justify-center items-center">
        <AppLogo />
        <View className="mt-10 items-center">
          <Text className="font-display text-2xl font-bold text-ink text-center mb-4">
            Email envoye
          </Text>
          <Text className="font-sans text-ink-soft text-center mb-6">
            Si un compte existe avec l'adresse{"\n"}
            <Text className="font-bold text-ink">{email.trim()}</Text>,
            {"\n\n"}
            vous recevrez un lien pour reinitialiser votre mot de passe.
          </Text>
          <TouchableOpacity
            className="rounded-xl border-2 border-ink bg-orange px-6 py-3.5"
            onPress={() => router.replace("/(auth)/login")}
            activeOpacity={0.8}
          >
            <Text className="font-bold text-ink text-base">Retour a la connexion</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-cream"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
        className="px-6"
      >
        <View className="items-center mb-8">
          <AppLogo />
        </View>

        <View
          className="bg-paper rounded-2xl border-2 border-ink p-6"
          style={{ boxShadow: "4px 4px 0 0 #262626" }}
        >
          <Text className="font-display text-2xl font-bold text-ink mb-6 text-center">
            Mot de passe oublie
          </Text>

          <Text className="font-sans text-ink-soft mb-5 text-center">
            Saisissez votre adresse email et nous vous enverrons un lien de reinitialisation.
          </Text>

          <Text className="font-sans text-ink font-bold mb-1.5 ml-1">Email</Text>
          <TextInput
            className="rounded-xl border-2 border-ink bg-white px-4 py-3 font-sans text-ink mb-5"
            placeholder="votre@email.com"
            placeholderTextColor="#737373"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            editable={!loading}
            onSubmitEditing={handleResetPassword}
          />

          <TouchableOpacity
            className="rounded-xl border-2 border-ink bg-orange px-6 py-3.5 items-center"
            onPress={handleResetPassword}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#262626" />
            ) : (
              <Text className="font-bold text-ink text-base">Envoyer le lien</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-6">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
            <Text className="font-bold text-orange underline">Retour a la connexion</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
