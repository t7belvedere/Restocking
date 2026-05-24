import { useState, useRef, useEffect } from "react";
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
  Animated,
} from "react-native";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { analyzeUrl, type AnalyzeResult } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";

// ─── Shadow tokens ───────────────────────────────────────────────────────────
const shadowBrutal = {
  shadowColor: "#262626",
  shadowOffset: { width: 4, height: 4 },
  shadowOpacity: 1,
  shadowRadius: 0,
} as const;

const shadowBrutalSm = {
  shadowColor: "#262626",
  shadowOffset: { width: 2, height: 2 },
  shadowOpacity: 1,
  shadowRadius: 0,
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency || "EUR",
  }).format(price);
}

// ─── Skeleton loading placeholder ────────────────────────────────────────────
function SkeletonBar({
  width,
  height = "h-4",
}: {
  width: string;
  height?: string;
}) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{ opacity }}
      className={`rounded-md bg-ink/10 ${height} ${width}`}
    />
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
type Step = "input" | "loading" | "confirm" | "success";

export default function AddWatch() {
  const { user } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const [step, setStep] = useState<Step>("input");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>();
  const [selectedColor, setSelectedColor] = useState<string>();
  const [creating, setCreating] = useState(false);

  // ── Analyze URL ──────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    setError("");
    setResult(null);
    setSelectedSize(undefined);
    setSelectedColor(undefined);

    const trimmed = url.trim();
    if (!trimmed) {
      setError("Entre une URL valide");
      return;
    }

    setStep("loading");
    try {
      const data = await analyzeUrl(trimmed);
      if (data.ok) {
        setResult(data);
        setStep("confirm");
      } else {
        setError(
          data.error ??
            "Impossible d'analyser cette URL. Vérifie le lien et réessaie.",
        );
        setStep("input");
      }
    } catch {
      setError(
        "Erreur réseau. Vérifie ta connexion internet et réessaie.",
      );
      setStep("input");
    }
  };

  // ── Create alert ─────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!user || !result) return;
    setCreating(true);
    setError("");

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
    setStep("success");
  };

  // ── Navigation helpers ───────────────────────────────────────────────────
  const goBackToInput = () => {
    setStep("input");
    setResult(null);
    setSelectedSize(undefined);
    setSelectedColor(undefined);
    setError("");
  };

  const reset = () => {
    setStep("input");
    setUrl("");
    setResult(null);
    setSelectedSize(undefined);
    setSelectedColor(undefined);
    setError("");
  };

  // ── Distinguish size vs colour variants ──────────────────────────────────
  // The API returns flat `variants`. If each variant has a `type` field we use
  // it, otherwise we treat everything as a size for now.
  const sizeVariants =
    result?.variants?.filter(
      (v) => !("type" in v) || (v as any).type === "size",
    ) ?? [];
  const colorVariants =
    result?.variants?.filter(
      (v) => "type" in v && (v as any).type === "color",
    ) ?? [];

  // ──────────────────────────────────────────────────────────────────────────
  //  SUCCESS STATE
  // ──────────────────────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <View className="flex-1 items-center justify-center bg-cream px-8">
        {/* Checkmark in lime circle */}
        <View
          className="mb-6 h-24 w-24 items-center justify-center rounded-full border-2 border-ink bg-lime"
          style={shadowBrutal}
        >
          <Text className="font-display text-4xl text-ink">&#10003;</Text>
        </View>

        <Text className="mb-8 text-center font-display text-3xl font-extrabold text-ink">
          Alerte créée !
        </Text>

        <View className="w-full max-w-sm gap-3">
          <TouchableOpacity
            onPress={reset}
            className="items-center rounded-xl border-2 border-ink bg-paper px-6 py-4"
            style={shadowBrutalSm}
          >
            <Text className="font-sans-semibold text-base text-ink">
              + Ajouter un autre article
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)")}
            className="items-center rounded-xl border-2 border-ink bg-ink px-6 py-4"
            style={shadowBrutal}
          >
            <Text className="font-display text-base font-bold uppercase tracking-wider text-paper">
              Voir mes alertes
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  CONFIRM STATE — product card + variant pickers + activate
  // ──────────────────────────────────────────────────────────────────────────
  if (step === "confirm" && result) {
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
          {/* Back link */}
          <TouchableOpacity onPress={goBackToInput} className="mb-5 self-start">
            <Text className="font-sans text-base text-ink/60">
              &larr; {t.cancel}
            </Text>
          </TouchableOpacity>

          {/* ── Product preview card ──────────────────────────────────── */}
          <View
            className="rounded-2xl border-2 border-ink bg-paper p-5"
            style={shadowBrutal}
          >
            {/* Product image */}
            {result.image_url ? (
              <Image
                source={{ uri: result.image_url }}
                className="mb-4 h-52 w-full rounded-xl border-2 border-ink"
                resizeMode="cover"
              />
            ) : null}

            {/* Product name */}
            {result.name ? (
              <Text
                className="font-display text-xl font-bold text-ink"
                numberOfLines={2}
              >
                {result.name}
              </Text>
            ) : null}

            {/* Domain */}
            <Text className="mt-1 font-sans text-sm text-ink/60">
              {extractDomain(url)}
            </Text>

            {/* Price */}
            {result.price != null ? (
              <Text className="mt-2 font-sans-semibold text-lg text-ink">
                {formatPrice(result.price, result.currency ?? "EUR")}
              </Text>
            ) : null}
          </View>

          {/* ── Size selection ────────────────────────────────────────── */}
          {sizeVariants.length > 0 && (
            <View className="mt-6">
              <Text className="mb-3 font-sans-bold text-xs uppercase tracking-[0.18em] text-ink/60">
                Taille
              </Text>
              <View className="flex-row flex-wrap gap-2.5">
                {sizeVariants.map((v) => {
                  const isSelected = selectedSize === v.label;
                  const unavailable = !v.in_stock;

                  return (
                    <TouchableOpacity
                      key={v.label}
                      onPress={() => {
                        if (!unavailable) setSelectedSize(v.label);
                      }}
                      disabled={unavailable}
                      className={`rounded-full border-2 px-4 py-2 ${
                        isSelected
                          ? "border-ink bg-ink"
                          : unavailable
                            ? "border-ink/20 bg-muted opacity-40"
                            : "border-ink bg-paper"
                      }`}
                      style={isSelected ? shadowBrutalSm : undefined}
                    >
                      <Text
                        className={`font-sans-medium text-sm ${
                          isSelected
                            ? "text-paper"
                            : unavailable
                              ? "text-ink-soft line-through"
                              : "text-ink"
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

          {/* ── Color selection (only if API returns colour variants) ──── */}
          {colorVariants.length > 0 && (
            <View className="mt-6">
              <Text className="mb-3 font-sans-bold text-xs uppercase tracking-[0.18em] text-ink/60">
                Couleur
              </Text>
              <View className="flex-row flex-wrap gap-2.5">
                {colorVariants.map((v) => {
                  const isSelected = selectedColor === v.label;
                  const unavailable = !v.in_stock;

                  return (
                    <TouchableOpacity
                      key={v.label}
                      onPress={() => {
                        if (!unavailable) setSelectedColor(v.label);
                      }}
                      disabled={unavailable}
                      className={`rounded-full border-2 px-4 py-2 ${
                        isSelected
                          ? "border-ink bg-ink"
                          : unavailable
                            ? "border-ink/20 bg-muted opacity-40"
                            : "border-ink bg-paper"
                      }`}
                      style={isSelected ? shadowBrutalSm : undefined}
                    >
                      <Text
                        className={`font-sans-medium text-sm ${
                          isSelected
                            ? "text-paper"
                            : unavailable
                              ? "text-ink-soft line-through"
                              : "text-ink"
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

          {/* ── Enrichment pending banner ──────────────────────────────── */}
          {result.enrichment_pending && (
            <View
              className="mt-6 rounded-xl border-2 p-4"
              style={{
                borderColor: "rgba(248,92,21,0.4)",
                backgroundColor: "rgba(248,92,21,0.05)",
              }}
            >
              <Text className="font-sans-medium text-sm leading-relaxed text-ink">
                {t.enrichmentMessage}
              </Text>
            </View>
          )}

          {/* Error during creation */}
          {error !== "" && (
            <Text className="mt-4 font-sans-medium text-sm text-destructive">
              {error}
            </Text>
          )}

          {/* ── Bottom buttons ────────────────────────────────────────── */}
          <View className="mt-8 flex-row gap-3">
            <TouchableOpacity
              onPress={goBackToInput}
              className="flex-1 items-center rounded-xl border-2 border-ink bg-paper px-6 py-4"
              style={shadowBrutalSm}
            >
              <Text className="font-sans-semibold text-base text-ink">
                {t.cancel}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCreate}
              disabled={creating}
              className="flex-1 items-center rounded-xl border-2 border-ink bg-ink px-6 py-4"
              style={shadowBrutal}
            >
              {creating ? (
                <ActivityIndicator color="#F9F8F6" />
              ) : (
                <Text className="font-display text-base font-bold uppercase tracking-wider text-paper">
                  Activer l'alerte
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  INPUT / LOADING STATE
  // ──────────────────────────────────────────────────────────────────────────
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
        {/* Heading */}
        <Text className="font-display text-3xl font-extrabold text-ink">
          Ajouter une alerte
        </Text>
        <Text className="mt-2 font-sans text-base leading-relaxed text-ink-soft">
          Colle l'URL de l'article que tu veux surveiller
        </Text>

        {/* URL input */}
        <TextInput
          className="mt-6 h-14 rounded-xl border-2 border-ink bg-paper px-4 font-sans text-base text-ink"
          placeholder={t.urlPlaceholder}
          placeholderTextColor="#A3A3A3"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          value={url}
          onChangeText={setUrl}
          onSubmitEditing={handleAnalyze}
          returnKeyType="go"
          editable={step !== "loading"}
          style={shadowBrutalSm}
        />

        {/* Analyse button */}
        <TouchableOpacity
          onPress={handleAnalyze}
          disabled={step === "loading"}
          className="mt-4 h-14 items-center justify-center rounded-xl border-2 border-ink bg-ink"
          style={shadowBrutal}
        >
          {step === "loading" ? (
            <ActivityIndicator color="#F9F8F6" />
          ) : (
            <Text className="font-display text-base font-bold uppercase tracking-wider text-paper">
              Analyser le produit
            </Text>
          )}
        </TouchableOpacity>

        {/* Validation error */}
        {error !== "" && (
          <Text className="mt-4 font-sans-medium text-sm text-destructive">
            {error}
          </Text>
        )}

        {/* ── Skeleton loading preview ─────────────────────────────────── */}
        {step === "loading" && (
          <View className="mt-10 gap-4">
            <SkeletonBar width="w-full" height="h-52" />
            <SkeletonBar width="w-3/4" />
            <SkeletonBar width="w-5/12" />
            <SkeletonBar width="w-1/3" />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
