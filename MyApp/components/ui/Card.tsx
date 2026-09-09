import React from "react";
import { View, StyleSheet, ViewStyle, useColorScheme } from "react-native";
import { Palette, Spacing, BorderRadius, Shadow } from "@/constants/theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "elevated" | "outlined" | "flat";
}

export const Card: React.FC<CardProps> = ({ children, style, variant = "elevated" }) => {
  const scheme = useColorScheme() || "light";
  const isDark = scheme === "dark";
  const colors = isDark ? Palette.dark : Palette.light;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: variant === "outlined" ? 1 : 0,
        },
        variant === "elevated" ? Shadow.md : null,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginVertical: Spacing.xs,
    width: "100%",
  },
});
