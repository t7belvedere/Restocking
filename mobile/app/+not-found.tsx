import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function NotFound() {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-cream p-8">
      <Text className="font-display text-4xl font-extrabold text-ink">404</Text>
      <Text className="text-center text-ink-soft">Cette page n'existe pas.</Text>
      <Link href="/" className="rounded-xl border-2 border-ink bg-orange px-6 py-3 font-bold text-ink">
        Retour
      </Link>
    </View>
  );
}
