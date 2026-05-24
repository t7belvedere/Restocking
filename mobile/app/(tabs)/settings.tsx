import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { brutal, brutalSm } from "@/lib/shadows";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { t, locale, setLocale } = useI18n();
  const [deleting, setDeleting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const initial = user?.email?.charAt(0).toUpperCase() ?? "?";
  const email = user?.email ?? "";
  const isFrench = locale === "fr";

  const handleSignOut = () => {
    Alert.alert(t.signOutConfirm, undefined, [
      { text: t.cancel, style: "cancel" },
      {
        text: t.signOut,
        style: "destructive",
        onPress: async () => {
          setSigningOut(true);
          await signOut();
          setSigningOut(false);
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(t.deleteAccountTitle, t.deleteAccountMessage, [
      { text: t.cancel, style: "cancel" },
      {
        text: t.deleteConfirm,
        style: "destructive",
        onPress: async () => {
          setDeleting(true);
          const { error } = await supabase.auth.admin?.deleteUser(
            user?.id ?? "",
          );
          if (error) {
            Alert.alert("Erreur", error.message);
            setDeleting(false);
            return;
          }
          await signOut();
        },
      },
    ]);
  };

  return (
    <ScrollView
      className="flex-1 bg-cream"
      contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
    >
      <Text className="mt-10 font-display text-3xl font-extrabold tracking-tighter text-ink">
        {t.profileTitle}
      </Text>

      {/* ── Account card ── */}
      <View
        className="mt-6 rounded-2xl border-2 border-ink bg-paper p-5"
        style={brutal}
      >
        <View className="flex-row items-center gap-4">
          <View className="h-12 w-12 items-center justify-center rounded-full border-2 border-ink bg-lime">
            <Text className="font-display text-lg font-bold text-ink">
              {initial}
            </Text>
          </View>

          <View className="flex-1">
            <Text
              className="font-sans-semibold text-base text-ink"
              numberOfLines={1}
            >
              {email}
            </Text>
            <View className="mt-1.5 self-start rounded-full border border-ink bg-lime/40 px-3 py-0.5">
              <Text className="font-mono text-xs font-medium text-ink">
                {t.freePlan}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          className="mt-5"
          onPress={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <ActivityIndicator color="#ee3533" size="small" />
          ) : (
            <Text className="font-sans-semibold text-sm text-destructive">
              {t.signOut}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Language ── */}
      <Text className="mt-8 font-display text-lg font-extrabold text-ink">
        {t.language}
      </Text>
      <View className="mt-3 flex-row gap-3">
        {(["fr", "en"] as const).map((l) => {
          const active = locale === l;
          return (
            <TouchableOpacity
              key={l}
              onPress={() => setLocale(l)}
              className={`rounded-full border-2 px-6 py-2.5 ${
                active ? "border-ink bg-ink" : "border-ink bg-paper"
              }`}
              style={active ? brutalSm : undefined}
              activeOpacity={0.7}
            >
              <Text
                className={`font-display text-sm font-bold uppercase ${
                  active ? "text-cream" : "text-ink"
                }`}
              >
                {l === "fr" ? "FR" : "EN"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Subscription ── */}
      <Text className="mt-8 font-display text-lg font-extrabold text-ink">
        {t.subscription}
      </Text>
      <View
        className="mt-3 rounded-2xl border-2 border-ink bg-paper p-5"
        style={brutal}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="font-display text-lg font-bold text-ink">
              {t.freePlan}
            </Text>
            <Text className="mt-1 font-sans text-sm text-ink-soft">
              1 alerte active
            </Text>
          </View>
          <TouchableOpacity
            className="rounded-xl border-2 border-blue bg-blue px-5 py-2.5"
            style={brutalSm}
            activeOpacity={0.8}
          >
            <Text className="font-display text-xs font-bold uppercase tracking-widest text-paper">
              {t.upgrade}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Danger zone ── */}
      <Text className="mt-8 font-display text-lg font-extrabold text-destructive">
        {t.dangerZone}
      </Text>
      <View className="mt-3 rounded-2xl border border-destructive/40 bg-destructive/5 p-5">
        <Text className="mb-4 font-sans text-sm leading-relaxed text-ink-soft">
          Une fois supprimees, toutes tes donnees seront definitivement
          effacees. Cette action est irreversible.
        </Text>
        <TouchableOpacity
          className="h-12 items-center justify-center rounded-xl border-2 border-destructive bg-destructive"
          style={brutalSm}
          onPress={handleDeleteAccount}
          disabled={deleting}
          activeOpacity={0.8}
        >
          {deleting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="font-display text-sm font-bold uppercase tracking-widest text-paper">
              {t.deleteAccount}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
