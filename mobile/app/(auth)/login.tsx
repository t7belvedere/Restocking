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
  StyleSheet,
} from "react-native";
import { Link } from "expo-router";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export default function Login() {
  const { signIn } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    const res = await signIn(email, password);
    if (res.error) setError(res.error);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.brand}>restocking</Text>
          <Text style={styles.subtitle}>{t.login}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>{t.email}</Text>
          <TextInput
            style={styles.input}
            placeholder="hello@example.com"
            placeholderTextColor="#737373"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>{t.password}</Text>
          <TextInput
            style={styles.input}
            placeholder="..."
            placeholderTextColor="#737373"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={handleLogin}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={styles.button}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>{t.signIn}</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.links}>
          <Link href="/(auth)/forgot-password">
            <Text style={styles.link}>{t.forgotPassword}</Text>
          </Link>
        </View>

        <View style={styles.links}>
          <Text style={styles.mutedText}>{t.noAccount} </Text>
          <Link href="/(auth)/register">
            <Text style={styles.linkBold}>{t.signUp}</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F8F6" },
  scroll: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 32 },
  header: { marginBottom: 40 },
  brand: {
    fontSize: 48,
    fontFamily: "System",
    fontWeight: "800",
    color: "#262626",
    letterSpacing: -1,
  },
  subtitle: { marginTop: 8, fontSize: 18, color: "#737373" },
  form: { gap: 12 },
  label: {
    marginBottom: 4,
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
  },
  input: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#262626",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#262626",
    marginBottom: 8,
  },
  error: { fontSize: 14, color: "#EF4444", marginTop: 4 },
  button: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#262626",
    backgroundColor: "#F85C15",
    paddingHorizontal: 24,
    paddingVertical: 16,
    shadowColor: "#262626",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  buttonText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  links: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
  },
  link: { fontSize: 14, color: "#737373", textDecorationLine: "underline" },
  linkBold: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F85C15",
    textDecorationLine: "underline",
  },
  mutedText: { fontSize: 14, color: "#737373" },
});
