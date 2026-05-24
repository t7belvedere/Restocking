import { Tabs } from "expo-router";
import { Bell, Plus, Settings } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#fbf8f0",
        tabBarInactiveTintColor: "#5a5355",
        tabBarStyle: {
          backgroundColor: "#0b0b0b",
          borderTopColor: "#0b0b0b",
          borderTopWidth: 0,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height: 72,
          paddingBottom: 8,
          paddingTop: 8,
          // Neo-brutal shadow (top-only)
          shadowColor: "#0b0b0b",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontFamily: "DMSans_700Bold",
          fontSize: 11,
          letterSpacing: 1.2,
          textTransform: "uppercase",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Alertes",
          tabBarIcon: ({ color, size }) => (
            <Bell size={size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Ajouter",
          tabBarIcon: ({ focused }) => (
            <Plus
              size={28}
              color="#0b0b0b"
              strokeWidth={3}
              style={{
                backgroundColor: focused ? "#ff803d" : "#c8ff68",
                borderRadius: 16,
                padding: 6,
                marginTop: -8,
              }}
            />
          ),
          tabBarLabelStyle: {
            fontFamily: "DMSans_700Bold",
            fontSize: 10,
            letterSpacing: 1,
            textTransform: "uppercase",
            marginTop: 2,
          },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
    </Tabs>
  );
}
