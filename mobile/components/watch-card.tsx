import { useEffect, useRef } from "react";
import { View, Text, Image, Pressable, Animated } from "react-native";
import { cn, formatPrice, shortHost, relativeTime } from "@/lib/utils";

interface WatchCardProps {
  id: string;
  name: string | null;
  image_url: string | null;
  url: string;
  variant_label: string | null;
  price: number | null;
  last_status: "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";
  last_check: string | null;
  is_active: boolean;
  onPress: (id: string) => void;
}

const STATUS_CONFIG = {
  IN_STOCK: {
    label: "En stock",
    bg: "bg-lime",
    text: "text-ink",
    dot: "bg-lime",
  },
  OUT_OF_STOCK: {
    label: "Rupture",
    bg: "bg-muted",
    text: "text-orange",
    dot: "bg-orange",
  },
  UNKNOWN: {
    label: "Inconnu",
    bg: "bg-muted",
    text: "text-ink-soft",
    dot: "bg-ink-soft",
  },
} as const;

export function WatchCard({
  id,
  name,
  image_url,
  url,
  variant_label,
  price,
  last_status,
  last_check,
  is_active,
  onPress,
}: WatchCardProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (last_status === "IN_STOCK") {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
      return () => animation.stop();
    }
  }, [last_status]);

  const s = STATUS_CONFIG[last_status];

  return (
    <Pressable
      onPress={() => onPress(id)}
      className={cn(
        "bg-paper border-2 border-ink p-3 rounded-xl mb-3 mx-4",
        !is_active && "opacity-50",
      )}
      style={{ boxShadow: "4px 4px 0 0 #262626" }}
    >
      <View className="flex-row gap-3">
        {/* Product image */}
        <View className="w-16 h-16 rounded-xl border-2 border-ink overflow-hidden bg-muted">
          {image_url ? (
            <Image
              source={{ uri: image_url }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center bg-muted">
              <Text className="text-ink-soft text-[10px] font-bold">IMG</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View className="flex-1 justify-center">
          <Text
            className="font-bold text-ink text-sm leading-tight"
            numberOfLines={2}
          >
            {name || "Sans titre"}
          </Text>
          <Text className="text-ink-soft text-xs mt-0.5">
            {shortHost(url)}
          </Text>
          {variant_label ? (
            <Text className="text-ink-soft text-xs">{variant_label}</Text>
          ) : null}
          <View className="flex-row items-center justify-between mt-1.5">
            <Text className="font-display font-bold text-ink text-sm">
              {formatPrice(price)}
            </Text>
            <View
              className={cn(
                "flex-row items-center gap-1.5 px-2.5 py-1 rounded-lg",
                s.bg,
              )}
            >
              {last_status === "IN_STOCK" ? (
                <Animated.View
                  className={cn("w-2 h-2 rounded-full", s.dot)}
                  style={{ opacity: pulseAnim }}
                />
              ) : (
                <View className={cn("w-2 h-2 rounded-full", s.dot)} />
              )}
              <Text className={cn("text-xs font-bold font-sans", s.text)}>
                {s.label}
              </Text>
            </View>
          </View>
          <Text className="text-ink-soft text-[10px] mt-0.5">
            {relativeTime(last_check)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
