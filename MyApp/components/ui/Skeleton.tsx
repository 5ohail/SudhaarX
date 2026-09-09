import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, DimensionValue, useColorScheme } from "react-native";
import { Palette, BorderRadius } from "@/constants/theme";

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 20,
  borderRadius = BorderRadius.sm,
  style,
}) => {
  const scheme = useColorScheme() || "light";
  const isDark = scheme === "dark";
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  const bg = isDark ? "#2A3631" : "#E2E8F0";

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: bg,
          opacity,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    marginVertical: 4,
  },
});
