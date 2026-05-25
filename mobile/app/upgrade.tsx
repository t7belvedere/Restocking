import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { X, Check, Zap, Crown } from "lucide-react-native";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { createCheckoutSession, createPortalSession } from "@/lib/stripe";

const PRICE_IDS = {
  monthly: "price_1TaRRJR3spq7tVuKKAOkHEzw",
  annual: "price_1TaRRJR3spq7tVuK5FpHaGoK",
};

const FREE_FEATURES = [
  "3 alertes actives",
  "Verification toutes les 30 min",
  "Marques supportees : Zara, COS, Uniqlo, ASOS...",
];

const PRO_FEATURES = [
  "Alertes illimitees",
  "Verification toutes les 5 min",
  "Support prioritaire",
  "Toutes les marques supportees",
  "Choix taille + couleur",
];

export default function UpgradeScreen() {
  const { session } = useAuth();
  const [interval, setInterval] = useState<"monthly" | "annual">("annual");
  const [loading, setLoading] = useState(false);
  const isPro = false; // TODO: derive from user metadata

  async function handleSubscribe() {
    if (!session?.access_token) {
      Alert.alert("Erreur", "Tu dois etre connecte.");
      return;
    }
    setLoading(true);
    try {
      const url = await createCheckoutSession(
        session.access_token,
        PRICE_IDS[interval],
      );
      if (url) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Erreur", "Impossible de creer la session de paiement.");
      }
    } catch {
      Alert.alert("Erreur", "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  async function handleManage() {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const url = await createPortalSession(session.access_token);
      if (url) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Erreur", "Impossible d'ouvrir le portail.");
      }
    } catch {
      Alert.alert("Erreur", "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-cream" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-xl"
        >
          <X size={24} color="#262626" strokeWidth={2.5} />
        </Pressable>
        <Text className="font-display text-xl text-ink">Passer a Pro</Text>
        <View className="w-10" />
      </View>

      <View className="px-4">
        {/* Interval toggle */}
        <View className="flex-row bg-muted rounded-xl p-1 border-2 border-ink mb-8">
          <Pressable
            className={cn(
              "flex-1 py-2.5 rounded-lg items-center",
              interval === "monthly" && "bg-ink",
            )}
            onPress={() => setInterval("monthly")}
          >
            <Text
              className={cn(
                "font-bold text-sm",
                interval === "monthly" ? "text-cream" : "text-ink",
              )}
            >
              Mensuel
            </Text>
          </Pressable>
          <Pressable
            className={cn(
              "flex-1 py-2.5 rounded-lg items-center",
              interval === "annual" && "bg-ink",
            )}
            onPress={() => setInterval("annual")}
          >
            <Text
              className={cn(
                "font-bold text-sm",
                interval === "annual" ? "text-cream" : "text-ink",
              )}
            >
              Annuel
            </Text>
          </Pressable>
        </View>

        {/* Plan cards */}
        <View className="gap-6 mb-12">
          {/* Free plan */}
          <View
            className="bg-paper border-2 border-ink rounded-xl p-5"
            style={{ boxShadow: "4px 4px 0 0 #262626" }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="font-display text-xl text-ink">Gratuit</Text>
              {!isPro && (
                <View className="bg-muted border-2 border-ink rounded-lg px-3 py-1">
                  <Text className="text-ink-soft text-xs font-bold">Actuel</Text>
                </View>
              )}
            </View>
            <Text className="font-display text-3xl text-ink mb-1">0 EUR</Text>
            <Text className="text-ink-soft text-sm mb-4">Pour commencer</Text>
            <View className="gap-2.5">
              {FREE_FEATURES.map((feature) => (
                <View key={feature} className="flex-row items-center gap-2">
                  <Check size={16} color="#262626" strokeWidth={2.5} />
                  <Text className="text-ink text-sm">{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Pro plan */}
          <View
            className="bg-paper border-2 border-blue rounded-xl p-5"
            style={{ boxShadow: "6px 6px 0 0 #262626" }}
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-2">
                <Crown size={20} color="#FF6B35" strokeWidth={2} />
                <Text className="font-display text-xl text-ink">Pro</Text>
              </View>
              <View
                className="-rotate-6 bg-blue border-2 border-ink rounded-lg px-3 py-1"
                style={{ boxShadow: "2px 2px 0 0 #262626" }}
              >
                <Text className="text-white font-bold text-xs">Populaire</Text>
              </View>
            </View>
            <Text className="font-display text-3xl text-ink mb-1">
              {interval === "monthly" ? "4,99 EUR" : "49 EUR"}
              <Text className="text-base font-sans text-ink-soft font-normal">
                {interval === "monthly" ? "/mois" : "/an"}
              </Text>
            </Text>
            <Text className="text-ink-soft text-sm mb-4">
              {interval === "annual"
                ? "Soit 4,08 EUR/mois — 2 mois offerts"
                : "Sans engagement, annulable a tout moment"}
            </Text>
            <View className="gap-2.5 mb-6">
              {PRO_FEATURES.map((feature) => (
                <View key={feature} className="flex-row items-center gap-2">
                  <Check size={16} color="#3B82F6" strokeWidth={2.5} />
                  <Text className="text-ink text-sm font-bold">{feature}</Text>
                </View>
              ))}
            </View>

            {isPro ? (
              <Pressable
                onPress={handleManage}
                disabled={loading}
                className="bg-paper border-2 border-ink rounded-xl py-3.5 items-center"
                style={{ boxShadow: "4px 4px 0 0 #262626" }}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#262626" />
                ) : (
                  <Text className="font-bold text-ink text-base">
                    Gerer mon abonnement
                  </Text>
                )}
              </Pressable>
            ) : (
              <Pressable
                onPress={handleSubscribe}
                disabled={loading}
                className="bg-orange border-2 border-ink rounded-xl py-3.5 flex-row items-center justify-center gap-2"
                style={{ boxShadow: "4px 4px 0 0 #262626" }}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Zap size={18} color="#FFFFFF" strokeWidth={2.5} />
                    <Text className="font-bold text-white text-base">
                      S'abonner
                    </Text>
                  </>
                )}
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
