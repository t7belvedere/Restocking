import { View, type ViewProps } from "react-native";

interface CardProps extends ViewProps {
  padded?: boolean;
}

export function Card({ padded = true, className, children, ...props }: CardProps) {
  return (
    <View
      className={`rounded-xl border-2 border-ink bg-paper shadow-brutal-sm ${padded ? "p-4" : ""} ${className ?? ""}`}
      {...props}
    >
      {children}
    </View>
  );
}
