import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        cream: "#F9F8F6",
        paper: "#FFFFFF",
        ink: "#262626",
        "ink-soft": "#737373",
        orange: "#F85C15",
        blue: "#296FEC",
        lime: "#C9F040",
        pink: "#F5A0B5",
        background: "#F9F8F6",
        foreground: "#262626",
        card: "#FFFFFF",
        "card-foreground": "#262626",
        primary: "#F85C15",
        "primary-foreground": "#FFFFFF",
        secondary: "#296FEC",
        "secondary-foreground": "#FFFFFF",
        muted: "#F5F5F4",
        "muted-foreground": "#737373",
        accent: "#C9F040",
        "accent-foreground": "#262626",
        destructive: "#EF4444",
        "destructive-foreground": "#FFFFFF",
        border: "#262626",
        input: "#F5F5F4",
        ring: "#F85C15",
      },
      fontFamily: {
        sans: ["DM Sans", "ui-sans-serif", "system-ui"],
        display: ["Bricolage Grotesque", "ui-sans-serif", "system-ui"],
        mono: ["DM Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "0.375rem",
        md: "0.625rem",
        lg: "0.85rem",
        xl: "1.25rem",
      },
      boxShadow: {
        brutal: "4px 4px 0px #262626",
        "brutal-sm": "2px 2px 0px #262626",
      },
    },
  },
  plugins: [],
} satisfies Config;
