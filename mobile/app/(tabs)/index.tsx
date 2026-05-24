import { useEffect, useState } from "react";
import {
  View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet, Image, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

interface Watch {
  id: string; name: string; image_url?: string;
  size_label?: string; price?: number; currency?: string;
  in_stock: boolean; last_checked_at?: string; url: string;
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
    const { data } = await supabase.from("watches").select("*")
      .eq("user_id", user.id).order("created_at", { ascending: false });
    setWatches((data ?? []).map((w: any) => ({ ...w, in_stock: w.in_stock ?? false })));
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchWatches(); }, [user]);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#F85C15" />
      </View>
    );
  }

  if (watches.length === 0) {
    return (
      <View style={s.center}>
        <Text style={s.emptyTitle}>{t.noWatches}</Text>
        <Text style={s.emptyDesc}>{t.noWatchesDesc}</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/add")} style={s.addBtn}>
          <Text style={s.addBtnText}>+ {t.addWatch}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.bar}>
        <Text style={s.barTitle}>restocking</Text>
        <Text style={s.barSub}>{watches.length} alerte{watches.length > 1 ? "s" : ""}</Text>
      </View>
      <FlatList
        data={watches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        renderItem={({ item }) => (
          <View style={s.card}>
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={s.cardImg} resizeMode="cover" />
            ) : (
              <View style={[s.cardImg, s.cardImgPlaceholder]} />
            )}
            <View style={s.cardBody}>
              <Text style={s.cardName} numberOfLines={2}>{item.name}</Text>
              <View style={s.badges}>
                <View style={[s.badge, item.in_stock ? s.badgeSuccess : s.badgeDanger]}>
                  <Text style={s.badgeText}>{item.in_stock ? t.inStock : t.outOfStock}</Text>
                </View>
                {item.size_label ? (
                  <View style={s.badgeDefault}>
                    <Text style={s.badgeText}>{item.size_label}</Text>
                  </View>
                ) : null}
              </View>
              {item.price ? (
                <Text style={s.price}>
                  {new Intl.NumberFormat("fr-FR", { style: "currency", currency: item.currency ?? "EUR" }).format(item.price)}
                </Text>
              ) : null}
            </View>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchWatches(); }} />}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F8F6" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F9F8F6", paddingHorizontal: 32 },
  bar: { backgroundColor: "#FFF", borderBottomWidth: 2, borderBottomColor: "#262626", paddingHorizontal: 24, paddingBottom: 16, paddingTop: 56 },
  barTitle: { fontSize: 30, fontWeight: "800", color: "#262626", letterSpacing: -0.5 },
  barSub: { marginTop: 4, fontSize: 14, color: "#737373" },
  list: { padding: 16, gap: 12 },
  card: { flexDirection: "row", borderRadius: 12, borderWidth: 2, borderColor: "#262626", backgroundColor: "#FFF", padding: 12, gap: 12, shadowColor: "#262626", shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0 },
  cardImg: { width: 72, height: 72, borderRadius: 8, borderWidth: 1, borderColor: "#E5E5E5" },
  cardImgPlaceholder: { backgroundColor: "#F5F5F4" },
  cardBody: { flex: 1, gap: 4 },
  cardName: { fontSize: 16, fontWeight: "600", color: "#262626" },
  badges: { flexDirection: "row", gap: 6 },
  badge: { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: "#262626" },
  badgeSuccess: { backgroundColor: "#C9F040" },
  badgeDanger: { backgroundColor: "#F5A0B5" },
  badgeDefault: { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: "#262626", backgroundColor: "#F5F5F4" },
  badgeText: { fontSize: 11, fontWeight: "500", color: "#262626", textTransform: "uppercase", letterSpacing: 1 },
  price: { fontSize: 14, color: "#262626", marginTop: 2 },
  emptyTitle: { fontSize: 24, fontWeight: "700", color: "#262626", textAlign: "center" },
  emptyDesc: { fontSize: 16, color: "#737373", textAlign: "center", marginTop: 8 },
  addBtn: { marginTop: 24, borderRadius: 10, borderWidth: 2, borderColor: "#262626", backgroundColor: "#F85C15", paddingHorizontal: 20, paddingVertical: 14, shadowColor: "#262626", shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 },
  addBtnText: { fontSize: 16, fontWeight: "700", color: "#FFF" },
});
