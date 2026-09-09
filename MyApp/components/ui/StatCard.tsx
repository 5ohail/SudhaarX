import React from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import { Palette, Typography, Spacing, BorderRadius, Shadow } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

interface StatCardProps {
  title: string;
  value: number | string;
  iconName: keyof typeof Ionicons.glyphMap;
  color?: string;
  bgColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  iconName,
  color = Palette.primary,
  bgColor,
}) => {
  const scheme = useColorScheme() || "light";
  const isDark = scheme === "dark";
  const colors = isDark ? Palette.dark : Palette.light;

  const iconBg = bgColor || (color + "1A"); // 10% opacity

  return (
    <View style={[styles.card, { backgroundColor: colors.card }, Shadow.sm]}>
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={22} color={color} />
      </View>
      <Text style={[Typography.h1, { color: colors.text, marginTop: Spacing.sm }]}>
        {value}
      </Text>
      <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    margin: Spacing.xs,
    minWidth: 140,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
});
