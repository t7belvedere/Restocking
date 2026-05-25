import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { router } from "expo-router";
import {
  LogOut,
  Shield,
  Bell,
  CreditCard,
  ChevronRight,
  Crown,
  Sparkles,
} from "lucide-react-native";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const isPro = false; // TODO: derive from user metadata / subscription status

  const handleSignOut = () => {
    Alert.alert(
      "Deconnexion",
      "Es-tu sur de vouloir te deconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Deconnexion",
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace("/(auth)/login");
          },
        },
      ],
    );
  };

  const handleUpgrade = () => {
    router.push("/upgrade");
  };

  return (
    <ScrollView
      className="flex-1 bg-cream"
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="px-4 pt-6 pb-4">
        <Text className="font-display text-2xl text-ink mb-6">Profil</Text>

        {/* User info card */}
        <View
          className="bg-paper border-2 border-ink rounded-xl p-4 mb-4"
          style={{ boxShadow: "4px 4px 0 0 #262626" }}
        >
          <View className="flex-row items-center gap-4">
            {/* Avatar */}
            <View
              className="w-12 h-12 rounded-xl bg-orange border-2 border-ink items-center justify-center"
              style={{ boxShadow: "2px 2px 0 0 #262626" }}
            >
              <Text className="font-display text-white text-lg">
                {(user?.email ?? "?")[0].toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-ink text-base">
                {user?.email ?? "—"}
              </Text>
              {isPro ? (
                <View className="flex-row items-center gap-1 mt-0.5">
                  <Crown size={14} color="#FF6B35" strokeWidth={2} />
                  <Text className="text-orange text-sm font-bold">Pro</Text>
                </View>
              ) : (
                <Text className="text-ink-soft text-sm">Gratuit</Text>
              )}
            </View>
          </View>
        </View>

        {/* Plan card */}
        <Pressable onPress={handleUpgrade}>
          <View
            className={cn(
              "bg-paper border-2 rounded-xl p-4 mb-4",
              isPro ? "border-blue" : "border-ink",
            )}
            style={{ boxShadow: "4px 4px 0 0 #262626" }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View
                  className={cn(
                    "w-10 h-10 rounded-xl border-2 border-ink items-center justify-center",
                    isPro ? "bg-blue" : "bg-muted",
                  )}
                  style={{ boxShadow: "2px 2px 0 0 #262626" }}
                >
                  {isPro ? (
                    <Crown size={20} color="#FFFFFF" strokeWidth={2} />
                  ) : (
                    <CreditCard size={20} color="#262626" strokeWidth={2} />
                  )}
                </View>
                <View>
                  <Text className="font-bold text-ink">
                    {isPro ? "Plan Pro" : "Plan Gratuit"}
                  </Text>
                  <Text className="text-ink-soft text-sm">
                    {isPro
                      ? "Alertes illimitees"
                      : "3 alertes - 30 min"}
                  </Text>
                </View>
              </View>
              {!isPro ? (
                <View className="flex-row items-center gap-1 bg-orange px-3 py-1.5 rounded-xl border-2 border-ink">
                  <Sparkles size={14} color="#FFFFFF" strokeWidth={2} />
                  <Text className="font-bold text-white text-xs">
                    Passer a Pro
                  </Text>
                </View>
              ) : (
                <ChevronRight size={20} color="#737373" strokeWidth={2} />
              )}
            </View>
          </View>
        </Pressable>

        {/* Manage subscription (Pro only) */}
        {isPro && (
          <Pressable
            onPress={() => router.push("/upgrade")}
            className="bg-paper border-2 border-ink rounded-xl p-4 mb-4 flex-row items-center justify-between"
            style={{ boxShadow: "4px 4px 0 0 #262626" }}
          >
            <Text className="font-bold text-ink">Gerer mon abonnement</Text>
            <ChevronRight size={20} color="#737373" strokeWidth={2} />
          </Pressable>
        )}

        {/* Settings sections */}
        <View
          className="bg-paper border-2 border-ink rounded-xl mb-4 overflow-hidden"
          style={{ boxShadow: "4px 4px 0 0 #262626" }}
        >
          <Pressable
            className="flex-row items-center justify-between px-4 py-4 border-b-2 border-muted"
            onPress={() => {}}
          >
            <View className="flex-row items-center gap-3">
              <Bell size={18} color="#737373" strokeWidth={2} />
              <Text className="font-bold text-ink">Notifications</Text>
            </View>
            <ChevronRight size={16} color="#737373" strokeWidth={2} />
          </Pressable>

          <Pressable
            className="flex-row items-center justify-between px-4 py-4"
            onPress={() => {}}
          >
            <View className="flex-row items-center gap-3">
              <Shield size={18} color="#737373" strokeWidth={2} />
              <Text className="font-bold text-ink">Confidentialite</Text>
            </View>
            <ChevronRight size={16} color="#737373" strokeWidth={2} />
          </Pressable>
        </View>

        {/* Sign out */}
        <Pressable
          onPress={handleSignOut}
          className="bg-paper border-2 border-ink rounded-xl py-4 items-center mb-8"
          style={{ boxShadow: "4px 4px 0 0 #262626" }}
        >
          <View className="flex-row items-center gap-2">
            <LogOut size={18} color="#DC2626" strokeWidth={2} />
            <Text className="font-bold text-destructive text-base">
              Deconnexion
            </Text>
          </View>
        </Pressable>

        {/* Version */}
        <Text className="text-center text-ink-soft text-xs mb-8">
          Version 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}
