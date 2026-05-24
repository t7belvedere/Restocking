import { View, Text, TextInput, type TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <View>
      {label ? (
        <Text className="mb-2 font-sans text-sm font-semibold text-ink">
          {label}
        </Text>
      ) : null}
      <TextInput
        className={`rounded-lg border-2 border-ink bg-paper px-4 py-3.5 font-sans text-base text-ink ${error ? "border-destructive" : ""} ${className ?? ""}`}
        placeholderTextColor="#737373"
        {...props}
      />
      {error ? (
        <Text className="mt-1 font-sans text-sm text-destructive">{error}</Text>
      ) : null}
    </View>
  );
}
