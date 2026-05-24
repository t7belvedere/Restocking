import { View, Text, Image } from "react-native";

const LOGO = require("@/assets/logo.png");

/**
 * App logo from frontend/public/apple-touch-icon.png.
 */
export function AppLogo({ size = 64 }: { size?: number }) {
  return (
    <Image
      source={LOGO}
      style={{ width: size, height: size, borderRadius: size * 0.225 }}
    />
  );
}

/**
 * Wordmark matching frontend/components/site/logo.tsx
 */
export function AppLogoWordmark({ size = 22 }: { size?: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "baseline" }}>
      <Text
        style={{
          fontFamily: "BricolageGrotesque_800ExtraBold",
          fontSize: size,
          letterSpacing: -0.5,
          color: "#0b0b0b",
        }}
      >
        restocking
      </Text>
      <Text
        style={{
          fontFamily: "BricolageGrotesque_800ExtraBold",
          fontSize: size + 2,
          color: "#ff803d",
        }}
      >
        .
      </Text>
    </View>
  );
}
