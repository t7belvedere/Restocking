import { Tabs } from "expo-router";
import { View, Pressable, Platform } from "react-native";
import { Home, Plus, User } from "lucide-react-native";

function AddTabButton({ onPress }: { onPress?: (e: any) => void }) {
  return (
    <View className="relative -top-5 items-center justify-center">
      <Pressable
        onPress={onPress}
        className="w-14 h-14 bg-orange border-2 border-ink rounded-2xl items-center justify-center"
        style={{ boxShadow: "4px 4px 0 0 #262626" }}
        android_ripple={{ color: "rgba(255,255,255,0.2)", borderless: false }}
      >
        <Plus size={24} color="#FFFFFF" strokeWidth={3} />
      </Pressable>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FF6B35",
        tabBarInactiveTintColor: "#737373",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 2,
          borderTopColor: "#262626",
          height: 60,
          paddingBottom: Platform.OS === "ios" ? 16 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: "DMSansBold",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Accueil",
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color as unknown as string} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          tabBarLabel: "Ajouter",
          tabBarButton: (props: any) => (
            <AddTabButton onPress={props.onPress} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: "Profil",
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color as unknown as string} strokeWidth={2.5} />
          ),
        }}
      />
    </Tabs>
  );
}
