import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { brutal, brutalSm } from "@/lib/shadows";

// ── Types ────────────────────────────────────────────────────────────────
type WatchStatus = "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";

interface Watch {
  id: string;
  name: string | null;
  image_url: string | null;
  variant_label: string | null;
  size_label: string | null;
  price: number | null;
  currency: string | null;
  in_stock: boolean | null;
  last_status: WatchStatus | null;
  last_checked_at: string | null;
  last_check: string | null;
  url: string;
  is_active: boolean | null;
  created_at: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────

function formatPrice(
  value: number | null | undefined,
  currency?: string | null,
): string {
  if (value == null || Number.isNaN(value)) return "—";
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency ?? "EUR",
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} €`;
  }
}

function shortHost(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function getStatus(w: Watch): WatchStatus {
  if (w.last_status) return w.last_status;
  if (w.in_stock === true) return "IN_STOCK";
  if (w.in_stock === false) return "OUT_OF_STOCK";
  return "UNKNOWN";
}

function relativeTime(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `il y a ${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `il y a ${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${Math.floor(hours / 24)}j`;
}

const WEEKDAYS_FR = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

const MONTHS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

function formatFrenchDate(date: Date): string {
  const weekday = WEEKDAYS_FR[date.getDay()];
  const day = date.getDate();
  const month = MONTHS_FR[date.getMonth()];
  return `${weekday} ${day} ${month}`;
}

// ── Stat icon (emoji in colored circle) ──────────────────────────────────
function StatIcon({ emoji, bg }: { emoji: string; bg: string }) {
  return (
    <View
      style={{ backgroundColor: bg }}
      className="h-10 w-10 items-center justify-center rounded-full"
    >
      <Text className="text-base leading-none">{emoji}</Text>
    </View>
  );
}

// ── Status badge ─────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: WatchStatus }) {
  if (status === "IN_STOCK") {
    return (
      <View className="rounded-full border border-ink/20 bg-lime/40 px-3 py-1">
        <Text className="font-sans-semibold text-xs uppercase text-ink">
          En stock
        </Text>
      </View>
    );
  }
  if (status === "OUT_OF_STOCK") {
    return (
      <View className="rounded-full border border-ink/20 bg-pink/40 px-3 py-1">
        <Text className="font-sans-semibold text-xs uppercase text-ink">
          Rupture
        </Text>
      </View>
    );
  }
  return (
    <View className="rounded-full border border-ink/20 bg-muted px-3 py-1">
      <Text className="font-sans-semibold text-xs uppercase text-ink/50">
        En attente
      </Text>
    </View>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [watches, setWatches] = useState<Watch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWatches = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("watches")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setWatches((data ?? []) as Watch[]);
  }, [user]);

  useEffect(() => {
    fetchWatches().finally(() => setLoading(false));
  }, [fetchWatches]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWatches().finally(() => setRefreshing(false));
  }, [fetchWatches]);

  // ── Loading state ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator size="large" color="#ff803d" />
      </View>
    );
  }

  const firstName = (user?.user_metadata?.first_name as string) || null;
  const activeWatches = watches.filter((w) => w.is_active !== false);
  const pausedCount = watches.filter((w) => w.is_active === false).length;
  const inStockCount = activeWatches.filter(
    (w) => getStatus(w) === "IN_STOCK",
  ).length;

  const lastCheck =
    watches
      .map((w) => w.last_check ?? w.last_checked_at ?? null)
      .filter(Boolean)
      .sort(
        (a, b) => new Date(b!).getTime() - new Date(a!).getTime(),
      )[0] ?? null;

  const plan = (user?.user_metadata?.plan as string) ?? "free";
  const maxAlerts = plan === "pro" ? 20 : 3;

  const dateStr = formatFrenchDate(new Date());

  // ── Stats ──────────────────────────────────────────────────────────────
  const stats = [
    {
      label: "Alertes actives",
      value: `${activeWatches.length} / ${maxAlerts}`,
      sub: pausedCount > 0 ? `${pausedCount} en pause` : undefined,
      emoji: "🔔",
      iconBg: "rgba(255,128,61,0.20)", // orange
    },
    {
      label: "En stock",
      value: String(inStockCount),
      sub: "En ce moment",
      emoji: "📈",
      iconBg: "rgba(200,242,60,0.50)", // lime
    },
    {
      label: "Dernier check",
      value: relativeTime(lastCheck),
      sub: "Worker actif",
      emoji: "🕐",
      iconBg: "rgba(54,155,255,0.20)", // blue
    },
    {
      label: "Plan",
      value: plan === "pro" ? "Pro" : "Free",
      sub: plan === "free" ? "Passer à Pro →" : "Gérer →",
      emoji: "📦",
      iconBg:
        plan === "pro"
          ? "rgba(245,158,11,0.22)" // amber
          : "rgba(11,11,11,0.06)",
    },
  ];

  // ── Watch card ─────────────────────────────────────────────────────────
  const renderWatch = ({ item }: { item: Watch }) => {
    const status = getStatus(item);
    const domain = shortHost(item.url);
    const variant = item.variant_label ?? item.size_label ?? null;

    return (
      <TouchableOpacity activeOpacity={0.9}>
        <View
          className="flex-row items-start gap-3 rounded-2xl border-2 border-ink bg-paper p-4"
          style={brutal}
        >
          {/* Product image */}
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              className="h-20 w-20 rounded-xl bg-muted"
              resizeMode="cover"
            />
          ) : (
            <View className="h-20 w-20 items-center justify-center rounded-xl bg-muted">
              <Text className="text-[10px] text-ink/30">Sans visuel</Text>
            </View>
          )}

          {/* Body */}
          <View className="min-w-0 flex-1 gap-1">
            <Text
              className="font-display text-base font-semibold leading-tight text-ink"
              numberOfLines={2}
            >
              {item.name ?? "Produit sans titre"}
            </Text>

            <Text className="text-xs text-ink/50" numberOfLines={1}>
              {domain}
            </Text>

            {/* Variant pill + price row */}
            <View className="flex-row flex-wrap items-center gap-2">
              {variant ? (
                <View className="rounded-full border border-ink/20 px-3 py-1">
                  <Text className="text-xs text-ink">{variant}</Text>
                </View>
              ) : null}
              {item.price != null ? (
                <Text className="font-sans-medium text-sm text-ink">
                  {formatPrice(item.price, item.currency)}
                </Text>
              ) : null}
            </View>

            {/* Last check time */}
            {(item.last_check || item.last_checked_at) && (
              <Text className="text-[11px] text-ink/40">
                Vérif.{" "}
                {relativeTime(
                  item.last_check ?? item.last_checked_at ?? null,
                )}
              </Text>
            )}
          </View>

          {/* Status badge */}
          <View className="shrink-0">
            {item.is_active === false ? (
              <View className="rounded-full border border-ink/20 bg-muted px-3 py-1">
                <Text className="font-sans-semibold text-xs uppercase text-ink/50">
                  En pause
                </Text>
              </View>
            ) : (
              <StatusBadge status={status} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ── Empty state ────────────────────────────────────────────────────────
  const renderEmpty = () => (
    <View className="items-center px-4 pt-4">
      <View className="w-full rounded-3xl border-2 border-dashed border-ink/30 bg-cream/50 p-8">
        <View className="items-center gap-6">
          {/* Bell icon in lime rounded-2xl box */}
          <View className="relative">
            <View
              className="h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-lime"
              style={brutalSm}
            >
              <Text className="text-2xl">🔔</Text>
            </View>
            <View className="absolute -right-2 -top-2 h-5 w-5 items-center justify-center rounded-full border-2 border-ink bg-orange">
              <Text className="text-[9px] font-sans-bold text-ink">1</Text>
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-center font-display text-xl text-ink">
              {firstName
                ? `Prête à traquer, ${firstName} ?`
                : "Prêt à commencer ?"}
            </Text>
            <Text className="mx-auto max-w-sm text-center text-sm leading-relaxed text-ink/60">
              Colle l&apos;URL d&apos;un produit qui t&apos;a échappé, choisis
              ta taille, et on s&apos;occupe du reste.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/add")}
            className="w-full rounded-xl border-2 border-ink bg-orange px-8 py-3.5"
            style={brutalSm}
            activeOpacity={0.85}
          >
            <Text className="text-center font-display text-base font-bold uppercase tracking-wide text-ink">
              + Ajouter ma première alerte
            </Text>
          </TouchableOpacity>

          <Text className="text-xs text-ink/30">
            Zara, COS, Aritzia, Sézane, Uniqlo et 120+ autres marques
          </Text>
        </View>
      </View>
    </View>
  );

  // ── Header + Stats + CTA (rendered as ListHeaderComponent) ─────────────
  const renderHeader = () => (
    <View className="gap-6 px-4 pt-16">
      {/* ── Header area ────────────────────────────────────────────────── */}
      <View className="gap-1">
        {/* Date in French */}
        <Text className="font-sans-medium text-sm uppercase tracking-wider text-ink/70">
          {dateStr}
        </Text>

        {/* Greeting with lime underline */}
        <Text className="font-display text-3xl tracking-tighter text-ink">
          {firstName ? (
            <>
              Bonjour{" "}
              <Text className="font-display text-3xl tracking-tighter text-ink">
                {firstName}
              </Text>
            </>
          ) : (
            "Mes alertes"
          )}
        </Text>
        {firstName ? (
          <View className="mt-0.5 h-1 w-16 -rotate-1 bg-lime" />
        ) : null}

        {/* Stats subtitle */}
        <Text className="mt-2 font-sans text-sm text-ink/50">
          {activeWatches.length} alerte{activeWatches.length !== 1 ? "s" : ""}{" "}
          active{activeWatches.length !== 1 ? "s" : ""}
          {inStockCount > 0 && `, ${inStockCount} en stock`}
          {lastCheck && ` — dernière vérif. ${relativeTime(lastCheck)}`}
        </Text>
      </View>

      {/* ── Stats grid 2x2 ─────────────────────────────────────────────── */}
      <View className="flex-row flex-wrap gap-3">
        {stats.map((s) => (
          <View
            key={s.label}
            className="w-[47%] rounded-2xl border-2 border-ink bg-paper p-4"
            style={brutalSm}
          >
            {/* Icon in colored circle */}
            <StatIcon emoji={s.emoji} bg={s.iconBg} />

            {/* Label */}
            <Text className="mt-2 font-sans-medium text-xs text-ink/70">
              {s.label}
            </Text>

            {/* Value */}
            <Text
              className="mt-0.5 font-display text-2xl tracking-tighter text-ink"
              numberOfLines={1}
            >
              {s.value}
            </Text>

            {/* Sub */}
            {s.sub ? (
              <Text
                className="mt-0.5 font-sans text-xs text-ink/50"
                numberOfLines={1}
              >
                {s.sub}
              </Text>
            ) : null}
          </View>
        ))}
      </View>

      {/* ── "Ajouter" CTA ──────────────────────────────────────────────── */}
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/add")}
        className="h-14 w-full flex-row items-center justify-center gap-2 rounded-xl border-2 border-ink bg-orange"
        style={brutal}
        activeOpacity={0.85}
      >
        <Text className="font-display text-base font-bold uppercase tracking-wide text-ink">
          + Ajouter une alerte
        </Text>
      </TouchableOpacity>

      {/* ── Watch list section heading ─────────────────────────────────── */}
      {watches.length > 0 && (
        <View>
          <Text className="font-sans-semibold text-xs uppercase tracking-widest text-ink/40">
            Mes alertes ({watches.length})
          </Text>
        </View>
      )}
    </View>
  );

  // ── Main render ────────────────────────────────────────────────────────
  return (
    <View className="flex-1 bg-cream">
      <FlatList
        data={watches}
        keyExtractor={(item) => item.id}
        renderItem={renderWatch}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 32,
          gap: 12,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ff803d"
            colors={["#ff803d"]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
