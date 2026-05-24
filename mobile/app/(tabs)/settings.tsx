import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export default function Settings() {
  const { user, signOut } = useAuth();
  const { t, locale, setLocale } = useI18n();

  const handleSignOut = () => {
    Alert.alert(t.signOut, t.signOutConfirm ?? "Are you sure?", [
      { text: t.cancel ?? "Cancel", style: "cancel" },
      {
        text: t.signOut,
        style: "destructive",
        onPress: () => {
          signOut();
        },
      },
    ]);
  };

  const avatarLetter = (user?.email ?? "?")[0].toUpperCase();

  return (
    <ScrollView
      className="flex-1 bg-cream"
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 }}
    >
      {/* Header */}
      <Text className="text-3xl font-extrabold text-ink tracking-tight mb-8">
        {t.settings}
      </Text>

      {/* Account Section */}
      <View className="mb-8 gap-3">
        <Text className="text-xs font-bold text-ink-soft uppercase tracking-widest mb-1">
          {t.account}
        </Text>

        {/* Account card */}
        <View className="flex-row items-center gap-3 rounded-xl border-2 border-ink bg-paper p-4 shadow-brutal-sm">
          <View className="h-10 w-10 rounded-full border-2 border-ink bg-lime items-center justify-center">
            <Text className="text-lg font-bold text-ink">
              {avatarLetter}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-ink">
              {user?.email ?? "..."}
            </Text>
            <Text className="text-xs text-ink-soft">
              {user?.id?.slice(0, 8)}...
            </Text>
          </View>
        </View>

        {/* Language row */}
        <TouchableOpacity
          className="flex-row items-center justify-between rounded-xl border-2 border-ink bg-paper p-4 shadow-brutal-sm"
          onPress={() => setLocale(locale === "fr" ? "en" : "fr")}
          activeOpacity={0.7}
        >
          <Text className="text-base font-semibold text-ink">
            {t.language}
          </Text>
          <View className="px-2.5 py-1 rounded-md border border-ink bg-muted">
            <Text className="text-xs font-semibold text-ink">
              {locale.toUpperCase()}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Subscription Section */}
      <View className="mb-8 gap-3">
        <Text className="text-xs font-bold text-ink-soft uppercase tracking-widest mb-1">
          {t.subscription ?? "Subscription"}
        </Text>

        {/* Free plan card */}
        <View className="rounded-xl border-2 border-ink bg-paper p-4 shadow-brutal-sm">
          <Text className="text-base font-semibold text-ink">
            {t.freePlan}
          </Text>
          <Text className="text-xs text-ink-soft mt-0.5">
            3 articles · 30 min
          </Text>
        </View>

        {/* Upgrade to Pro button */}
        <TouchableOpacity
          className="rounded-lg border-2 border-ink bg-blue px-6 py-4 items-center shadow-brutal-sm"
          activeOpacity={0.7}
        >
          <Text className="text-base font-bold text-white">
            {t.upgrade}
          </Text>
        </TouchableOpacity>

        {/* Manage subscription link */}
        <TouchableOpacity
          className="items-center py-2"
          activeOpacity={0.7}
        >
          <Text className="text-sm text-ink-soft underline">
            {t.manageSubscription}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sign Out */}
      <TouchableOpacity
        className="mt-4 rounded-lg border-2 border-destructive bg-paper px-6 py-4 items-center"
        onPress={handleSignOut}
        activeOpacity={0.7}
      >
        <Text className="text-base font-semibold text-destructive">
          {t.signOut}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
