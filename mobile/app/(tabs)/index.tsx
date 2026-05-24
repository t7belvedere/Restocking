import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { getSubscription, type SubscriptionInfo } from "@/lib/stripe";
import { brutalSm, brutal } from "@/lib/shadows";
import { useFadeUp, useScaleIn, useStaggerList } from "@/lib/animations";
import { useRouter } from "expo-router";
import {
  Bell,
  PackageCheck,
  Clock,
  Crown,
  Plus,
  ChevronRight,
} from "lucide-react-native";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Watch {
  id: string;
  user_id: string;
  name: string;
  image_url?: string | null;
  domain?: string | null;
  url?: string | null;
  size?: string | null;
  price?: number | null;
  currency?: string;
  status?: string | null;
  in_stock?: boolean | null;
  is_in_stock?: boolean | null;
  last_checked_at?: string | null;
  updated_at?: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DAYS = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];
const MONTHS = [
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
  return `${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

function extractDomain(url: string | null | undefined): string {
  if (!url) return "";
  try {
    const host = new URL(url).hostname;
    return host.replace(/^www\./, "");
  } catch {
    return url
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0];
  }
}

function isInStock(watch: Watch): boolean {
  if (watch.status === "IN_STOCK") return true;
  if (watch.status === "OUT_OF_STOCK") return false;
  if (typeof watch.in_stock === "boolean") return watch.in_stock;
  if (typeof watch.is_in_stock === "boolean") return watch.is_in_stock;
  return false;
}

function getDomainLabel(watch: Watch): string {
  return watch.domain || extractDomain(watch.url) || "";
}

function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);

  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffH < 24) return `Il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "Hier";
  if (diffD < 7) return `Il y a ${diffD}j`;
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

function StatCard({
  icon,
  iconBg,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
}) {
  return (
    <View
      className="flex-1 rounded-2xl border-2 border-ink bg-paper p-4"
      style={brutalSm}
    >
      <View
        className={`mb-3 h-10 w-10 items-center justify-center rounded-full ${iconBg}`}
      >
        {icon}
      </View>
      <Text
        className="font-display text-xl text-ink"
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      <Text className="mt-1 font-sans text-xs text-ink/50">{label}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState({ onAdd, t }: { onAdd: () => void; t: any }) {
  const fadeUp = useFadeUp();

  return (
    <Animated.View style={fadeUp}>
      <View className="mx-4 items-center rounded-3xl border-2 border-dashed border-ink/30 px-6 py-12">
        <View className="mb-5 h-16 w-16 items-center justify-center rounded-2xl bg-lime">
          <Bell size={28} color="#0b0b0b" strokeWidth={2.5} />
        </View>
        <Text className="mb-2 text-center font-display text-lg text-ink">
          {t.readyToStart}
        </Text>
        <Text className="mb-6 text-center font-sans text-sm leading-relaxed text-ink/50">
          {t.readyToStartDesc}
        </Text>
        <TouchableOpacity
          onPress={onAdd}
          className="w-full rounded-xl border-2 border-ink bg-orange py-3.5 shadow-brutal active:translate-y-0.5"
          activeOpacity={0.8}
        >
          <Text className="text-center font-display text-base font-bold text-white">
            {t.addAlert}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Watch List Item
// ---------------------------------------------------------------------------

function WatchListItem({
  watch,
  onPress,
  style,
}: {
  watch: Watch;
  onPress: () => void;
  style?: any;
}) {
  const inStock = isInStock(watch);
  const domain = getDomainLabel(watch);

  return (
    <Animated.View style={style}>
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.95}
      className="mb-3 flex-row items-center rounded-2xl border-2 border-ink bg-paper p-4"
      style={brutal}
    >
      {/* Thumbnail */}
      {watch.image_url ? (
        <Image
          source={{ uri: watch.image_url }}
          className="h-20 w-20 rounded-xl bg-muted"
          resizeMode="cover"
        />
      ) : (
        <View className="h-20 w-20 items-center justify-center rounded-xl bg-muted">
          <Text className="font-mono text-xs text-ink/30">img</Text>
        </View>
      )}

      {/* Details */}
      <View className="ml-4 flex-1 gap-1.5">
        <Text
          className="font-display text-base font-semibold text-ink"
          numberOfLines={2}
        >
          {watch.name}
        </Text>

        {domain ? (
          <Text className="font-sans text-xs text-ink/50" numberOfLines={1}>
            {domain}
          </Text>
        ) : null}

        <View className="flex-row flex-wrap items-center gap-2">
          {/* Size pill */}
          {watch.size ? (
            <View className="rounded-full border border-ink/20 px-3 py-1">
              <Text className="font-sans text-xs text-ink/70">
                {watch.size}
              </Text>
            </View>
          ) : null}

          {/* Price */}
          {typeof watch.price === "number" && watch.price > 0 ? (
            <Text className="font-sans-semibold text-sm text-ink">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: watch.currency || "EUR",
              }).format(watch.price)}
            </Text>
          ) : null}
        </View>

        {/* Status badge */}
        <View
          className={`mt-0.5 self-start rounded-md px-2.5 py-0.5 ${
            inStock ? "bg-lime/40" : "bg-pink/40"
          }`}
        >
          <Text className="font-mono text-xs font-medium uppercase tracking-wider text-ink">
            {inStock ? "En stock" : "Rupture"}
          </Text>
        </View>
      </View>

      {/* Chevron */}
      <ChevronRight size={18} color="#0b0b0b" style={{ opacity: 0.3 }} />
    </TouchableOpacity>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <View className="flex-1 bg-cream">
      {/* Top bar skeleton */}
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <View className="h-4 w-32 rounded bg-ink/10" />
        <View className="h-6 w-24 rounded bg-ink/10" />
      </View>

      {/* Greeting skeleton */}
      <View className="px-4 pb-4">
        <View className="h-8 w-48 rounded bg-ink/10" />
        <View className="mt-2 h-1 w-16 rounded-full bg-lime/50" />
      </View>

      {/* Stats skeleton */}
      <View className="flex-row gap-3 px-4 pb-3">
        <View className="flex-1 rounded-2xl border-2 border-ink/10 bg-paper p-4">
          <View className="mb-3 h-10 w-10 rounded-full bg-ink/5" />
          <View className="h-6 w-8 rounded bg-ink/10" />
          <View className="mt-1 h-3 w-16 rounded bg-ink/5" />
        </View>
        <View className="flex-1 rounded-2xl border-2 border-ink/10 bg-paper p-4">
          <View className="mb-3 h-10 w-10 rounded-full bg-ink/5" />
          <View className="h-6 w-8 rounded bg-ink/10" />
          <View className="mt-1 h-3 w-16 rounded bg-ink/5" />
        </View>
      </View>
      <View className="flex-row gap-3 px-4 pb-4">
        <View className="flex-1 rounded-2xl border-2 border-ink/10 bg-paper p-4">
          <View className="mb-3 h-10 w-10 rounded-full bg-ink/5" />
          <View className="h-6 w-20 rounded bg-ink/10" />
          <View className="mt-1 h-3 w-12 rounded bg-ink/5" />
        </View>
        <View className="flex-1 rounded-2xl border-2 border-ink/10 bg-paper p-4">
          <View className="mb-3 h-10 w-10 rounded-full bg-ink/5" />
          <View className="h-6 w-12 rounded bg-ink/10" />
          <View className="mt-1 h-3 w-16 rounded bg-ink/5" />
        </View>
      </View>

      {/* CTA skeleton */}
      <View className="mx-4 h-14 rounded-xl border-2 border-ink/10 bg-orange/20" />

      {/* Watch list skeleton */}
      <View className="mt-6 px-4">
        <View className="mb-3 h-6 w-28 rounded bg-ink/10" />
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            className="mb-3 flex-row rounded-2xl border-2 border-ink/10 bg-paper p-4"
          >
            <View className="h-20 w-20 rounded-xl bg-ink/5" />
            <View className="ml-4 flex-1 gap-2">
              <View className="h-5 w-3/4 rounded bg-ink/10" />
              <View className="h-3 w-1/2 rounded bg-ink/5" />
              <View className="h-4 w-16 rounded bg-ink/5" />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [watches, setWatches] = useState<Watch[]>([]);
  const [sub, setSub] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const staggerStyle = useStaggerList(watches.length);

  const fetchWatches = useCallback(async () => {
    if (!user) return;
    const [watchRes, subRes] = await Promise.all([
      supabase
        .from("watches")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      getSubscription(),
    ]);

    if (!watchRes.error && watchRes.data) {
      setWatches(watchRes.data as Watch[]);
    }
    setSub(subRes);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchWatches();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user, fetchWatches]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWatches();
    setRefreshing(false);
  }, [fetchWatches]);

  // -----------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------

  if (authLoading || loading) {
    return (
      <View style={{ paddingTop: insets.top }} className="flex-1 bg-cream">
        <LoadingSkeleton />
      </View>
    );
  }

  // -----------------------------------------------------------------------
  // Computed stats
  // -----------------------------------------------------------------------

  const activeAlerts = watches.length;
  const inStockCount = watches.filter(isInStock).length;

  const lastCheckedRaw = watches
    .map((w) => w.last_checked_at || w.updated_at)
    .filter(Boolean)
    .sort()
    .reverse()[0];
  const lastCheckedLabel = formatRelativeTime(lastCheckedRaw);

  const firstName =
    (user?.user_metadata?.first_name as string) ||
    (user?.user_metadata?.full_name as string)?.split(" ")[0] ||
    (user?.email ? user.email.split("@")[0] : "");

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-cream">
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0b0b0b"
            colors={["#0b0b0b"]}
          />
        }
      >
        {/* ── Top bar ──────────────────────────────────────────────── */}

        <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
          <Text className="font-sans-semibold text-sm uppercase tracking-wider text-ink/70">
            {formatFrenchDate(new Date())}
          </Text>
          <Text className="font-display text-xl text-ink">restocking</Text>
        </View>

        {/* ── Greeting ─────────────────────────────────────────────── */}

        <View className="px-4 pb-4">
          <Text className="font-display text-2xl text-ink">
            {t.greeting}{firstName ? ` ${firstName}` : ""}
          </Text>
          <View className="mt-1 h-1 w-16 rounded-full bg-lime" />
        </View>

        {/* ── Stats grid (2x2) ─────────────────────────────────────── */}

        <View className="flex-row gap-3 px-4 pb-3">
          <StatCard
            icon={<Bell size={18} color="#fff" strokeWidth={2.5} />}
            iconBg="bg-orange"
            label={t.activeAlerts}
            value={String(activeAlerts)}
          />
          <StatCard
            icon={<PackageCheck size={18} color="#0b0b0b" strokeWidth={2.5} />}
            iconBg="bg-lime"
            label={t.inStockCount}
            value={String(inStockCount)}
          />
        </View>
        <View className="flex-row gap-3 px-4 pb-4">
          <StatCard
            icon={<Clock size={18} color="#fff" strokeWidth={2.5} />}
            iconBg="bg-blue"
            label={t.lastCheck}
            value={lastCheckedLabel}
          />
          <StatCard
            icon={<Crown size={18} color="#0b0b0b" strokeWidth={2.5} />}
            iconBg="bg-cream"
            label={t.planLabel}
            value={sub?.plan === "pro" ? "Pro" : t.freePlan}
          />
        </View>

        {/* ── Add alert CTA ────────────────────────────────────────── */}

        <TouchableOpacity
          onPress={() => router.push("/add" as any)}
          activeOpacity={0.8}
          className="mx-4 mb-6 h-14 flex-row items-center justify-center gap-2 rounded-xl border-2 border-ink bg-orange"
          style={brutal}
        >
          <Plus size={20} color="#fff" strokeWidth={3} />
          <Text className="font-display text-lg font-bold text-white">
            {t.addAlert}
          </Text>
        </TouchableOpacity>

        {/* ── Mes alertes heading ──────────────────────────────────── */}

        {watches.length > 0 && (
          <Text className="mb-3 px-4 font-display text-lg text-ink">
            {t.myAlerts}
          </Text>
        )}

        {/* ── Watch list ───────────────────────────────────────────── */}

        {watches.length === 0 ? (
          <EmptyState onAdd={() => router.push("/add" as any)} t={t} />
        ) : (
          <View className="px-4">
            {watches.map((watch, i) => (
              <WatchListItem
                key={watch.id}
                watch={watch}
                onPress={() =>
                  router.push(
                    `/watch/${watch.id}` as any
                  )
                }
                style={staggerStyle(i)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
