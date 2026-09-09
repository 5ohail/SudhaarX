import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  useColorScheme,
} from "react-native";
import { Palette, Spacing, Typography, BorderRadius, Shadow } from "@/constants/theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  textStyle,
  icon,
}) => {
  const scheme = useColorScheme() || "light";
  const isDark = scheme === "dark";
  const colors = isDark ? Palette.dark : Palette.light;

  let buttonBg = Palette.primary;
  let textColor = "#FFFFFF";
  let borderWidth = 0;
  let borderColor = "transparent";

  if (variant === "secondary") {
    buttonBg = isDark ? Palette.dark.surface : Palette.primaryLight;
    textColor = Palette.primary;
  } else if (variant === "outline") {
    buttonBg = "transparent";
    textColor = isDark ? colors.text : Palette.primary;
    borderWidth = 1.5;
    borderColor = isDark ? colors.border : Palette.primary;
  } else if (variant === "danger") {
    buttonBg = Palette.error;
    textColor = "#FFFFFF";
  }

  let height = 52;
  let paddingHorizontal = Spacing.xxl;

  if (size === "small") {
    height = 40;
    paddingHorizontal = Spacing.lg;
  } else if (size === "large") {
    height = 58;
    paddingHorizontal = Spacing.sl;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: buttonBg,
          height,
          paddingHorizontal,
          borderWidth,
          borderColor,
          width: fullWidth ? "100%" : undefined,
          opacity: disabled ? 0.5 : 1,
        },
        variant === "primary" ? Shadow.md : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              Typography.button,
              { color: textColor, fontSize: size === "small" ? 14 : 16 },
              icon ? { marginLeft: Spacing.sm } : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.xs,
  },
});
