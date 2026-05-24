import { Platform } from "react-native";

// React Native Web deprecates shadowColor/shadowOffset/shadowOpacity/shadowRadius
// in favor of CSS boxShadow. Use Platform.select for clean cross-platform shadows.
export const brutal = Platform.select({
  web: { boxShadow: "4px 4px 0px #262626" } as any,
  default: {
    shadowColor: "#262626",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
});

export const brutalSm = Platform.select({
  web: { boxShadow: "2px 2px 0px #262626" } as any,
  default: {
    shadowColor: "#262626",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
});
