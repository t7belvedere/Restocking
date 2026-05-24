import { View, Text } from "react-native";

export function AppLogo({ size = 64 }: { size?: number }) {
  const stroke = Math.max(2, size * 0.04);
  const dotSize = size * 0.28;
  const ringSize = size * 0.5;
  const inner = size - stroke * 2;

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Outer circle */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: stroke,
          borderColor: "#0b0b0b",
          backgroundColor: "#fbf8f0",
          position: "absolute",
        }}
      />
      {/* Orange glow ring */}
      <View
        style={{
          width: ringSize,
          height: ringSize,
          borderRadius: ringSize / 2,
          borderWidth: stroke * 1.2,
          borderColor: "#ff803d",
          opacity: 0.55,
          position: "absolute",
        }}
      />
      {/* Center dot */}
      <View
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: "#ff803d",
          position: "absolute",
        }}
      />
      {/* Highlight */}
      <View
        style={{
          width: dotSize * 0.35,
          height: dotSize * 0.35,
          borderRadius: (dotSize * 0.35) / 2,
          backgroundColor: "#fff",
          opacity: 0.5,
          position: "absolute",
          top: size * 0.5 - dotSize * 0.5 + dotSize * 0.05,
          left: size * 0.5 - dotSize * 0.22,
        }}
      />
    </View>
  );
}

export function AppLogoWordmark({ size = 28 }: { size?: number }) {
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
          fontSize: size,
          letterSpacing: -0.5,
          color: "#ff803d",
        }}
      >
        .
      </Text>
    </View>
  );
}
