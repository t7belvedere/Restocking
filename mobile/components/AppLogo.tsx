import { View, Text } from "react-native";

export default function AppLogo() {
  return (
    <View className="flex-row items-center">
      <Text className="font-display text-4xl font-bold text-ink">restocking</Text>
      <View
        className="w-2.5 h-2.5 rounded-full bg-orange ml-1.5"
        style={{ marginBottom: 2 }}
      />
    </View>
  );
}
