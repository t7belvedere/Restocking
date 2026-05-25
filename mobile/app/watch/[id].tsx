import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Switch,
  Image,
  Linking,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Trash2, ExternalLink, Clock, Globe, Tag } from "lucide-react-native";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { toggleWatch, deleteWatch } from "@/lib/api";
import { cn, formatPrice, shortHost, relativeTime } from "@/lib/utils";

type WatchStatus = "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";
type Watch = {
  id: string;
  name: string | null;
  url: string;
  image_url: string | null;
  variant_label: string | null;
  price: number | null;
  last_status: WatchStatus;
  last_check: string | null;
  is_active: boolean;
};

const STATUS_CONFIG: Record<WatchStatus, { label: string; bg: string; text: string; dot: string }> = {
  IN_STOCK: { label: "En stock", bg: "bg-lime", text: "text-ink", dot: "bg-lime" },
  OUT_OF_STOCK: { label: "Rupture", bg: "bg-muted", text: "text-orange", dot: "bg-orange" },
  UNKNOWN: { label: "En attente", bg: "bg-muted", text: "text-ink-soft", dot: "bg-ink-soft" },
};

function StatusBadge({ status }: { status: WatchStatus }) {
  const s = STATUS_CONFIG[status];
  return (
    <View
      className={cn("flex-row items-center gap-2 rounded-xl border-2 border-ink px-4 py-2", s.bg)}
      style={{ boxShadow: "2px 2px 0 0 #262626" }}
    >
      <View className={cn("w-3 h-3 rounded-full", s.dot)} />
      <Text className={cn("font-bold text-base", s.text)}>{s.label}</Text>
    </View>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View className="flex-row items-center gap-3 py-3 border-b-2 border-muted">
      <View className="w-8 h-8 rounded-lg bg-muted items-center justify-center">
        <Icon size={16} color="#737373" strokeWidth={2} />
      </View>
      <View className="flex-1">
        <Text className="text-ink-soft text-xs">{label}</Text>
        <Text className="font-bold text-ink text-sm">{value}</Text>
      </View>
    </View>
  );
}

export default function WatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [watch, setWatch] = useState<Watch | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    supabase
      .from("watches")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setWatch(data as Watch);
        setLoading(false);
      });
  }, [id, user]);

  async function handleToggle(value: boolean) {
    if (!watch) return;
    setToggling(true);
    if (!user) return;
    const ok = await toggleWatch(watch.id, user.id, value);
    if (ok) setWatch({ ...watch, is_active: value });
    setToggling(false);
  }

  function handleDelete() {
    Alert.alert(
      "Supprimer l'alerte",
      "Es-tu sur de vouloir supprimer cette alerte ? Cette action est irreversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            if (!user) return;
            const ok = await deleteWatch(id, user.id);
            if (ok) {
              router.back();
            } else {
              Alert.alert("Erreur", "Impossible de supprimer l'alerte.");
              setDeleting(false);
            }
          },
        },
      ],
    );
  }

  function handleOpenUrl() {
    if (watch?.url) Linking.openURL(watch.url);
  }

  /* ── Loading ────────────────────────────────────────────── */

  if (loading) {
    return (
      <View className="flex-1 bg-cream items-center justify-center">
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  /* ── Not found ──────────────────────────────────────────── */

  if (!watch) {
    return (
      <View className="flex-1 bg-cream px-6 items-center justify-center gap-4">
        <Text className="font-display text-2xl text-ink">Introuvable</Text>
        <Text className="text-ink-soft text-center">
          Cette alerte n'existe pas ou a ete supprimee.
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-orange border-2 border-ink rounded-xl px-6 py-3"
          style={{ boxShadow: "4px 4px 0 0 #262626" }}
        >
          <Text className="font-bold text-white">Retour</Text>
        </Pressable>
      </View>
    );
  }

  /* ── Main render ────────────────────────────────────────── */

  return (
    <View className="flex-1 bg-cream">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-12 pb-3">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft size={24} color="#262626" strokeWidth={2.5} />
        </Pressable>
        <Text className="font-display text-lg text-ink">Details</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Product image */}
        <View className="mx-4 mb-4" style={{ boxShadow: "4px 4px 0 0 #262626" }}>
          {watch.image_url ? (
            <Image
              source={{ uri: watch.image_url }}
              className="w-full aspect-square rounded-xl border-2 border-ink"
              resizeMode="cover"
            />
          ) : (
            <View
              className="w-full aspect-square rounded-xl border-2 border-ink bg-muted items-center justify-center"
              style={{ boxShadow: "4px 4px 0 0 #262626" }}
            >
              <Text className="text-ink-soft font-bold text-lg">Aucune image</Text>
            </View>
          )}
        </View>

        <View className="px-4">
          {/* Product info card */}
          <View
            className="bg-paper border-2 border-ink rounded-xl p-4 mb-4"
            style={{ boxShadow: "4px 4px 0 0 #262626" }}
          >
            <Text className="font-display text-xl text-ink mb-3">
              {watch.name ?? "Produit sans titre"}
            </Text>

            <View className="flex-row items-center gap-3 mb-4">
              <StatusBadge status={watch.last_status} />
              {!watch.is_active && (
                <View className="bg-muted border-2 border-ink rounded-xl px-3 py-1.5">
                  <Text className="text-ink-soft text-xs font-bold">En pause</Text>
                </View>
              )}
            </View>

            {watch.variant_label ? (
              <InfoRow icon={Tag} label="Variante" value={watch.variant_label} />
            ) : null}
            <InfoRow icon={Globe} label="Boutique" value={shortHost(watch.url)} />
            <InfoRow
              icon={() => <View />}
              label="Prix"
              value={formatPrice(watch.price)}
            />
            <InfoRow icon={Clock} label="Derniere verification" value={relativeTime(watch.last_check)} />
          </View>

          {/* Toggle card */}
          <View
            className="bg-paper border-2 border-ink rounded-xl p-4 mb-4"
            style={{ boxShadow: "4px 4px 0 0 #262626" }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="font-bold text-ink text-base">
                  {watch.is_active ? "Alerte active" : "Alerte en pause"}
                </Text>
                <Text className="text-ink-soft text-sm mt-0.5">
                  {watch.is_active
                    ? "Tu recevras une notification des que le produit revient en stock."
                    : "Reactive pour recommencer a surveiller ce produit."}
                </Text>
              </View>
              {toggling ? (
                <ActivityIndicator size="small" color="#FF6B35" />
              ) : (
                <Switch
                  value={watch.is_active}
                  onValueChange={handleToggle}
                  trackColor={{ false: "#E5E0DA", true: "#A3E635" }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#E5E0DA"
                />
              )}
            </View>
          </View>

          {/* Open product link */}
          <Pressable
            onPress={handleOpenUrl}
            className="bg-paper border-2 border-ink rounded-xl py-4 mb-4 flex-row items-center justify-center gap-2"
            style={{ boxShadow: "4px 4px 0 0 #262626" }}
          >
            <ExternalLink size={18} color="#262626" strokeWidth={2} />
            <Text className="font-bold text-ink">Voir le produit</Text>
          </Pressable>

          {/* Delete button */}
          <Pressable
            onPress={handleDelete}
            disabled={deleting}
            className="bg-destructive border-2 border-ink rounded-xl py-4 items-center"
            style={{ boxShadow: "4px 4px 0 0 #262626" }}
          >
            {deleting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View className="flex-row items-center gap-2">
                <Trash2 size={18} color="#FFFFFF" strokeWidth={2} />
                <Text className="font-bold text-white text-base">Supprimer l'alerte</Text>
              </View>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
