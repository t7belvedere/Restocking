import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { analyzeUrl, type AnalyzeResult } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { brutalSm, brutal } from "@/lib/shadows";

type Step = "input" | "preview" | "success";

export default function AddScreen() {
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const router = useRouter();

  const [step, setStep] = useState<Step>("input");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<AnalyzeResult | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (loading) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(0.3);
    }
  }, [loading, pulseAnim]);

  const handleAnalyze = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setError(null);
    setLoading(true);

    try {
      const result = await analyzeUrl(trimmed);
      setLoading(false);

      if (!result.ok) {
        setError(result.error || "Impossible d'analyser cette URL.");
        return;
      }

      const availableVariant = result.variants?.find((v) => v.in_stock);
      setSelectedVariant(availableVariant?.label ?? result.variants?.[0]?.label ?? null);
      setProduct(result);
      setStep("preview");
    } catch {
      setLoading(false);
      setError("Erreur reseau. Verifie ta connexion et reessaie.");
    }
  };

  const handleCreateAlert = async () => {
    if (!user || !product) return;
    setSubmitting(true);

    const { error: insertError } = await supabase.from("watches").insert({
      user_id: user.id,
      name: product.name,
      image_url: product.image_url ?? null,
      price: product.price ?? null,
      currency: product.currency ?? "EUR",
      url: url.trim(),
      variant: selectedVariant ?? null,
      enrichment_pending: product.enrichment_pending ?? false,
    });

    setSubmitting(false);

    if (insertError) {
      Alert.alert("Erreur", insertError.message);
      return;
    }

    setStep("success");
  };

  const handleReset = () => {
    setUrl("");
    setProduct(null);
    setSelectedVariant(null);
    setError(null);
    setStep("input");
  };

  const domain = (() => {
    if (!url) return "";
    try {
      return new URL(url.trim()).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  })();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-cream"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ────────── Step 1: URL Input ────────── */}
        {step === "input" && (
          <View style={{ gap: 24, marginTop: 40 }}>
            <Text className="font-display text-3xl font-extrabold text-ink">
              Ajouter une alerte
            </Text>
            <Text className="font-sans text-base font-semibold text-ink-soft">
              Colle l'URL du produit que tu veux surveiller
            </Text>

            <View>
              <TextInput
                className="h-14 rounded-xl border-2 border-ink bg-paper px-4 font-sans text-base font-medium text-ink"
                style={brutalSm}
                placeholder={t.urlPlaceholder}
                placeholderTextColor="#5a5355"
                value={url}
                onChangeText={(text) => {
                  setUrl(text);
                  if (error) setError(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                returnKeyType="go"
                onSubmitEditing={handleAnalyze}
              />
              {error ? (
                <Text className="mt-2 font-sans text-sm text-destructive">
                  {error}
                </Text>
              ) : null}
            </View>

            <TouchableOpacity
              className="h-12 items-center justify-center rounded-xl border-2 border-ink bg-ink"
              style={brutal}
              onPress={handleAnalyze}
              disabled={loading || !url.trim()}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fbf8f0" />
              ) : (
                <Text className="font-display text-sm font-bold uppercase tracking-widest text-cream">
                  Analyser le produit
                </Text>
              )}
            </TouchableOpacity>

            {/* Skeleton loading bars */}
            {loading && (
              <View style={{ gap: 12, marginTop: 8 }}>
                {[100, 85, 60].map((width, i) => (
                  <Animated.View
                    key={i}
                    className="h-5 rounded-md bg-ink/10"
                    style={{ opacity: pulseAnim, width: `${width}%` }}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* ────────── Step 2: Product Preview ────────── */}
        {step === "preview" && product && (
          <View style={{ gap: 24, marginTop: 40 }}>
            <Text className="font-display text-3xl font-extrabold text-ink">
              Ajouter une alerte
            </Text>

            {/* Product preview card */}
            <View
              className="rounded-2xl border-2 border-ink bg-paper p-5"
              style={brutal}
            >
              {product.image_url ? (
                <Image
                  source={{ uri: product.image_url }}
                  className="mb-4 h-48 w-full rounded-xl border border-ink/20"
                  resizeMode="cover"
                />
              ) : (
                <View className="mb-4 h-48 w-full items-center justify-center rounded-xl border border-ink/20 bg-muted">
                  <Text className="font-mono text-sm text-ink-soft">
                    Pas d'image
                  </Text>
                </View>
              )}

              <Text
                className="font-display text-xl font-bold text-ink"
                numberOfLines={2}
              >
                {product.name}
              </Text>

              {domain ? (
                <Text className="mt-1 font-mono text-sm text-ink-soft">
                  {domain}
                </Text>
              ) : null}

              {product.price ? (
                <Text className="mt-2 font-mono text-lg font-bold text-ink">
                  {new Intl.NumberFormat(
                    locale === "fr" ? "fr-FR" : "en-US",
                    {
                      style: "currency",
                      currency: product.currency || "EUR",
                    },
                  ).format(product.price)}
                </Text>
              ) : null}
            </View>

            {/* Variant pills */}
            {product.variants && product.variants.length > 0 && (
              <View>
                <Text className="mb-3 font-sans text-sm font-semibold text-ink">
                  {t.selectSize}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant === v.label;
                    return (
                      <TouchableOpacity
                        key={v.label}
                        onPress={() => {
                          if (v.in_stock) setSelectedVariant(v.label);
                        }}
                        disabled={!v.in_stock}
                        className={`rounded-full border-2 px-4 py-2.5 ${
                          isSelected
                            ? "border-ink bg-ink"
                            : v.in_stock
                              ? "border-ink bg-paper"
                              : "border-ink/20 opacity-40"
                        }`}
                        style={isSelected ? brutalSm : undefined}
                        activeOpacity={0.7}
                      >
                        <Text
                          className={`font-mono text-sm font-medium ${
                            isSelected
                              ? "text-cream"
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
            )}

            {/* Enrichment banner */}
            {product.enrichment_pending ? (
              <View className="rounded-xl border border-orange/40 bg-orange/5 p-4">
                <Text className="font-sans text-sm leading-relaxed text-ink-soft">
                  {t.enrichmentMessage}
                </Text>
              </View>
            ) : null}

            {/* Action buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 h-12 items-center justify-center rounded-xl border-2 border-ink bg-paper"
                style={brutal}
                onPress={handleReset}
                activeOpacity={0.8}
              >
                <Text className="font-display text-sm font-bold uppercase tracking-widest text-ink">
                  {t.cancel}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 h-12 items-center justify-center rounded-xl border-2 border-ink bg-ink"
                style={brutal}
                onPress={handleCreateAlert}
                disabled={submitting}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator color="#fbf8f0" />
                ) : (
                  <Text className="font-display text-sm font-bold uppercase tracking-widest text-cream">
                    Activer l'alerte
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ────────── Success ────────── */}
        {step === "success" && (
          <View
            className="flex-1 items-center justify-center"
            style={{ gap: 32, marginTop: 80 }}
          >
            <View
              className="h-24 w-24 items-center justify-center rounded-full bg-lime"
              style={brutal}
            >
              <Text className="font-display text-4xl text-ink">
                {"✓"}
              </Text>
            </View>

            <Text className="font-display text-3xl font-extrabold text-ink text-center">
              Alerte creee !
            </Text>

            <Text className="font-sans text-base text-ink-soft text-center leading-relaxed">
              Ton alerte est active. Tu seras notifie des que le produit sera de
              retour en stock.
            </Text>

            <View className="flex-row gap-3" style={{ marginTop: 8 }}>
              <TouchableOpacity
                className="h-12 items-center justify-center rounded-xl border-2 border-ink bg-paper px-6"
                style={brutal}
                onPress={handleReset}
                activeOpacity={0.8}
              >
                <Text className="font-display text-sm font-bold uppercase tracking-widest text-ink">
                  Ajouter un autre
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="h-12 items-center justify-center rounded-xl border-2 border-ink bg-ink px-6"
                style={brutal}
                onPress={() => router.push("/(tabs)")}
                activeOpacity={0.8}
              >
                <Text className="font-display text-sm font-bold uppercase tracking-widest text-cream">
                  Voir mes alertes
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
