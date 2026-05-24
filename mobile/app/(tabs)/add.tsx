import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { analyzeUrl, type AnalyzeResult } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { VariantPicker } from "@/components/variant-picker";
import { Badge } from "@/components/ui/badge";
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
    if (!url.trim()) {
      setError("Colle une URL");
      return;
    }
    setAnalyzing(true);
    try {
      const data = await analyzeUrl(url.trim());
      if (data.ok) {
        setResult(data);
      } else {
        setError(data.error ?? "Impossible d'analyser cette URL");
      }
    } catch {
      setError("Erreur réseau — réessaie");
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

  if (done) {
    return (
      <View className="flex-1 items-center justify-center bg-cream px-8 gap-4">
        <Text className="text-center font-display text-2xl font-bold text-ink">
          Alerte créée !
        </Text>
        <TouchableOpacity
          onPress={() => {
            setDone(false);
            setUrl("");
            setResult(null);
            setSelectedSize(undefined);
          }}
          className="rounded-lg border-2 border-ink bg-paper px-6 py-4 shadow-brutal"
        >
          <Text className="font-display text-base font-bold text-ink">
            + Ajouter un autre article
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)")}
          className="rounded-lg border-2 border-ink bg-primary px-6 py-4 shadow-brutal"
        >
          <Text className="font-display text-base font-bold text-primary-foreground">
            Voir mes alertes
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-cream"
    >
      <ScrollView
        contentContainerClassName="px-6 pt-14 pb-10"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="font-display text-3xl font-extrabold text-ink tracking-tight">
          {t.addWatch}
        </Text>
        <Text className="mt-1 font-sans text-sm text-ink-soft">
          {t.pasteUrl}
        </Text>

        {/* URL Input */}
        <View className="mt-6 flex-row gap-3">
          <TextInput
            className="flex-1 rounded-lg border-2 border-ink bg-paper px-4 py-3.5 font-sans text-base text-ink"
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
            className="rounded-lg border-2 border-ink bg-ink px-5 py-3.5 shadow-brutal active:translate-y-0.5"
          >
            {analyzing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="font-display text-base font-bold text-paper">
                Go
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {error ? (
          <Text className="mt-4 font-sans text-sm text-destructive">
            {error}
          </Text>
        ) : null}

        {/* Results */}
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
              <Text className="font-sans text-xl font-semibold text-ink">
                {result.name}
              </Text>
            ) : null}

            {result.price ? (
              <Text className="font-mono text-lg text-ink">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: result.currency ?? "EUR",
                }).format(result.price)}
              </Text>
            ) : null}

            {result.enrichment_pending ? (
              <View className="rounded-lg border-2 border-orange/30 bg-orange/10 p-4">
                <Text className="font-sans text-sm text-ink">
                  {t.enrichmentMessage}
                </Text>
              </View>
            ) : null}

            {result.variants && result.variants.length > 0 ? (
              <View className="gap-2">
                <Text className="font-sans text-sm font-semibold text-ink">
                  {t.selectSize}
                </Text>
                <VariantPicker
                  variants={result.variants}
                  selected={selectedSize}
                  onSelect={setSelectedSize}
                />
              </View>
            ) : null}

            <TouchableOpacity
              onPress={handleCreate}
              disabled={creating}
              className="rounded-lg border-2 border-ink bg-primary px-6 py-4 shadow-brutal active:translate-y-0.5"
            >
              {creating ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-center font-display text-lg font-bold text-primary-foreground">
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
