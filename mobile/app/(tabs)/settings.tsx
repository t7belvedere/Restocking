import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { brutalSm } from "@/lib/shadows";

const SIZES = ["XS", "S", "M", "L", "XL"] as const;

const BRANDS = [
  "Zara",
  "H&M",
  "Uniqlo",
  "COS",
  "Mango",
  "Arket",
  "Massimo Dutti",
  "& Other Stories",
  "Nike",
  "Adidas",
  "Maje",
  "Sandro",
  "Sezane",
  "Rouje",
  "A.P.C.",
  "Acne Studios",
] as const;

export default function Settings() {
  const { user, signOut } = useAuth();
  const { t, locale, setLocale } = useI18n();

  // Local profile state (would be synced to DB in production)
  const [firstName, setFirstName] = useState("");
  const [defaultSize, setDefaultSize] = useState<string | null>(null);
  const [preferredBrands, setPreferredBrands] = useState<string[]>([]);
  const [phoneNumber, setPhoneNumber] = useState("");

  const plan: "free" | "pro" = "free";

  const avatarLetter = (user?.email ?? "?")[0].toUpperCase();

  // ── Handlers ──────────────────────────────────────────────

  const handleSignOut = () => {
    Alert.alert(t.signOut, t.signOutConfirm, [
      { text: t.cancel, style: "cancel" },
      { text: t.signOut, style: "destructive", onPress: () => signOut() },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(t.deleteAccountTitle, t.deleteAccountMessage, [
      { text: t.cancel, style: "cancel" },
      {
        text: t.deleteConfirm,
        style: "destructive",
        onPress: () => {
          // TODO: call delete-account API
        },
      },
    ]);
  };

  const toggleBrand = (brand: string) => {
    setPreferredBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
  };

  const handleVerifyPhone = () => {
    // TODO: initiate OTP flow
    Alert.alert("OTP", "OTP verification flow placeholder.");
  };

  const isPhoneVerified = false;

  // ── Render helpers ─────────────────────────────────────────

  const sectionLabel = (text: string) => (
    <Text className="font-display text-xs font-bold uppercase tracking-[0.2em] text-ink mb-3">
      {text}
    </Text>
  );

  // ── Main render ────────────────────────────────────────────

  return (
    <ScrollView
      className="flex-1 bg-cream"
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 56,
        paddingBottom: 48,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* ═══ Header ═══ */}
      <Text className="font-display text-3xl font-extrabold tracking-tighter text-ink mb-8">
        {t.profileTitle}
      </Text>

      {/* ═══ Account card ═══ */}
      <View className="mb-5 rounded-2xl border-2 border-ink bg-paper p-5 shadow-brutal">
        {/* Avatar + email row */}
        <View className="mb-3 flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-full border-2 border-ink bg-lime">
            <Text className="text-lg font-bold text-ink">{avatarLetter}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-ink">
              {user?.email ?? "..."}
            </Text>
          </View>
        </View>

        {/* Plan badge */}
        <View className="mb-4 flex-row items-center gap-3">
          {plan === "free" ? (
            <View className="rounded-full border border-ink/20 bg-muted px-3 py-1">
              <Text className="text-xs font-medium text-ink">
                {t.freePlan}
              </Text>
            </View>
          ) : (
            <View className="rounded-full border border-lime/60 bg-lime/15 px-3 py-1">
              <Text className="text-xs font-medium text-ink">
                {t.proPlan}
              </Text>
            </View>
          )}
        </View>

        {/* Manage subscription link */}
        <TouchableOpacity className="mb-3" activeOpacity={0.7}>
          <Text className="text-sm font-medium text-blue underline">
            {t.manageSubscription}
          </Text>
        </TouchableOpacity>

        {/* Separator */}
        <View className="mb-3 h-px bg-ink/15" />

        {/* Sign out */}
        <TouchableOpacity onPress={handleSignOut} activeOpacity={0.7}>
          <Text className="text-sm font-semibold text-destructive">
            {t.signOut}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ═══ Notifications card ═══ */}
      <View className="mb-5 rounded-2xl border-2 border-ink bg-paper p-5 shadow-brutal">
        {sectionLabel(t.notifications)}

        {/* Email — disabled, already verified */}
        <View className="mb-4">
          <Text className="font-display text-xs font-bold uppercase tracking-[0.2em] text-ink mb-1.5">
            {t.notificationsEmail}
          </Text>
          <View className="flex-row items-center rounded-xl border-2 border-ink/20 bg-muted px-4 py-3">
            <Text className="flex-1 text-sm text-ink/50" numberOfLines={1}>
              {user?.email ?? ""}
            </Text>
            <Text className="ml-2 text-sm font-semibold text-lime">
              {"✓"} {t.verified}
            </Text>
          </View>
          <Text className="ml-0.5 mt-1 text-xs text-ink/40">
            {t.notificationsEmailDesc}
          </Text>
        </View>

        {/* SMS / Phone — needs verification */}
        <View>
          <Text className="font-display text-xs font-bold uppercase tracking-[0.2em] text-ink mb-1.5">
            {t.notificationsSms}
          </Text>
          <View className="flex-row gap-2">
            <View className="flex-1 flex-row items-center rounded-xl border-2 border-ink bg-paper px-4 py-3">
              <TextInput
                className="flex-1 text-sm font-medium text-ink"
                placeholder="+33 6 12 34 56 78"
                placeholderTextColor="#A3A3A3"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
              {isPhoneVerified && phoneNumber.length > 0 && (
                <Text className="ml-2 text-sm font-semibold text-lime">
                  {"✓"}
                </Text>
              )}
            </View>
            <TouchableOpacity
              className="items-center justify-center rounded-xl border-2 border-ink bg-paper px-4 py-3"
              style={brutalSm}
              onPress={handleVerifyPhone}
              activeOpacity={0.7}
            >
              <Text className="font-display text-xs font-bold uppercase tracking-widest text-ink">
                {t.verifyPhone}
              </Text>
            </TouchableOpacity>
          </View>
          <Text className="ml-0.5 mt-1 text-xs text-ink/40">
            {t.notificationsSmsDesc}
          </Text>
        </View>
      </View>

      {/* ═══ Preferences card ═══ */}
      <View className="mb-5 rounded-2xl border-2 border-ink bg-paper p-5 shadow-brutal">
        {sectionLabel(t.preferences)}

        {/* First name */}
        <View className="mb-4">
          <Text className="font-display text-xs font-bold uppercase tracking-[0.2em] text-ink mb-1.5">
            {t.firstName}
          </Text>
          <TextInput
            className="h-12 w-full rounded-xl border-2 border-ink bg-paper px-4 font-medium text-ink"
            style={brutalSm}
            placeholder={t.firstNamePlaceholder}
            placeholderTextColor="#A3A3A3"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>

        {/* Default size */}
        <View className="mb-5">
          <Text className="font-display text-xs font-bold uppercase tracking-[0.2em] text-ink mb-2">
            {t.defaultSize}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {SIZES.map((size) => {
              const isSelected = defaultSize === size;
              return (
                <TouchableOpacity
                  key={size}
                  onPress={() => setDefaultSize(isSelected ? null : size)}
                  activeOpacity={0.7}
                  className={`rounded-full border-2 px-4 py-2.5 ${
                    isSelected ? "border-ink bg-ink" : "border-ink bg-paper"
                  }`}
                  style={isSelected ? brutalSm : undefined}
                >
                  <Text
                    className={`font-mono text-sm font-medium ${
                      isSelected ? "text-cream" : "text-ink"
                    }`}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Preferred brands */}
        <View>
          <Text className="font-display text-xs font-bold uppercase tracking-[0.2em] text-ink mb-2">
            {t.preferredBrands}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {BRANDS.map((brand) => {
              const isSelected = preferredBrands.includes(brand);
              return (
                <TouchableOpacity
                  key={brand}
                  onPress={() => toggleBrand(brand)}
                  activeOpacity={0.7}
                  className={`rounded-full border-2 px-3 py-2 ${
                    isSelected
                      ? "border-ink bg-ink"
                      : "border-ink/30 bg-paper"
                  }`}
                  style={isSelected ? brutalSm : undefined}
                >
                  <Text
                    className={`font-mono text-xs font-medium ${
                      isSelected ? "text-cream" : "text-ink/70"
                    }`}
                  >
                    {brand}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* ═══ Language row ═══ */}
      <TouchableOpacity
        className="mb-5 flex-row items-center justify-between rounded-2xl border-2 border-ink bg-paper p-5 shadow-brutal"
        onPress={() => setLocale(locale === "fr" ? "en" : "fr")}
        activeOpacity={0.7}
      >
        <Text className="text-base font-semibold text-ink">
          {t.language}
        </Text>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() => setLocale("fr")}
            className={`rounded-full border-2 px-3 py-1.5 ${
              locale === "fr"
                ? "border-ink bg-ink"
                : "border-ink/30 bg-paper"
            }`}
            style={locale === "fr" ? brutalSm : undefined}
            activeOpacity={0.7}
          >
            <Text
              className={`text-xs font-semibold ${
                locale === "fr" ? "text-cream" : "text-ink/50"
              }`}
            >
              FR
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setLocale("en")}
            className={`rounded-full border-2 px-3 py-1.5 ${
              locale === "en"
                ? "border-ink bg-ink"
                : "border-ink/30 bg-paper"
            }`}
            style={locale === "en" ? brutalSm : undefined}
            activeOpacity={0.7}
          >
            <Text
              className={`text-xs font-semibold ${
                locale === "en" ? "text-cream" : "text-ink/50"
              }`}
            >
              EN
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* ═══ Danger zone ═══ */}
      <View className="rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-5">
        <Text className="font-display text-xs font-bold uppercase tracking-[0.2em] text-destructive mb-2">
          {t.dangerZone}
        </Text>
        <TouchableOpacity onPress={handleDeleteAccount} activeOpacity={0.7}>
          <Text className="text-sm font-semibold text-destructive">
            {t.deleteAccount}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
