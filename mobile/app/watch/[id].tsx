import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { brutal, brutalSm } from "@/lib/shadows";
import {
  ArrowLeft,
  ExternalLink,
  Pause,
  Play,
  Trash2,
  Clock,
  Tag,
  Euro,
  CircleDot,
} from "lucide-react-native";

interface Watch {
  id: string;
  user_id: string;
  name: string;
  image_url?: string | null;
  url: string;
  price?: number | null;
  currency?: string;
  variant_label?: string | null;
  variant_id?: string | null;
  size?: string | null;
  last_status?: string;
  last_check?: string | null;
  is_active?: boolean;
  created_at: string;
}

interface CheckLog {
  id: string;
  status: string;
  signal_source?: string | null;
  checked_at: string;
  price?: number | null;
}

const STATUS_LABEL: Record<string, string> = {
  IN_STOCK: "En stock",
  OUT_OF_STOCK: "Rupture",
  UNKNOWN: "En attente",
};

const STATUS_COLOR: Record<string, string> = {
  IN_STOCK: "bg-lime",
  OUT_OF_STOCK: "bg-pink",
  UNKNOWN: "bg-muted",
};

const SOURCE_LABEL: Record<string, string> = {
  dataLayer: "Code de la page",
  add_to_cart_btn: "Bouton d'achat",
  variant_attr: "Détail de la taille",
  playwright: "Analyse complète",
};

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `il y a ${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `il y a ${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${Math.floor(hours / 24)}j`;
}

export default function WatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [watch, setWatch] = useState<Watch | null>(null);
  const [logs, setLogs] = useState<CheckLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user || !id) return;

    const { data: watchData, error: watchErr } = await supabase
      .from("watches")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (watchErr || !watchData) {
      setLoading(false);
      return;
    }

    setWatch(watchData as Watch);

    const { data: logData } = await supabase
      .from("check_logs")
      .select("*")
      .eq("watch_id", id)
      .order("checked_at", { ascending: false })
      .limit(20);

    setLogs((logData ?? []) as CheckLog[]);
    setLoading(false);
  }, [user, id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleToggle = async () => {
    if (!watch) return;
    setToggling(true);
    const newActive = !watch.is_active;
    await supabase.from("watches").update({ is_active: newActive }).eq("id", id);
    setWatch({ ...watch, is_active: newActive });
    setToggling(false);
  };

  const handleDelete = () => {
    Alert.alert(
      "Supprimer l'alerte ?",
      "Cette action est irréversible. L'historique sera perdu.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            await supabase.from("watches").delete().eq("id", id);
            router.back();
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator color="#0b0b0b" size="large" />
      </View>
    );
  }

  if (!watch) {
    return (
      <View className="flex-1 items-center justify-center bg-cream px-6">
        <Text className="font-display text-xl text-ink">Produit introuvable</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 rounded-xl border-2 border-ink bg-ink px-6 py-3"
        >
          <Text className="font-display text-sm font-bold text-cream">Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const status = watch.last_status ?? "UNKNOWN";
  const domain = (() => {
    try {
      return new URL(watch.url).hostname.replace(/^www\./, "");
    } catch {
      return watch.url;
    }
  })();

  return (
    <View className="flex-1 bg-cream">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: watch.name ?? "Produit",
          headerTitleStyle: { fontFamily: "BricolageGrotesque_700Bold", fontSize: 17 },
          headerStyle: { backgroundColor: "#fbf8f0" },
          headerTintColor: "#0b0b0b",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <ArrowLeft size={22} color="#0b0b0b" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0b0b0b"
          />
        }
      >
        {/* Image + Status */}
        <View className="flex-row gap-4">
          {watch.image_url ? (
            <Image
              source={{ uri: watch.image_url }}
              className="h-28 w-28 rounded-xl border-2 border-ink"
              style={brutalSm}
              resizeMode="cover"
            />
          ) : (
            <View className="h-28 w-28 items-center justify-center rounded-xl border-2 border-ink bg-muted">
              <Text className="font-mono text-xs text-ink/30">sans visuel</Text>
            </View>
          )}

          <View className="flex-1 justify-between">
            <View>
              <Text
                className="font-display text-xl font-bold text-ink"
                numberOfLines={3}
              >
                {watch.name ?? "Produit sans titre"}
              </Text>
              <TouchableOpacity
                onPress={() => Linking.openURL(watch.url)}
                className="mt-1 flex-row items-center gap-1"
              >
                <Text className="font-mono text-xs text-ink/50" numberOfLines={1}>
                  {domain}
                </Text>
                <ExternalLink size={12} color="#0b0b0b" style={{ opacity: 0.4 }} />
              </TouchableOpacity>
            </View>

            {/* Status + activity */}
            <View className="flex-row items-center gap-2">
              <View
                className={`rounded-full px-3 py-1.5 ${STATUS_COLOR[status] ?? "bg-muted"}`}
              >
                <View className="flex-row items-center gap-1.5">
                  <CircleDot
                    size={8}
                    color="#0b0b0b"
                    fill={status === "IN_STOCK" ? "#059669" : status === "OUT_OF_STOCK" ? "#d97706" : "#9ca3af"}
                  />
                  <Text className="font-mono text-xs font-bold uppercase tracking-wider text-ink">
                    {STATUS_LABEL[status] ?? status}
                  </Text>
                </View>
              </View>

              {!watch.is_active && (
                <View className="rounded-full bg-ink/10 px-3 py-1.5">
                  <Text className="font-mono text-xs font-bold uppercase text-ink/50">
                    En pause
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Meta info */}
        <View
          className="mt-5 flex-row flex-wrap gap-4 rounded-2xl border-2 border-ink bg-paper p-4"
          style={brutal}
        >
          <MetaItem icon={<Tag size={14} color="#0b0b0b" />} label="Variante" value={watch.variant_label ?? watch.size ?? "—"} />
          <MetaItem
            icon={<Euro size={14} color="#0b0b0b" />}
            label="Prix"
            value={
              watch.price
                ? new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: watch.currency || "EUR",
                  }).format(watch.price)
                : "—"
            }
          />
          <MetaItem
            icon={<Clock size={14} color="#0b0b0b" />}
            label="Dernier check"
            value={watch.last_check ? formatRelativeTime(watch.last_check) : "—"}
          />
        </View>

        {/* Actions */}
        <View className="mt-5 flex-row gap-3">
          <TouchableOpacity
            onPress={handleToggle}
            disabled={toggling}
            className={`flex-1 h-12 flex-row items-center justify-center gap-2 rounded-xl border-2 border-ink ${
              watch.is_active ? "bg-paper" : "bg-lime"
            }`}
            style={brutalSm}
            activeOpacity={0.8}
          >
            {toggling ? (
              <ActivityIndicator color="#0b0b0b" size="small" />
            ) : (
              <>
                {watch.is_active ? (
                  <>
                    <Pause size={16} color="#0b0b0b" />
                    <Text className="font-display text-sm font-bold text-ink">Mettre en pause</Text>
                  </>
                ) : (
                  <>
                    <Play size={16} color="#0b0b0b" />
                    <Text className="font-display text-sm font-bold text-ink">Réactiver</Text>
                  </>
                )}
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            disabled={deleting}
            className="h-12 w-12 items-center justify-center rounded-xl border-2 border-destructive/40 bg-destructive/5"
            activeOpacity={0.7}
          >
            {deleting ? (
              <ActivityIndicator color="#ee3533" size="small" />
            ) : (
              <Trash2 size={16} color="#ee3533" />
            )}
          </TouchableOpacity>
        </View>

        {/* Check log history */}
        <View className="mt-8">
          <Text className="mb-4 font-display text-lg font-bold text-ink">
            Historique des vérifications
          </Text>

          {logs.length === 0 ? (
            <View className="items-center rounded-2xl border-2 border-dashed border-ink/20 py-10">
              <Clock size={24} color="#0b0b0b" style={{ opacity: 0.3 }} />
              <Text className="mt-3 font-sans text-sm text-ink/40">
                En attente du premier check…
              </Text>
            </View>
          ) : (
            <View className="gap-2">
              {logs.map((log, i) => (
                <View
                  key={log.id}
                  className="flex-row items-center justify-between rounded-xl border-2 border-ink/20 bg-paper px-4 py-3"
                >
                  <View className="flex-1">
                    <Text className="font-mono text-xs text-ink/50">
                      {formatRelativeTime(log.checked_at)}
                    </Text>
                    <View className="mt-1 flex-row items-center gap-2">
                      <View
                        className={`h-2 w-2 rounded-full ${
                          log.status === "IN_STOCK"
                            ? "bg-emerald-500"
                            : log.status === "OUT_OF_STOCK"
                              ? "bg-amber-500"
                              : "bg-muted-foreground/50"
                        }`}
                      />
                      <Text className="font-sans text-sm font-medium text-ink">
                        {STATUS_LABEL[log.status] ?? log.status}
                      </Text>
                      {log.signal_source && (
                        <Text className="font-mono text-[10px] text-ink/30">
                          · {SOURCE_LABEL[log.signal_source] ?? log.signal_source}
                        </Text>
                      )}
                    </View>
                  </View>
                  {log.price && (
                    <Text className="font-mono text-sm font-semibold text-ink">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      }).format(log.price)}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View className="min-w-[30%] flex-1">
      <View className="flex-row items-center gap-1.5">
        {icon}
        <Text className="font-mono text-[10px] uppercase tracking-wider text-ink/40">{label}</Text>
      </View>
      <Text className="mt-1 font-sans text-sm font-semibold text-ink" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}
