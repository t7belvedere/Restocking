import { Link, Stack } from "expo-router";
import { View, Text } from "react-native";

export default function NotFound() {
  return (
    <View className="flex-1 items-center justify-center bg-cream gap-4">
      <Stack.Screen options={{ title: "Not Found" }} />
      <Text className="font-display text-3xl font-bold text-ink">404</Text>
      <Link href="/" className="rounded-lg border-2 border-ink bg-primary px-6 py-3">
        <Text className="font-display text-base font-bold text-primary-foreground">
          Go home
        </Text>
      </Link>
    </View>
  );
}
