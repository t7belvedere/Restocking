import { View, Text } from "react-native";

type Props = {
  size?: number;
};

export default function GoogleIcon({ size = 24 }: Props) {
  return (
    <View
      className="items-center justify-center rounded-full bg-white border border-ink/20"
      style={{ width: size, height: size }}
    >
      <Text
        style={{
          fontSize: size * 0.55,
          fontWeight: "700",
          color: "#4285F4",
          lineHeight: size * 0.65,
        }}
      >
        G
      </Text>
    </View>
  );
}
