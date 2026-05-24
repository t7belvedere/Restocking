import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { WatchCard } from "@/components/watch-card";
import { Plus } from "lucide-react-native";

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
      (data ?? []).map((w) => ({
        ...w,
        in_stock: w.in_stock ?? false,
      })),
    );
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchWatches();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWatches();
  };

  if (!loading && watches.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-cream px-8">
        <Text className="text-center font-display text-2xl font-bold text-ink">
          {t.noWatches}
        </Text>
        <Text className="mt-2 text-center font-sans text-base text-ink-soft">
          {t.noWatchesDesc}
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/add")}
          className="mt-6 flex-row items-center gap-2 rounded-lg border-2 border-ink bg-primary px-6 py-4 shadow-brutal"
        >
          <Plus size={20} color="#FFFFFF" />
          <Text className="font-display text-base font-bold text-primary-foreground">
            {t.addWatch}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-cream">
      <View className="border-b-2 border-ink bg-paper px-6 pb-4 pt-14">
        <Text className="font-display text-3xl font-extrabold text-ink tracking-tight">
          restocking
        </Text>
        <Text className="mt-1 font-sans text-sm text-ink-soft">
          {watches.length} {watches.length <= 1 ? "alerte" : "alertes"}
        </Text>
      </View>

      <FlatList
        data={watches}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4 gap-3"
        renderItem={({ item }) => (
          <WatchCard
            name={item.name}
            imageUrl={item.image_url}
            size={item.size_label}
            price={item.price}
            currency={item.currency}
            inStock={item.in_stock}
            lastChecked={
              item.last_checked_at
                ? new Date(item.last_checked_at).toLocaleDateString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : undefined
            }
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}
