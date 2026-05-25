import { forwardRef, useState } from "react";
import { TextInput, View, Text, type TextInputProps } from "react-native";
import { cn } from "@/lib/utils";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ className, label, error, placeholderTextColor, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <View className="gap-1.5">
        {label ? <Label>{label}</Label> : null}
        <TextInput
          ref={ref}
          className={cn(
            "rounded-xl border-2 border-ink bg-paper px-4 py-3 font-sans text-base text-ink",
            isFocused && "border-orange",
            error && "border-destructive",
            className,
          )}
          placeholderTextColor={placeholderTextColor ?? "#737373"}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {error ? (
          <Text className="font-sans text-sm text-destructive">{error}</Text>
        ) : null}
      </View>
    );
  },
);

Input.displayName = "Input";

interface LabelProps {
  children: React.ReactNode;
  className?: string;
}

export function Label({ children, className }: LabelProps) {
  return (
    <Text className={cn("font-bold text-ink mb-0.5", className)}>
      {children}
    </Text>
  );
}
