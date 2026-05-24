import { View, Text } from "react-native";

interface BadgeProps {
  label: string;
  variant?: "success" | "danger" | "warning" | "default";
}

const variantStyles = {
  success: "bg-lime text-ink",
  danger: "bg-pink text-ink",
  warning: "bg-cream text-ink",
  default: "bg-muted text-ink-soft",
};

export function Badge({ label, variant = "default" }: BadgeProps) {
  return (
    <View
      className={`self-start rounded-md border border-ink px-2.5 py-0.5 ${variantStyles[variant]}`}
    >
      <Text className="font-mono text-xs font-medium uppercase tracking-wider">
        {label}
      </Text>
    </View>
  );
}
