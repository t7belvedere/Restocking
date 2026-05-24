import { View, Text, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { brutal } from "@/lib/shadows";

export default function NotFoundScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-cream p-8">
      <Text className="font-display text-8xl font-extrabold text-ink">
        404
      </Text>
      <Text className="mt-4 font-sans text-lg text-ink-soft">
        Page introuvable
      </Text>
      <Link href="/(tabs)" asChild>
        <TouchableOpacity
          className="mt-8 h-12 items-center justify-center rounded-xl border-2 border-ink bg-orange px-8"
          style={brutal}
          activeOpacity={0.8}
        >
          <Text className="font-display text-sm font-bold uppercase tracking-widest text-ink">
            Go home
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
