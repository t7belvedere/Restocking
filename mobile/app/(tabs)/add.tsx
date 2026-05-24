import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Image, ActivityIndicator, KeyboardAvoidingView, Platform,
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
    setError("");
    setResult(null);
    if (!url.trim()) return;
    setAnalyzing(true);
    try {
      const data = await analyzeUrl(url.trim());
      if (data.ok) setResult(data);
      else setError(data.error ?? "Cannot analyze this URL");
    } catch {
      setError("Network error");
    }
    setAnalyzing(false);
  };

  const handleCreate = async () => {
    if (!user || !result) return;
    setCreating(true);
    const { error: dbError } = await supabase.from("watches").insert({
      user_id: user.id,
      name: result.name ?? url,
      url: url.trim(),
      image_url: result.image_url ?? null,
      price: result.price ?? null,
      currency: result.currency ?? "EUR",
      size_label: selectedSize ?? null,
      enrichment_pending: result.enrichment_pending ?? false,
    });
    if (dbError) {
      setError(dbError.message);
      setCreating(false);
      return;
    }
    setCreating(false);
    setDone(true);
  };

  const reset = () => {
    setDone(false);
    setUrl("");
    setResult(null);
    setSelectedSize(undefined);
    setError("");
  };

  // ---------- Done state ----------
  if (done) {
    return (
      <View className="flex-1 items-center justify-center bg-cream px-8 gap-4">
        <Text className="text-3xl font-bold text-ink mb-2">
          Alerte créée !
        </Text>
        <TouchableOpacity
          onPress={reset}
          className="rounded-lg border-2 border-ink bg-paper px-5 py-3.5 shadow-brutal"
        >
          <Text className="text-base font-bold text-ink">
            + Ajouter un autre article
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)")}
          className="rounded-lg border-2 border-ink bg-orange px-6 py-4 items-center shadow-brutal"
        >
          <Text className="text-lg font-bold text-white">
            Voir mes alertes
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ---------- Main form ----------
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-cream"
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 56,
          paddingBottom: 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-3xl font-extrabold text-ink tracking-tight">
          {t.addWatch}
        </Text>
        <Text className="mt-1 text-sm text-ink-soft">{t.pasteUrl}</Text>

        {/* ---- URL input row ---- */}
        <View className="mt-6 flex-row gap-3">
          <TextInput
            className="flex-1 rounded-lg border-2 border-ink bg-paper px-4 py-3.5 text-base text-ink"
            placeholder={t.urlPlaceholder}
            placeholderTextColor="#737373"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            value={url}
            onChangeText={setUrl}
            onSubmitEditing={handleAnalyze}
            returnKeyType="go"
          />
          <TouchableOpacity
            onPress={handleAnalyze}
            disabled={analyzing}
            className="justify-center rounded-lg border-2 border-ink bg-ink px-5 py-3.5 shadow-brutal"
          >
            {analyzing ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text className="text-base font-bold text-white">Go</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ---- Error ---- */}
        {error ? (
          <Text className="mt-3 text-sm text-destructive">{error}</Text>
        ) : null}

        {/* ---- Product preview ---- */}
        {result ? (
          <View className="mt-6 gap-4">
            {result.image_url ? (
              <Image
                source={{ uri: result.image_url }}
                className="h-48 w-full rounded-xl border-2 border-ink"
                resizeMode="cover"
              />
            ) : null}

            {result.name ? (
              <Text className="text-xl font-semibold text-ink">
                {result.name}
              </Text>
            ) : null}

            {result.price != null ? (
              <Text className="text-lg text-ink">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: result.currency ?? "EUR",
                }).format(result.price)}
              </Text>
            ) : null}

            {/* Enrichment pending banner */}
            {result.enrichment_pending ? (
              <View className="rounded-lg border-2 border-orange bg-[#FFF7F0] p-4">
                <Text className="text-sm text-ink">
                  {t.enrichmentMessage}
                </Text>
              </View>
            ) : null}

            {/* Variant picker */}
            {result.variants && result.variants.length > 0 ? (
              <View>
                <Text className="mb-2 text-sm font-semibold text-ink">
                  {t.selectSize}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {result.variants.map((v) => {
                    const sel = selectedSize === v.label;
                    return (
                      <TouchableOpacity
                        key={v.label}
                        onPress={() => setSelectedSize(v.label)}
                        disabled={!v.in_stock}
                        className={`rounded-lg border-2 px-4 py-2.5 ${
                          sel
                            ? "border-ink bg-ink"
                            : v.in_stock
                              ? "border-ink bg-paper"
                              : "border-ink-soft/30 opacity-40"
                        }`}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            sel
                              ? "text-white"
                              : v.in_stock
                                ? "text-ink"
                                : "text-ink-soft line-through"
                          }`}
                        >
                          {v.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : null}

            {/* Create button */}
            <TouchableOpacity
              onPress={handleCreate}
              disabled={creating}
              className="items-center rounded-lg border-2 border-ink bg-orange px-6 py-4 shadow-brutal"
            >
              {creating ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text className="text-lg font-bold text-white">
                  {t.createAlert}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
