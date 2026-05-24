import { TouchableOpacity, Text, View } from "react-native";

interface Variant {
  label: string;
  in_stock: boolean;
}

interface VariantPickerProps {
  variants: Variant[];
  selected?: string;
  onSelect: (label: string) => void;
}

export function VariantPicker({
  variants,
  selected,
  onSelect,
}: VariantPickerProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {variants.map((v) => {
        const isSelected = selected === v.label;
        return (
          <TouchableOpacity
            key={v.label}
            onPress={() => onSelect(v.label)}
            disabled={!v.in_stock}
            className={`rounded-lg border-2 px-4 py-2.5 ${
              isSelected
                ? "border-ink bg-ink"
                : v.in_stock
                  ? "border-ink bg-paper"
                  : "border-ink/20 bg-muted opacity-40"
            }`}
          >
            <Text
              className={`font-mono text-sm font-medium ${
                isSelected
                  ? "text-paper"
                  : v.in_stock
                    ? "text-ink"
                    : "text-ink-soft line-through"
              }`}
            >
              {v.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
