import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Globe, CreditCard, User } from "lucide-react-native";

export default function Settings() {
  const { user, signOut } = useAuth();
  const { t, locale, setLocale } = useI18n();

  const handleSignOut = () => {
    Alert.alert(t.signOut, "Es-tu sûr·e ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: t.signOut,
        style: "destructive",
        onPress: signOut,
      },
    ]);
  };

  const toggleLocale = () => {
    setLocale(locale === "fr" ? "en" : "fr");
  };

  return (
    <ScrollView className="flex-1 bg-cream" contentContainerClassName="px-6 pt-14 pb-10">
      <Text className="font-display text-3xl font-extrabold text-ink tracking-tight">
        {t.settings}
      </Text>

      {/* Account section */}
      <View className="mt-8 gap-3">
        <Text className="font-sans text-xs font-bold uppercase tracking-widest text-ink-soft">
          {t.account}
        </Text>

        <Card>
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-lime">
              <User size={18} color="#262626" />
            </View>
            <View className="flex-1">
              <Text className="font-sans text-base font-semibold text-ink">
                {user?.email ?? "..."}
              </Text>
              <Text className="font-mono text-xs text-ink-soft">
                {user?.id?.slice(0, 8)}...
              </Text>
            </View>
          </View>
        </Card>

        <TouchableOpacity
          className="flex-row items-center gap-3 rounded-xl border-2 border-ink bg-paper p-4 shadow-brutal-sm active:translate-y-0.5"
          onPress={toggleLocale}
        >
          <Globe size={20} color="#262626" />
          <Text className="flex-1 font-sans text-base font-semibold text-ink">
            {t.language}
          </Text>
          <Badge label={locale.toUpperCase()} variant="default" />
        </TouchableOpacity>
      </View>

      {/* Subscription section */}
      <View className="mt-8 gap-3">
        <Text className="font-sans text-xs font-bold uppercase tracking-widest text-ink-soft">
          Abonnement
        </Text>

        <Card>
          <View className="flex-row items-center gap-3">
            <CreditCard size={20} color="#262626" />
            <View className="flex-1">
              <Text className="font-sans text-base font-semibold text-ink">
                {t.freePlan}
              </Text>
              <Text className="font-mono text-xs text-ink-soft">
                3 articles · 30 min
              </Text>
            </View>
            <Badge label={t.freePlan} variant="default" />
          </View>
        </Card>

        <TouchableOpacity className="rounded-xl border-2 border-ink bg-secondary p-4 shadow-brutal-sm active:translate-y-0.5">
          <Text className="text-center font-display text-base font-bold text-secondary-foreground">
            {t.upgrade} — 7,99€/mois
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="mt-1 items-center rounded-lg py-2">
          <Text className="font-sans text-sm text-ink-soft underline">
            {t.manageSubscription}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sign out */}
      <TouchableOpacity
        onPress={handleSignOut}
        className="mt-10 flex-row items-center justify-center gap-2 rounded-xl border-2 border-destructive bg-paper px-6 py-4"
      >
        <LogOut size={18} color="#EF4444" />
        <Text className="font-sans text-base font-semibold text-destructive">
          {t.signOut}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
