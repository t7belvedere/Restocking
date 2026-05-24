import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: string;
}

const variantStyles = {
  primary: "bg-primary border-ink",
  secondary: "bg-secondary border-ink",
  outline: "bg-paper border-ink",
};

const textStyles = {
  primary: "text-primary-foreground",
  secondary: "text-secondary-foreground",
  outline: "text-ink",
};

const sizeStyles = {
  sm: "px-4 py-2",
  md: "px-6 py-3.5",
  lg: "px-8 py-4",
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <TouchableOpacity
      className={`rounded-lg border-2 ${variantStyles[variant]} ${sizeStyles[size]} shadow-brutal active:translate-y-0.5 ${disabled ? "opacity-50" : ""} ${className ?? ""}`}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? "#262626" : "#FFFFFF"}
        />
      ) : (
        <Text
          className={`text-center font-display text-base font-bold ${textStyles[variant]}`}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}
