import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Pressable,
  Animated,
  Alert,
} from "react-native";
import { router } from "expo-router";
import {
  Bell,
  Plus,
  TrendingUp,
  Clock,
  Shield,
  ChevronRight,
  Pause,
  Trash2,
  Play,
} from "lucide-react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { useAuth } from "@/lib/auth";
import { getWatches, toggleWatch, deleteWatch } from "@/lib/api";
import { cn, relativeTime } from "@/lib/utils";
import { WatchCard } from "@/components/watch-card";

/* ── Skeleton placeholder ─────────────────────────────────── */

function SkeletonCard() {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  return (
    <Animated.View
      className="bg-paper border-2 border-ink p-3 rounded-xl mb-3 mx-4"
      style={{ opacity, boxShadow: "4px 4px 0 0 #262626" }}
    >
      <View className="flex-row gap-3">
        <View className="w-16 h-16 rounded-xl bg-muted" />
        <View className="flex-1 gap-2">
          <View className="h-4 bg-muted rounded-lg w-3/4" />
          <View className="h-3 bg-muted rounded-lg w-1/2" />
          <View className="h-3 bg-muted rounded-lg w-1/3" />
        </View>
      </View>
    </Animated.View>
  );
}

function SkeletonList() {
  return (
    <View className="pt-20">
      {[1, 2, 3, 4].map((i) => (<SkeletonCard key={i} />))}
    </View>
  );
}

/* ── Empty state ──────────────────────────────────────────── */

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View
        className="w-24 h-24 rounded-2xl bg-lime border-2 border-ink items-center justify-center mb-6"
        style={{ boxShadow: "4px 4px 0 0 #262626" }}
      >
        <Bell size={40} color="#262626" strokeWidth={2.5} />
      </View>
      <Text className="font-display text-2xl text-ink text-center mb-3">Aucune alerte</Text>
      <Text className="font-sans text-ink-soft text-center text-base leading-relaxed mb-8">
        Colle l'URL d'un produit et sois alerté dès que ta taille revient en stock.
      </Text>
      <Pressable
        onPress={() => router.push("/(tabs)/add")}
        className="bg-orange border-2 border-ink rounded-xl px-8 py-4"
        style={{ boxShadow: "4px 4px 0 0 #262626" }}
      >
        <Text className="font-bold text-white text-base">Créer une alerte</Text>
      </Pressable>
    </View>
  );
}

/* ── Stat card ────────────────────────────────────────────── */

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <View className="bg-paper border-2 border-ink rounded-xl p-3 flex-1 min-w-[45%]" style={{ boxShadow: "3px 3px 0 0 #262626" }}>
      <Icon size={18} color={color} strokeWidth={2.5} />
      <Text className="font-display text-lg text-ink mt-2">{value}</Text>
      <Text className="font-sans text-xs text-ink-soft mt-0.5">{label}</Text>
    </View>
  );
}

/* ── Swipe actions ────────────────────────────────────────── */

function renderRightActions(watchId: string, isActive: boolean, onToggle: (id: string, active: boolean) => void, onDelete: (id: string) => void) {
  return (
    <View className="flex-row items-center mb-3 mr-4">
      <Pressable
        onPress={() => onToggle(watchId, !isActive)}
        className={cn("w-16 h-full items-center justify-center rounded-l-xl border-2 border-r-0 border-ink", isActive ? "bg-muted" : "bg-lime")}
        style={{ boxShadow: "4px 4px 0 0 #262626" }}
      >
        {isActive ? <Pause size={20} color="#737373" strokeWidth={2.5} /> : <Play size={20} color="#262626" strokeWidth={2.5} />}
      </Pressable>
      <Pressable
        onPress={() => onDelete(watchId)}
        className="w-16 h-full items-center justify-center bg-destructive rounded-r-xl border-2 border-l-0 border-ink"
        style={{ boxShadow: "4px 4px 0 0 #262626" }}
      >
        <Trash2 size={20} color="#FFFFFF" strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}

/* ── Main screen ──────────────────────────────────────────── */

export default function HomeScreen() {
  const { user } = useAuth();
  const [watches, setWatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  const fetchWatches = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getWatches(user.id);
      setWatches(Array.isArray(data) ? data : []);
    } catch {
      setWatches([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWatches();
  }, [fetchWatches]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWatches();
    setRefreshing(false);
  }, [fetchWatches]);

  const handleToggle = useCallback(async (id: string, active: boolean) => {
    swipeableRefs.current.get(id)?.close();
    if (!user) return;
    await toggleWatch(id, user.id, active);
    setWatches((prev) => prev.map((w) => (w.id === id ? { ...w, is_active: active } : w)));
  }, [user]);

  const handleDelete = useCallback(async (id: string) => {
    swipeableRefs.current.get(id)?.close();
    if (!user) return;
    Alert.alert("Supprimer", "Supprimer cette alerte ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: async () => {
        await deleteWatch(id, user.id);
        setWatches((prev) => prev.filter((w) => w.id !== id));
      }},
    ]);
  }, [user]);

  const handlePress = useCallback((id: string) => {
    router.push({ pathname: "/watch/[id]", params: { id } });
  }, []);

  const activeCount = watches.filter((w) => w.is_active).length;
  const inStockCount = watches.filter((w) => w.last_status === "IN_STOCK").length;
  const lastCheck = watches.reduce((latest: string | null, w: any) => {
    if (!w.last_check) return latest;
    if (!latest) return w.last_check;
    return w.last_check > latest ? w.last_check : latest;
  }, null);

  const greeting = user?.email ? `Salut ${user.email.split("@")[0]} 👋` : "Salut 👋";

  if (loading) return <SkeletonList />;
  if (watches.length === 0) return <EmptyState />;

  return (
    <View className="flex-1 bg-cream">
      <FlatList
        data={watches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B35" colors={["#FF6B35"]} />}
        ListHeaderComponent={
          <View className="px-4 pt-4 pb-2">
            <Text className="font-display text-xl text-ink mb-4">{greeting}</Text>
            <View className="flex-row flex-wrap gap-3 mb-5">
              <StatCard icon={Bell} label="Alertes actives" value={String(activeCount)} color="#FF6B35" />
              <StatCard icon={TrendingUp} label="En stock" value={String(inStockCount)} color="#A3E635" />
              <StatCard icon={Clock} label="Dernière vérif" value={relativeTime(lastCheck)} color="#3B82F6" />
              <StatCard icon={Shield} label="Plan" value="Gratuit" color="#262626" />
            </View>
            <Text className="font-display text-ink text-lg mb-3">Mes alertes</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Swipeable
            ref={(ref) => {
              if (ref) swipeableRefs.current.set(item.id, ref);
              else swipeableRefs.current.delete(item.id);
            }}
            renderRightActions={() => renderRightActions(item.id, item.is_active, handleToggle, handleDelete)}
            overshootRight={false}
            friction={2}
          >
            <WatchCard
              id={item.id}
              name={item.name}
              image_url={item.image_url}
              url={item.url}
              variant_label={item.variant_label}
              price={item.price}
              last_status={item.last_status ?? "UNKNOWN"}
              last_check={item.last_check}
              is_active={item.is_active}
              onPress={handlePress}
            />
          </Swipeable>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
