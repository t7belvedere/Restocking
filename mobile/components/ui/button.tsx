import { forwardRef, type ElementRef } from "react";
import { TouchableOpacity, Text, type TouchableOpacityProps } from "react-native";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "destructive" | "outline" | "ghost" | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";

const variantStyles: Record<ButtonVariant, string> = {
  default: "bg-ink text-cream border-2 border-ink",
  destructive: "bg-destructive text-white border-2 border-destructive",
  outline: "bg-transparent text-ink border-2 border-ink",
  ghost: "bg-transparent text-ink border-transparent",
  link: "bg-transparent text-ink border-transparent",
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3",
  lg: "h-12 px-8",
  icon: "h-10 w-10",
};

export function buttonVariants({
  variant = "default",
  size = "default",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}): string {
  return cn(
    "rounded-xl font-bold items-center justify-center flex-row gap-2",
    variantStyles[variant],
    sizeStyles[size],
    variant === "link" && "underline",
    className,
  );
}

const textColorMap: Record<ButtonVariant, string> = {
  default: "text-cream",
  destructive: "text-white",
  outline: "text-ink",
  ghost: "text-ink",
  link: "text-ink",
};

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const Button = forwardRef<ElementRef<typeof TouchableOpacity>, ButtonProps>(
  ({ variant = "default", size = "default", className, children, ...props }, ref) => {
    return (
      <TouchableOpacity
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        activeOpacity={0.8}
        {...props}
      >
        {typeof children === "string" ? (
          <Text className={cn("font-bold", textColorMap[variant])}>
            {children}
          </Text>
        ) : (
          children
        )}
      </TouchableOpacity>
    );
  },
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
