import { View, Text, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning"
  | "muted";

const containerStyles: Record<BadgeVariant, string> = {
  default: "bg-ink",
  secondary: "bg-blue",
  destructive: "bg-destructive",
  outline: "bg-transparent border-2 border-ink",
  success: "bg-emerald-100 border border-emerald-400",
  warning: "bg-amber-100",
  muted: "bg-muted",
};

const textStyles: Record<BadgeVariant, string> = {
  default: "text-cream",
  secondary: "text-ink",
  destructive: "text-white",
  outline: "text-ink",
  success: "text-emerald-800",
  warning: "text-amber-800",
  muted: "text-muted-foreground",
};

interface BadgeProps extends ViewProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <View
      className={cn(
        "rounded-full px-3 py-1 self-start",
        containerStyles[variant],
        className,
      )}
      {...props}
    >
      <Text
        className={cn(
          "text-xs font-bold uppercase tracking-wider",
          textStyles[variant],
        )}
      >
        {children}
      </Text>
    </View>
  );
}
