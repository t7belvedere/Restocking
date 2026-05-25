import { View, Text, Pressable } from "react-native";
import { cn } from "@/lib/utils";

export interface VariantPickerProps {
  sizes?: string[];
  colors?: string[];
  variants?: string[];
  sizesStatus?: Record<string, boolean>;
  colorsStatus?: Record<string, boolean>;
  selectedSize: string | null;
  selectedColor: string | null;
  selectedVariant: string | null;
  onSelectSize: (size: string | null) => void;
  onSelectColor: (color: string | null) => void;
  onSelectVariant: (variant: string | null) => void;
}

function VariantChip({
  label,
  selected,
  inStock,
  onPress,
}: {
  label: string;
  selected: boolean;
  inStock: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!inStock}
      className={cn(
        "px-4 py-2.5 rounded-xl border-2 mr-2 mb-2",
        selected && inStock
          ? "bg-ink border-ink"
          : "bg-paper border-ink",
        !inStock && "border-ink-soft opacity-40",
      )}
      style={
        inStock
          ? { boxShadow: "2px 2px 0 0 #262626" }
          : { borderStyle: "dashed" }
      }
    >
      <Text
        className={cn(
          "text-sm font-bold font-sans",
          selected && inStock ? "text-cream" : "text-ink",
          !inStock && "line-through text-ink-soft",
        )}
        style={!inStock ? { textDecorationLine: "line-through" } : undefined}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ChipSection({
  title,
  items,
  selected,
  statusMap,
  onSelect,
}: {
  title: string;
  items: string[];
  selected: string | null;
  statusMap?: Record<string, boolean>;
  onSelect: (value: string | null) => void;
}) {
  return (
    <View className="mb-4">
      <Text className="font-display text-ink mb-3 text-base">{title}</Text>
      <View className="flex-row flex-wrap">
        {items.map((item) => (
          <VariantChip
            key={item}
            label={item}
            selected={selected === item}
            inStock={statusMap?.[item] ?? true}
            onPress={() => onSelect(selected === item ? null : item)}
          />
        ))}
      </View>
    </View>
  );
}

export function VariantPicker({
  sizes,
  colors,
  variants,
  sizesStatus,
  colorsStatus,
  selectedSize,
  selectedColor,
  selectedVariant,
  onSelectSize,
  onSelectColor,
  onSelectVariant,
}: VariantPickerProps) {
  const hasSizes = sizes && sizes.length > 0;
  const hasColors = colors && colors.length > 0;
  const hasVariants = variants && variants.length > 0 && !hasSizes;

  if (!hasSizes && !hasColors && !hasVariants) return null;

  return (
    <View>
      {hasSizes && (
        <ChipSection
          title="Taille"
          items={sizes!}
          selected={selectedSize}
          statusMap={sizesStatus}
          onSelect={onSelectSize}
        />
      )}
      {hasColors && (
        <ChipSection
          title="Couleur"
          items={colors!}
          selected={selectedColor}
          statusMap={colorsStatus}
          onSelect={onSelectColor}
        />
      )}
      {hasVariants && (
        <ChipSection
          title="Variante"
          items={variants!}
          selected={selectedVariant}
          onSelect={onSelectVariant}
        />
      )}
    </View>
  );
}
