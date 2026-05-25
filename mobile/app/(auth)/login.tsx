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
import { router, Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "@/lib/supabase";
import AppLogo from "@/components/AppLogo";
import GoogleIcon from "@/components/GoogleIcon";

WebBrowser.maybeCompleteAuthSession();

function extractCodeFromUrl(url: string): string | null {
  try {
    const escaped = url.replace(/#/g, "?");
    const params = new URLSearchParams(escaped.split("?")[1] ?? "");
    return params.get("code");
  } catch {
    return null;
  }
}

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          Alert.alert("Erreur", "Email ou mot de passe incorrect.");
        } else {
          Alert.alert("Erreur", error.message);
        }
        return;
      }

      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Erreur", err?.message ?? "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "google" | "apple") {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: "restock://auth/callback",
        },
      });

      if (error) {
        Alert.alert("Erreur", error.message);
        return;
      }

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, "restock://auth/callback");

        if (result.type === "success" && result.url) {
          const code = extractCodeFromUrl(result.url);

          if (code) {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) {
              Alert.alert("Erreur", exchangeError.message);
              return;
            }
            router.replace("/(tabs)");
          } else {
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData?.session) {
              router.replace("/(tabs)");
            }
          }
        }
      }
    } catch (err: any) {
      Alert.alert("Erreur", err?.message ?? "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
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
            Connexion
          </Text>

          <Text className="font-sans text-ink font-bold mb-1.5 ml-1">Email</Text>
          <TextInput
            className="rounded-xl border-2 border-ink bg-white px-4 py-3 font-sans text-ink mb-4"
            placeholder="votre@email.com"
            placeholderTextColor="#737373"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />

          <Text className="font-sans text-ink font-bold mb-1.5 ml-1">Mot de passe</Text>
          <TextInput
            className="rounded-xl border-2 border-ink bg-white px-4 py-3 font-sans text-ink mb-3"
            placeholder="Votre mot de passe"
            placeholderTextColor="#737373"
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
            editable={!loading}
            onSubmitEditing={handleEmailLogin}
          />

          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity className="mb-5">
              <Text className="font-sans text-ink-soft text-right underline">
                Mot de passe oublie ?
              </Text>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity
            className="rounded-xl border-2 border-ink bg-orange px-6 py-3.5 items-center mb-5"
            onPress={handleEmailLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#262626" />
            ) : (
              <Text className="font-bold text-ink text-base">Se connecter</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row items-center mb-5">
            <View className="flex-1 h-px bg-ink/20" />
            <Text className="font-sans text-ink-soft mx-3">ou continuer avec</Text>
            <View className="flex-1 h-px bg-ink/20" />
          </View>

          <View className="flex-row justify-center gap-4">
            <TouchableOpacity
              className="flex-1 rounded-xl border-2 border-ink bg-white px-4 py-3 flex-row items-center justify-center gap-2"
              onPress={() => handleOAuth("google")}
              disabled={loading}
              activeOpacity={0.8}
            >
              <GoogleIcon size={20} />
              <Text className="font-bold text-ink text-sm">Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 rounded-xl border-2 border-ink bg-white px-4 py-3 flex-row items-center justify-center gap-2"
              onPress={() => handleOAuth("apple")}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text className="text-lg" style={{ lineHeight: 20 }}>
                &#63743;
              </Text>
              <Text className="font-bold text-ink text-sm">Apple</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row justify-center mt-6">
          <Text className="font-sans text-ink-soft">Pas de compte ? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text className="font-bold text-orange underline">S'inscrire</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
