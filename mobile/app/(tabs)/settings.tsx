import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from "react-native";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export default function Settings() {
  const { user, signOut } = useAuth();
  const { t, locale, setLocale } = useI18n();

  const handleSignOut = () => {
    Alert.alert(t.signOut, "Es-tu sur(e) ?", [
      { text: "Annuler", style: "cancel" },
      { text: t.signOut, style: "destructive", onPress: signOut },
    ]);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.scroll}>
      <Text style={s.title}>{t.settings}</Text>

      <View style={s.section}>
        <Text style={s.sectionTitle}>{t.account}</Text>
        <View style={s.card}>
          <View style={[s.avatar, { backgroundColor: "#C9F040" }]}>
            <Text style={s.avatarText}>{(user?.email ?? "?")[0].toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.email}>{user?.email ?? "..."}</Text>
            <Text style={s.uid}>{user?.id?.slice(0, 8)}...</Text>
          </View>
        </View>

        <TouchableOpacity style={s.row} onPress={() => setLocale(locale === "fr" ? "en" : "fr")}>
          <Text style={s.rowLabel}>{t.language}</Text>
          <View style={s.badge}>
            <Text style={s.badgeText}>{locale.toUpperCase()}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Abonnement</Text>
        <View style={s.card}>
          <Text style={s.planName}>{t.freePlan}</Text>
          <Text style={s.planDesc}>3 articles · 30 min</Text>
        </View>
        <TouchableOpacity style={[s.btn, { backgroundColor: "#296FEC" }]}>
          <Text style={s.btnText}>{t.upgrade} — 7,99€/mois</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={s.logout} onPress={handleSignOut}>
        <Text style={s.logoutText}>{t.signOut}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F8F6" },
  scroll: { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 },
  title: { fontSize: 30, fontWeight: "800", color: "#262626", letterSpacing: -0.5, marginBottom: 32 },
  section: { marginBottom: 32, gap: 12 },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: "#737373", textTransform: "uppercase", letterSpacing: 2 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 2, borderColor: "#262626", backgroundColor: "#FFF", padding: 16, shadowColor: "#262626", shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0 },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: "#262626", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 18, fontWeight: "700", color: "#262626" },
  email: { fontSize: 16, fontWeight: "600", color: "#262626" },
  uid: { fontSize: 12, color: "#737373" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 12, borderWidth: 2, borderColor: "#262626", backgroundColor: "#FFF", padding: 16, shadowColor: "#262626", shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0 },
  rowLabel: { fontSize: 16, fontWeight: "600", color: "#262626" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: "#262626", backgroundColor: "#F5F5F4" },
  badgeText: { fontSize: 11, fontWeight: "600", color: "#262626" },
  planName: { fontSize: 16, fontWeight: "600", color: "#262626" },
  planDesc: { fontSize: 12, color: "#737373", marginTop: 2 },
  btn: { borderRadius: 10, borderWidth: 2, borderColor: "#262626", backgroundColor: "#F85C15", paddingHorizontal: 24, paddingVertical: 16, alignItems: "center", shadowColor: "#262626", shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 },
  btnText: { fontSize: 16, fontWeight: "700", color: "#FFF" },
  logout: { marginTop: 16, borderRadius: 10, borderWidth: 2, borderColor: "#EF4444", backgroundColor: "#FFF", paddingHorizontal: 24, paddingVertical: 16, alignItems: "center" },
  logoutText: { fontSize: 16, fontWeight: "600", color: "#EF4444" },
});
