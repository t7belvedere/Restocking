import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Image, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet,
} from "react-native";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { analyzeUrl, type AnalyzeResult } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";

export default function AddWatch() {
  const { user } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>();
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleAnalyze = async () => {
    setError(""); setResult(null);
    if (!url.trim()) return;
    setAnalyzing(true);
    try {
      const data = await analyzeUrl(url.trim());
      if (data.ok) setResult(data);
      else setError(data.error ?? "Cannot analyze this URL");
    } catch { setError("Network error"); }
    setAnalyzing(false);
  };

  const handleCreate = async () => {
    if (!user || !result) return;
    setCreating(true);
    const { error: dbError } = await supabase.from("watches").insert({
      user_id: user.id, name: result.name ?? url, url: url.trim(),
      image_url: result.image_url ?? null, price: result.price ?? null,
      currency: result.currency ?? "EUR", size_label: selectedSize ?? null,
      enrichment_pending: result.enrichment_pending ?? false,
    });
    if (dbError) { setError(dbError.message); setCreating(false); return; }
    setCreating(false); setDone(true);
  };

  if (done) {
    return (
      <View style={s.centered}>
        <Text style={s.doneTitle}>Alerte creee !</Text>
        <TouchableOpacity onPress={() => { setDone(false); setUrl(""); setResult(null); setSelectedSize(undefined); }} style={s.outlineBtn}>
          <Text style={s.outlineBtnText}>+ Ajouter un autre article</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/(tabs)")} style={s.btn}>
          <Text style={s.btnText}>Voir mes alertes</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>{t.addWatch}</Text>
        <Text style={s.subtitle}>{t.pasteUrl}</Text>

        <View style={s.row}>
          <TextInput
            style={s.input}
            placeholder={t.urlPlaceholder} placeholderTextColor="#737373"
            autoCapitalize="none" autoCorrect={false} keyboardType="url"
            value={url} onChangeText={setUrl} onSubmitEditing={handleAnalyze}
            returnKeyType="go"
          />
          <TouchableOpacity onPress={handleAnalyze} disabled={analyzing} style={s.goBtn}>
            {analyzing ? <ActivityIndicator color="#FFF" /> : <Text style={s.goBtnText}>Go</Text>}
          </TouchableOpacity>
        </View>

        {error ? <Text style={s.error}>{error}</Text> : null}

        {result ? (
          <View style={s.preview}>
            {result.image_url ? <Image source={{ uri: result.image_url }} style={s.previewImg} resizeMode="cover" /> : null}
            {result.name ? <Text style={s.previewName}>{result.name}</Text> : null}
            {result.price ? (
              <Text style={s.previewPrice}>
                {new Intl.NumberFormat("fr-FR", { style: "currency", currency: result.currency ?? "EUR" }).format(result.price)}
              </Text>
            ) : null}
            {result.enrichment_pending ? (
              <View style={s.enrichBanner}>
                <Text style={s.enrichText}>{t.enrichmentMessage}</Text>
              </View>
            ) : null}
            {result.variants && result.variants.length > 0 ? (
              <View>
                <Text style={s.variantLabel}>{t.selectSize}</Text>
                <View style={s.variants}>
                  {result.variants.map((v) => {
                    const sel = selectedSize === v.label;
                    return (
                      <TouchableOpacity
                        key={v.label} onPress={() => setSelectedSize(v.label)}
                        disabled={!v.in_stock}
                        style={[s.varItem, sel && s.varSel, !v.in_stock && s.varDisabled]}
                      >
                        <Text style={[s.varText, sel && s.varTextSel, !v.in_stock && s.varTextDisabled]}>
                          {v.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : null}
            <TouchableOpacity onPress={handleCreate} disabled={creating} style={s.btn}>
              {creating ? <ActivityIndicator color="#FFF" /> : <Text style={s.btnText}>{t.createAlert}</Text>}
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F8F6" },
  scroll: { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 },
  title: { fontSize: 30, fontWeight: "800", color: "#262626", letterSpacing: -0.5 },
  subtitle: { marginTop: 4, fontSize: 14, color: "#737373" },
  row: { marginTop: 24, flexDirection: "row", gap: 12 },
  input: { flex: 1, borderRadius: 10, borderWidth: 2, borderColor: "#262626", backgroundColor: "#FFF", paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: "#262626" },
  goBtn: { borderRadius: 10, borderWidth: 2, borderColor: "#262626", backgroundColor: "#262626", paddingHorizontal: 20, paddingVertical: 14, justifyContent: "center", shadowColor: "#262626", shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 },
  goBtnText: { fontSize: 16, fontWeight: "700", color: "#FFF" },
  error: { marginTop: 12, fontSize: 14, color: "#EF4444" },
  preview: { marginTop: 24, gap: 16 },
  previewImg: { width: "100%", height: 200, borderRadius: 12, borderWidth: 2, borderColor: "#262626" },
  previewName: { fontSize: 20, fontWeight: "600", color: "#262626" },
  previewPrice: { fontSize: 18, color: "#262626" },
  enrichBanner: { borderRadius: 10, borderWidth: 2, borderColor: "#F85C15", backgroundColor: "#FFF7F0", padding: 16 },
  enrichText: { fontSize: 14, color: "#262626" },
  variantLabel: { fontSize: 14, fontWeight: "600", color: "#262626", marginBottom: 8 },
  variants: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  varItem: { borderRadius: 10, borderWidth: 2, borderColor: "#262626", backgroundColor: "#FFF", paddingHorizontal: 16, paddingVertical: 10 },
  varSel: { borderColor: "#262626", backgroundColor: "#262626" },
  varDisabled: { borderColor: "#E5E5E5", opacity: 0.4 },
  varText: { fontSize: 14, fontWeight: "500", color: "#262626" },
  varTextSel: { color: "#FFF" },
  varTextDisabled: { color: "#A3A3A3", textDecorationLine: "line-through" },
  btn: { borderRadius: 10, borderWidth: 2, borderColor: "#262626", backgroundColor: "#F85C15", paddingHorizontal: 24, paddingVertical: 16, alignItems: "center", shadowColor: "#262626", shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 },
  btnText: { fontSize: 18, fontWeight: "700", color: "#FFF" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F9F8F6", paddingHorizontal: 32, gap: 16 },
  doneTitle: { fontSize: 28, fontWeight: "700", color: "#262626", marginBottom: 8 },
  outlineBtn: { borderRadius: 10, borderWidth: 2, borderColor: "#262626", backgroundColor: "#FFF", paddingHorizontal: 20, paddingVertical: 14, shadowColor: "#262626", shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 },
  outlineBtnText: { fontSize: 16, fontWeight: "700", color: "#262626" },
});
