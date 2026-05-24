import { useEffect, useRef, useCallback } from "react";
import { Animated, type ViewStyle } from "react-native";

// ── Presets ──────────────────────────────────────────────────────────────

export const easeOut = {
  useNativeDriver: true,
  duration: 300,
} as const;

export const easeOutSlow = {
  useNativeDriver: true,
  duration: 500,
} as const;

// ── fadeUp ───────────────────────────────────────────────────────────────

export function useFadeUp(delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, ...easeOut, delay }),
      Animated.timing(translateY, { toValue: 0, ...easeOut, delay }),
    ]).start();
  }, []);

  return { opacity, transform: [{ translateY }] } as const;
}

// ── scaleIn ──────────────────────────────────────────────────────────────

export function useScaleIn(delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, ...easeOutSlow, delay }),
      Animated.timing(scale, { toValue: 1, ...easeOutSlow, delay }),
    ]).start();
  }, []);

  return { opacity, transform: [{ scale }] } as const;
}

// ── staggerList ──────────────────────────────────────────────────────────

export function useStaggerList(
  count: number,
  { initialDelay = 80, staggerDelay = 60 } = {},
) {
  const items = useRef(
    Array.from({ length: count }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(16),
    })),
  ).current;

  useEffect(() => {
    if (count <= 0) return;
    const animations = items.slice(0, count).map((item, i) =>
      Animated.parallel([
        Animated.timing(item.opacity, {
          toValue: 1,
          ...easeOutSlow,
          delay: initialDelay + i * staggerDelay,
        }),
        Animated.timing(item.translateY, {
          toValue: 0,
          ...easeOutSlow,
          delay: initialDelay + i * staggerDelay,
        }),
      ]),
    );
    Animated.stagger(staggerDelay, animations).start();
  }, [count]);

  const getStyle = useCallback(
    (index: number): Animated.WithAnimatedValue<ViewStyle> => {
      const item = items[index];
      if (!item) return {};
      return {
        opacity: item.opacity,
        transform: [{ translateY: item.translateY }],
      };
    },
    [],
  );

  return getStyle;
}

// ── pressAnimation ───────────────────────────────────────────────────────

export function usePressAnimation() {
  const scale = useRef(new Animated.Value(1)).current;
  const shadowY = useRef(new Animated.Value(0)).current;

  const onPressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }),
      Animated.timing(shadowY, { toValue: 2, duration: 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const onPressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }),
      Animated.timing(shadowY, { toValue: 0, duration: 120, useNativeDriver: true }),
    ]).start();
  }, []);

  return { scale, shadowY, onPressIn, onPressOut };
}
