import { Platform } from "react-native";

// Exact production shadow scale from restocking.app
// shadow-brutal-sm:  2px 2px 0 0 var(--ink)
// shadow-brutal:     4px 4px 0 0 var(--ink)
// shadow-brutal-lg:  6px 6px 0 0 var(--ink)
// shadow-brutal-xl:  10px 10px 0 0 var(--ink)

const INK = "#0b0b0b";

function shadow(offset: number) {
  return Platform.select({
    web: { boxShadow: `${offset}px ${offset}px 0px ${INK}` } as any,
    default: {
      shadowColor: INK,
      shadowOffset: { width: offset, height: offset },
      shadowOpacity: 1,
      shadowRadius: 0,
    },
  });
}

export const brutalSm = shadow(2);
export const brutal = shadow(4);
export const brutalLg = shadow(6);
export const brutalXl = shadow(10);
