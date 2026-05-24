import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useI18n } from "@/lib/i18n";
import { openCheckout, PRICE_IDS } from "@/lib/stripe";
import { brutal, brutalSm } from "@/lib/shadows";
import { ChevronLeft, Check } from "lucide-react-native";

export default function UpgradeScreen() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (interval: "monthly" | "annual") => {
    const priceId = PRICE_IDS[interval];
    if (!priceId) {
      Alert.alert("Erreur", "Price ID not configured.");
      return;
    }
    setLoading(interval);
    const result = await openCheckout(priceId);
    setLoading(null);

    if (!result.success && result.error !== "Cancelled") {
      Alert.alert("Erreur", result.error ?? "Échec du paiement.");
    }
    // If success or cancelled, just return; user will see updated plan on refresh
  };

  return (
    <View className="flex-1 bg-cream">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: t.upgrade ?? "Passer à Pro",
          headerStyle: { backgroundColor: "#fbf8f0" },
          headerTintColor: "#0b0b0b",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <ChevronLeft size={24} color="#0b0b0b" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
      >
        {/* Pro card */}
        <View
          className="rounded-3xl border-2 border-ink bg-paper p-6"
          style={brutal}
        >
          <View className="mb-1 self-start rounded-full border-2 border-ink bg-lime px-3 py-1">
            <Text className="font-display text-xs font-bold uppercase tracking-wider text-ink">
              {t.mostPopular ?? "Le plus populaire"}
            </Text>
          </View>
          <Text className="mt-4 font-display text-3xl font-extrabold text-ink">
            Pro
          </Text>
          <Text className="mt-2 font-sans text-base leading-relaxed text-ink/70">
            20 alertes actives · Vérification toutes les 5 min · Notifications SMS
          </Text>

          {/* Annual option */}
          <TouchableOpacity
            onPress={() => handleCheckout("annual")}
            disabled={loading !== null}
            activeOpacity={0.8}
            className="mt-6 h-14 flex-row items-center justify-between rounded-xl border-2 border-ink bg-blue px-5"
            style={brutalSm}
          >
            <View>
              <Text className="font-display text-base font-bold text-white">
                59€ / an
              </Text>
              <Text className="font-sans text-xs text-white/80">
                Soit 4,90€/mois · Économisez 30%
              </Text>
            </View>
            {loading === "annual" ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="font-display text-sm font-bold uppercase tracking-widest text-white">
                Choisir
              </Text>
            )}
          </TouchableOpacity>

          {/* Monthly option */}
          <TouchableOpacity
            onPress={() => handleCheckout("monthly")}
            disabled={loading !== null}
            activeOpacity={0.8}
            className="mt-4 h-14 flex-row items-center justify-between rounded-xl border-2 border-ink bg-paper px-5"
            style={brutalSm}
          >
            <View>
              <Text className="font-display text-base font-bold text-ink">
                7,99€ / mois
              </Text>
              <Text className="font-sans text-xs text-ink/60">
                Sans engagement
              </Text>
            </View>
            {loading === "monthly" ? (
              <ActivityIndicator color="#0b0b0b" size="small" />
            ) : (
              <Text className="font-display text-sm font-bold uppercase tracking-widest text-ink">
                Choisir
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Feature list */}
        <View className="mt-6 rounded-3xl border-2 border-ink bg-paper p-6" style={brutal}>
          <Text className="font-display text-xl font-bold text-ink">
            Tout ce qui est inclus
          </Text>
          <View className="mt-4 gap-3">
            {[
              "20 produits surveillés",
              "Vérification toutes les 5 minutes",
              "Notifications SMS (France)",
              "Accès prioritaire aux nouvelles marques",
              "Support prioritaire",
            ].map((feat) => (
              <View key={feat} className="flex-row items-center gap-3">
                <View className="h-5 w-5 items-center justify-center rounded-full bg-lime">
                  <Check size={12} color="#0b0b0b" strokeWidth={3} />
                </View>
                <Text className="font-sans text-base text-ink">{feat}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
