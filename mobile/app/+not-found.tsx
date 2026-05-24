import { Link, Stack } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

export default function NotFound() {
  return (
    <View style={s.container}>
      <Stack.Screen options={{ title: "Not Found" }} />
      <Text style={s.title}>404</Text>
      <Link href="/" style={s.link}>
        <Text style={s.linkText}>Go home</Text>
      </Link>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F9F8F6", gap: 16 },
  title: { fontSize: 32, fontWeight: "700", color: "#262626" },
  link: { borderRadius: 10, borderWidth: 2, borderColor: "#262626", backgroundColor: "#F85C15", paddingHorizontal: 24, paddingVertical: 14 },
  linkText: { fontSize: 16, fontWeight: "700", color: "#FFF" },
});
