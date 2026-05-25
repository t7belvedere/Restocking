import { useEffect, useRef } from "react";
import { Animated, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

interface SkeletonProps extends ViewProps {
  children?: React.ReactNode;
}

export function Skeleton({ className, style, ...props }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={cn("rounded-md bg-muted", className)}
      style={[{ opacity }, style]}
      {...props}
    />
  );
}
