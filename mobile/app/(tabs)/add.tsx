import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Link, Check, ChevronLeft, Sparkles } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth";
import { analyzeUrl, createWatch } from "@/lib/api";
import type { AnalyzeResult } from "@/lib/api";
import { cn, formatPrice, shortHost } from "@/lib/utils";
import { VariantPicker } from "@/components/variant-picker";

/* ── Progress indicator ───────────────────────────────────── */

const PROGRESS_STEPS = [
  { key: "http", label: "Connexion" },
  { key: "browser", label: "Navigateur" },
  { key: "extracting", label: "Extraction" },
];

function AnalysisProgress({ currentStep }: { currentStep: string }) {
  return (
    <View className="mt-6">
      <View className="flex-row justify-between mb-3">
        {PROGRESS_STEPS.map((step) => {
          const stepIdx = PROGRESS_STEPS.findIndex(
            (s) => s.key === currentStep,
          );
          const i = PROGRESS_STEPS.indexOf(step);
          const done = i < stepIdx;
          const active = i === stepIdx;

          return (
            <View key={step.key} className="items-center flex-1">
              <View
                className={cn(
                  "w-8 h-8 rounded-xl border-2 border-ink items-center justify-center mb-1",
                  done && "bg-ink",
                  active && "bg-orange",
                  !done && !active && "bg-paper",
                )}
                style={
                  active
                    ? { boxShadow: "3px 3px 0 0 #262626" }
                    : undefined
                }
              >
                {done ? (
                  <Check size={16} color="#FDF9F3" strokeWidth={3} />
                ) : active ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-ink-soft text-xs font-bold">
                    {i + 1}
                  </Text>
                )}
              </View>
              <Text
                className={cn(
                  "text-[10px] font-bold text-center",
                  active ? "text-orange" : "text-ink-soft",
                )}
              >
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>
      {/* Connector lines */}
      <View className="flex-row px-8">
        {PROGRESS_STEPS.slice(0, -1).map((_, i) => (
          <View
            key={i}
            className="flex-1 h-0.5 bg-muted mx-2 rounded-full"
          />
        ))}
      </View>
    </View>
  );
}

/* ── Product preview card ─────────────────────────────────── */

function ProductPreview({ result }: { result: AnalyzeResult }) {
  return (
    <View
      className="bg-paper border-2 border-ink rounded-xl p-4 mb-6"
      style={{ boxShadow: "4px 4px 0 0 #262626" }}
    >
      <View className="flex-row gap-4">
        {result.image_url ? (
          <Image
            source={{ uri: result.image_url }}
            className="w-20 h-20 rounded-xl border-2 border-ink"
            resizeMode="cover"
          />
        ) : (
          <View className="w-20 h-20 rounded-xl border-2 border-ink bg-muted items-center justify-center">
            <Text className="text-ink-soft text-xs font-bold">IMG</Text>
          </View>
        )}
        <View className="flex-1 justify-center">
          <Text className="font-bold text-ink text-sm" numberOfLines={2}>
            {result.name || "Produit sans titre"}
          </Text>
          <Text className="text-ink-soft text-xs mt-1">
            {shortHost(result.url)}
          </Text>
          {result.price != null && (
            <Text className="font-display text-ink text-lg mt-1">
              {formatPrice(result.price)}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

/* ── Main screen ──────────────────────────────────────────── */

export default function AddScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [url, setUrl] = useState("");
  const [step, setStep] = useState<"input" | "analyzing" | "confirm">(
    "input",
  );
  const [progressStep, setProgressStep] = useState("http");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const handleAnalyze = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Entre une URL de produit.");
      return;
    }
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      setError("L'URL doit commencer par http:// ou https://");
      return;
    }

    setError(null);
    setStep("analyzing");
    setProgressStep("http");

    try {
      const data = await analyzeUrl(trimmed, (evt) => {
        if (evt.step === "http") setProgressStep("http");
        else if (evt.step === "browser" || evt.step === "playwright")
          setProgressStep("browser");
        else setProgressStep("extracting");
      });

      if (!data.ok) {
        setError(data.error || "Impossible d'analyser cette URL.");
        setStep("input");
        return;
      }

      setResult(data);
      setSelectedSize(null);
      setSelectedColor(null);
      setSelectedVariant(null);
      setStep("confirm");
    } catch (e: any) {
      setError(e?.message || "Erreur de connexion au serveur.");
      setStep("input");
    }
  };

  const handleActivate = async () => {
    if (!result) return;

    let variantLabel = "";
    let variantId = "";
    if (selectedSize && selectedColor) {
      variantLabel = `${selectedSize} / ${selectedColor}`;
      variantId = `${selectedSize}|${selectedColor}`;
    } else if (selectedSize) {
      variantLabel = selectedSize;
      variantId = selectedSize;
    } else if (selectedColor) {
      variantLabel = selectedColor;
      variantId = selectedColor;
    } else if (selectedVariant) {
      variantLabel = selectedVariant;
      variantId = selectedVariant;
    }

    const hasOptions =
      (result.sizes && result.sizes.length > 0) ||
      (result.variants && result.variants.length > 0);

    if (!variantId && hasOptions) {
      Alert.alert(
        "Selection requise",
        "Choisis une taille ou une variante avant d'activer l'alerte.",
      );
      return;
    }

    setCreating(true);
    try {
      if (!user) return;
      const res = await createWatch({
        userId: user.id,
        url: result.url,
        name: result.name,
        image_url: result.image_url,
        price: result.price,
        variant_label: variantLabel || "Standard",
        variant_id: variantId || "standard",
      });

      if (!res.ok) {
        Alert.alert(
          "Erreur",
          res.error || "Impossible de creer l'alerte.",
        );
        return;
      }

      Alert.alert(
        "Alerte creee !",
        "Tu seras notifie des que le produit revient en stock.",
        [{ text: "OK", onPress: () => router.replace("/(tabs)") }],
      );
    } catch {
      Alert.alert("Erreur", "Une erreur est survenue.");
    } finally {
      setCreating(false);
    }
  };

  const handleReset = () => {
    setStep("input");
    setResult(null);
    setError(null);
    setSelectedSize(null);
    setSelectedColor(null);
    setSelectedVariant(null);
    setUrl("");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-cream"
      style={{ paddingTop: insets.top }}
    >
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Step 1: URL Input ──────────────────────────── */}
        {step === "input" && (
          <View className="pt-6">
            <View className="mb-6">
              <Text className="font-display text-2xl text-ink mb-2">
                Nouvelle alerte
              </Text>
              <Text className="font-sans text-ink-soft text-base leading-relaxed">
                Colle l'URL d'un produit et on verifiera les stocks pour toi.
              </Text>
            </View>

            {/* URL input */}
            <View className="mb-3">
              <Text className="font-bold text-ink text-sm mb-2">
                URL du produit
              </Text>
              <View className="flex-row items-center bg-paper border-2 border-ink rounded-xl px-4">
                <Link size={18} color="#737373" strokeWidth={2} />
                <TextInput
                  ref={inputRef}
                  className="flex-1 py-4 px-3 font-sans text-ink text-base"
                  placeholder="https://www.zara.com/fr/..."
                  placeholderTextColor="#A3A3A3"
                  value={url}
                  onChangeText={(t) => {
                    setUrl(t);
                    if (error) setError(null);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  returnKeyType="go"
                  onSubmitEditing={handleAnalyze}
                />
              </View>
              <Text className="text-ink-soft text-xs mt-2 ml-1">
                Colle l'URL d'une fiche produit Zara, COS, Uniqlo...
              </Text>
            </View>

            {error && (
              <View className="bg-red-50 border-2 border-destructive rounded-xl p-3 mb-3">
                <Text className="text-destructive text-sm font-bold">
                  {error}
                </Text>
              </View>
            )}

            <Pressable
              onPress={handleAnalyze}
              className="bg-orange border-2 border-ink rounded-xl py-4 items-center mt-2"
              style={{ boxShadow: "4px 4px 0 0 #262626" }}
            >
              <Text className="font-bold text-white text-base">Analyser</Text>
            </Pressable>
          </View>
        )}

        {/* ── Analyzing state ────────────────────────────── */}
        {step === "analyzing" && (
          <View className="pt-12 items-center">
            <Text className="font-display text-xl text-ink mb-2">
              Analyse en cours
            </Text>
            <Text className="font-sans text-ink-soft text-center mb-8">
              On inspecte la page produit pour trouver les tailles et les
              prix...
            </Text>

            <View className="w-full bg-paper border-2 border-ink rounded-xl p-6 mb-6">
              <AnalysisProgress currentStep={progressStep} />
              <View className="items-center mt-8">
                <Sparkles size={32} color="#FF6B35" strokeWidth={2} />
                <Text className="text-ink-soft text-sm mt-3 text-center">
                  {progressStep === "http"
                    ? "Connexion au service d'analyse..."
                    : progressStep === "browser"
                      ? "Navigation sur la page produit..."
                      : "Extraction des variantes disponibles..."}
                </Text>
              </View>
            </View>

            <Pressable onPress={handleReset} className="py-3 px-6">
              <Text className="text-ink-soft text-sm font-bold underline">
                Annuler
              </Text>
            </Pressable>
          </View>
        )}

        {/* ── Step 2: Confirm ────────────────────────────── */}
        {step === "confirm" && result && (
          <View className="pt-6">
            {/* Back button */}
            <Pressable
              onPress={handleReset}
              className="flex-row items-center mb-4"
            >
              <ChevronLeft size={20} color="#737373" strokeWidth={2.5} />
              <Text className="text-ink-soft text-sm font-bold ml-1">
                Modifier l'URL
              </Text>
            </Pressable>

            <Text className="font-display text-2xl text-ink mb-4">
              Confirmer l'alerte
            </Text>

            <ProductPreview result={result} />

            {/* Variant picker */}
            <VariantPicker
              sizes={result.sizes}
              colors={result.colors}
              variants={result.variants}
              sizesStatus={result.sizes_status}
              colorsStatus={result.colors_status}
              selectedSize={selectedSize}
              selectedColor={selectedColor}
              selectedVariant={selectedVariant}
              onSelectSize={setSelectedSize}
              onSelectColor={setSelectedColor}
              onSelectVariant={setSelectedVariant}
            />

            {/* Activate button */}
            <Pressable
              onPress={handleActivate}
              disabled={creating}
              className={cn(
                "bg-orange border-2 border-ink rounded-xl py-4 items-center mt-2",
                creating && "opacity-60",
              )}
              style={{ boxShadow: "4px 4px 0 0 #262626" }}
            >
              {creating ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="font-bold text-white text-base">
                  Activer l'alerte
                </Text>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
