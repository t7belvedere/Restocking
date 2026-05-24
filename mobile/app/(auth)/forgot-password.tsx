import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator, StyleSheet,
} from "react-native";
import { Link } from "expo-router";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

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
    if (res.error) { setError(res.error); } else { setSent(true); }
    setLoading(false);
  };

  if (sent) {
    return (
      <View style={s.centered}>
        <Text style={s.bigText}>{t.emailSent}</Text>
        <Link href="/(auth)/login" style={{ marginTop: 24 }}>
          <Text style={s.link}>{t.signIn}</Text>
        </Link>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <Text style={s.brand}>restocking</Text>
          <Text style={s.subtitle}>{t.forgotPassword}</Text>
        </View>
        <View style={s.form}>
          <Text style={s.label}>{t.email}</Text>
          <TextInput style={s.input} placeholder="hello@example.com" placeholderTextColor="#737373" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={setEmail} onSubmitEditing={handleReset} />
          {error ? <Text style={s.error}>{error}</Text> : null}
          <TouchableOpacity onPress={handleReset} disabled={loading} style={s.button} activeOpacity={0.8}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={s.buttonText}>{t.sendReset}</Text>}
          </TouchableOpacity>
        </View>
        <View style={s.links}>
          <Link href="/(auth)/login"><Text style={s.link}>{t.signIn}</Text></Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F8F6" },
  scroll: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 32 },
  header: { marginBottom: 40 },
  brand: { fontSize: 48, fontWeight: "800", color: "#262626", letterSpacing: -1 },
  subtitle: { marginTop: 8, fontSize: 18, color: "#737373" },
  form: { gap: 12 },
  label: { marginBottom: 4, fontSize: 14, fontWeight: "600", color: "#262626" },
  input: { borderRadius: 10, borderWidth: 2, borderColor: "#262626", backgroundColor: "#FFF", paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: "#262626", marginBottom: 8 },
  error: { fontSize: 14, color: "#EF4444" },
  button: { marginTop: 8, borderRadius: 10, borderWidth: 2, borderColor: "#262626", backgroundColor: "#F85C15", paddingHorizontal: 24, paddingVertical: 16, shadowColor: "#262626", shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 },
  buttonText: { textAlign: "center", fontSize: 18, fontWeight: "700", color: "#FFF" },
  links: { marginTop: 16, flexDirection: "row", justifyContent: "center" },
  link: { fontSize: 14, fontWeight: "700", color: "#F85C15", textDecorationLine: "underline" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F9F8F6", paddingHorizontal: 32 },
  bigText: { textAlign: "center", fontSize: 28, fontWeight: "700", color: "#262626" },
});
