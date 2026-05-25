import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        display: ["BricolageGrotesque-Bold", "Bricolage_Grotesque", "system-ui", "sans-serif"],
        sans: ["DM_Sans", "DM Sans", "system-ui", "sans-serif"],
        mono: ["DM_Mono", "monospace"],
      },
      colors: {
        cream: "#FDF9F3",
        ink: "#262626",
        "ink-soft": "#737373",
        paper: "#FFFFFF",
        orange: "#FF6B35",
        blue: "#3B82F6",
        lime: "#A3E635",
        pink: "#F472B6",
        background: "#FDF9F3",
        foreground: "#262626",
        card: "#FFFFFF",
        "card-foreground": "#262626",
        primary: "#262626",
        "primary-foreground": "#FDF9F3",
        secondary: "#3B82F6",
        "secondary-foreground": "#262626",
        muted: "#F5F0EB",
        "muted-foreground": "#737373",
        accent: "#A3E635",
        "accent-foreground": "#262626",
        destructive: "#DC2626",
        "destructive-foreground": "#FFFFFF",
        border: "#262626",
        input: "#F5F0EB",
        ring: "#FF6B35",
      },
    },
  },
} satisfies Config;
