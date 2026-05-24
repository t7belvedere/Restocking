import { View, Text, Image } from "react-native";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { useI18n } from "@/lib/i18n";

interface WatchCardProps {
  name: string;
  imageUrl?: string;
  size?: string;
  price?: number;
  currency?: string;
  inStock: boolean;
  lastChecked?: string;
}

export function WatchCard({
  name,
  imageUrl,
  size,
  price,
  currency = "EUR",
  inStock,
  lastChecked,
}: WatchCardProps) {
  const { t } = useI18n();

  return (
    <Card className="flex-row gap-4">
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          className="h-20 w-20 rounded-lg border border-ink/20"
          resizeMode="cover"
        />
      ) : (
        <View className="h-20 w-20 items-center justify-center rounded-lg border border-ink/20 bg-muted">
          <Text className="font-mono text-xs text-ink-soft">No img</Text>
        </View>
      )}
      <View className="flex-1 gap-1.5">
        <Text
          className="font-sans text-base font-semibold text-ink"
          numberOfLines={2}
        >
          {name}
        </Text>
        <View className="flex-row items-center gap-2">
          <Badge
            label={inStock ? t.inStock : t.outOfStock}
            variant={inStock ? "success" : "danger"}
          />
          {size ? (
            <Badge label={size} variant="default" />
          ) : null}
        </View>
        <View className="flex-row items-center justify-between">
          {price ? (
            <Text className="font-mono text-sm font-medium text-ink">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency,
              }).format(price)}
            </Text>
          ) : null}
          {lastChecked ? (
            <Text className="font-mono text-xs text-ink-soft">
              {lastChecked}
            </Text>
          ) : null}
        </View>
      </View>
    </Card>
  );
}
