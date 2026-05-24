import { View, Text } from "react-native";

const ORANGE = "#ff803d"; // matches oklch(0.74 0.19 45) visually

/**
 * Favicon logo matching frontend/public/favicon.svg.
 * White circle + black border + orange ping dot + pulse ring.
 */
export function AppLogo({ size = 64 }: { size?: number }) {
  // Scale from 100px SVG viewBox
  const s = size / 100;
  const stroke = Math.round(4 * s);
  const outerR = 48 * s;
  const dim = outerR * 2 + stroke * 2;
  const center = dim / 2;
  const glowR = 36 * s;
  const dotR = 12 * s;
  const highlightR = 5 * s;
  const ringR = 22 * s;
  const ringStroke = Math.max(1, Math.round(2.5 * s));

  return (
    <View style={{ width: dim, height: dim }}>
      {/* White circle + black border */}
      <View
        style={{
          position: "absolute",
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          borderWidth: stroke,
          borderColor: "#1a1a1a",
          backgroundColor: "#ffffff",
        }}
      />
      {/* Orange glow (subtle) */}
      <View
        style={{
          position: "absolute",
          top: center - glowR,
          left: center - glowR,
          width: glowR * 2,
          height: glowR * 2,
          borderRadius: glowR,
          backgroundColor: ORANGE,
          opacity: 0.15,
        }}
      />
      {/* Orange center dot */}
      <View
        style={{
          position: "absolute",
          top: center - dotR,
          left: center - dotR,
          width: dotR * 2,
          height: dotR * 2,
          borderRadius: dotR,
          backgroundColor: ORANGE,
        }}
      />
      {/* White highlight on dot */}
      <View
        style={{
          position: "absolute",
          top: center - dotR * 0.5,
          left: center + dotR * 0.05,
          width: highlightR * 2,
          height: highlightR * 2,
          borderRadius: highlightR,
          backgroundColor: "#ffffff",
          opacity: 0.5,
        }}
      />
      {/* Orange pulse ring */}
      <View
        style={{
          position: "absolute",
          top: center - ringR,
          left: center - ringR,
          width: ringR * 2,
          height: ringR * 2,
          borderRadius: ringR,
          borderWidth: ringStroke,
          borderColor: ORANGE,
          opacity: 0.55,
        }}
      />
    </View>
  );
}

/**
 * Wordmark matching frontend/components/site/logo.tsx
 * "restocking" in Bricolage Grotesque ExtraBold + orange trailing dot.
 * The second "o" is NOT decorated here — the AppLogo icon handles that.
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
          color: ORANGE,
        }}
      >
        .
      </Text>
    </View>
  );
}
