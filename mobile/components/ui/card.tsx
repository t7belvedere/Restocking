import { View, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

/** Hard brutalist shadow — approximated with RN shadow props (best effort on Android). */
export const shadowBrutal = {
  shadowColor: "#262626",
  shadowOffset: { width: 4, height: 4 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 4,
} as const;

export const shadowBrutalSm = {
  shadowColor: "#262626",
  shadowOffset: { width: 2, height: 2 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 2,
} as const;

export const shadowBrutalLg = {
  shadowColor: "#262626",
  shadowOffset: { width: 6, height: 6 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 6,
} as const;

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ className, children, style, ...props }: CardProps) {
  return (
    <View
      className={cn("rounded-2xl border-2 border-ink bg-paper", className)}
      style={[shadowBrutal, style]}
      {...props}
    >
      {children}
    </View>
  );
}

interface CardContentProps extends ViewProps {
  children: React.ReactNode;
  /** Padding preset. Default "md" = p-5. */
  padding?: "sm" | "md" | "lg";
}

export function CardContent({
  className,
  children,
  padding = "md",
  ...props
}: CardContentProps) {
  const paddingClasses: Record<NonNullable<CardContentProps["padding"]>, string> = {
    sm: "p-4",
    md: "p-5",
    lg: "p-6",
  };

  return (
    <View className={cn(paddingClasses[padding], className)} {...props}>
      {children}
    </View>
  );
}
