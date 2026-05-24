import { View, Text } from "react-native";
import { Stack } from "expo-router";

export default function AddWatch() {
  return (
    <View className="flex-1 items-center justify-center bg-cream">
      <Stack.Screen options={{ headerShown: false }} />
      <Text className="font-display text-xl text-ink">Ajouter une alerte</Text>
    </View>
  );
}
