import { useEffect, useState } from "react";
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

interface Watch {
  id: string;
  name: string;
  image_url?: string;
  size_label?: string;
  price?: number;
  currency?: string;
  in_stock: boolean;
  last_checked_at?: string;
  url: string;
}

// ── Neo-brutalist hard shadows ────────────────────────────────────────────
const shadowHard = {
  shadowColor: "#262626",
  shadowOffset: { width: 2, height: 2 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 4,
} as const;

const shadowHardLg = {
  shadowColor: "#262626",
  shadowOffset: { width: 4, height: 4 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 8,
} as const;

// ── Price formatter ───────────────────────────────────────────────────────
const fmtPrice = (price: number, currency: string | undefined) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency ?? "EUR",
  }).format(price);

// ── Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [watches, setWatches] = useState<Watch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWatches = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("watches")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setWatches(
      (data ?? []).map((w: any) => ({ ...w, in_stock: w.in_stock ?? false })),
    );
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchWatches();
  }, [user]);

  // ── Loading state ────────────────────────────────────────────────────
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F9F8F6]">
        <ActivityIndicator size="large" color="#F85C15" />
      </View>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────
  if (watches.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F9F8F6] px-8">
        <Text className="text-2xl font-bold text-[#262626] text-center">
          {t.noWatches}
        </Text>
        <Text className="text-base text-[#737373] text-center mt-2">
          {t.noWatchesDesc}
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/add")}
          className="mt-6 rounded-xl border-2 border-[#262626] bg-[#F85C15] px-5 py-3.5"
          style={shadowHardLg}
          activeOpacity={0.85}
        >
          <Text className="text-base font-bold text-white">
            + {t.addWatch}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Watch list ───────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: Watch }) => (
    <View
      className="flex-row rounded-xl border-2 border-[#262626] bg-white p-3"
      style={shadowHard}
    >
      {/* Product image */}
      {item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          className="w-[72px] h-[72px] rounded-lg border border-[#E5E5E5]"
          resizeMode="cover"
        />
      ) : (
        <View className="w-[72px] h-[72px] rounded-lg border border-[#E5E5E5] bg-[#F5F5F4]" />
      )}

      {/* Card body */}
      <View className="flex-1 ml-3 gap-1">
        <Text
          className="text-base font-semibold text-[#262626]"
          numberOfLines={2}
        >
          {item.name}
        </Text>

        {/* Badges */}
        <View className="flex-row gap-1.5">
          <View
            className={`px-2.5 py-0.5 rounded-md border border-[#262626] ${item.in_stock ? "bg-[#C9F040]" : "bg-[#F5A0B5]"}`}
          >
            <Text className="text-[11px] font-medium text-[#262626] uppercase tracking-widest">
              {item.in_stock ? t.inStock : t.outOfStock}
            </Text>
          </View>
          {item.size_label ? (
            <View className="px-2.5 py-0.5 rounded-md border border-[#262626] bg-[#F5F5F4]">
              <Text className="text-[11px] font-medium text-[#262626] uppercase tracking-widest">
                {item.size_label}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Price */}
        {item.price ? (
          <Text className="text-sm text-[#262626] mt-0.5">
            {fmtPrice(item.price, item.currency)}
          </Text>
        ) : null}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#F9F8F6]">
      {/* Top bar */}
      <View className="bg-white border-b-2 border-[#262626] px-6 pb-4 pt-14">
        <Text className="text-3xl font-extrabold text-[#262626] tracking-tight">
          restocking
        </Text>
        <Text className="text-sm text-[#737373] mt-1">
          {watches.length} alerte{watches.length > 1 ? "s" : ""}
        </Text>
      </View>

      {/* Watch list */}
      <FlatList
        data={watches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchWatches();
            }}
          />
        }
      />
    </View>
  );
}
