import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  useColorScheme,
} from "react-native";
import { Palette, Spacing, Typography, BorderRadius } from "@/constants/theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  rightIcon,
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const scheme = useColorScheme() || "light";
  const isDark = scheme === "dark";
  const colors = isDark ? Palette.dark : Palette.light;
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[Typography.label, { color: colors.text, marginBottom: Spacing.xs }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.inputBackground,
            borderColor: error
              ? Palette.error
              : isFocused
              ? Palette.primary
              : colors.border,
            borderWidth: isFocused || error ? 1.5 : 1,
          },
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[
            Typography.body,
            styles.input,
            { color: colors.text },
            style,
          ]}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus && onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur && onBlur(e);
          }}
          {...props}
        />
        {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
      </View>
      {error && (
        <Text style={[Typography.caption, { color: Palette.error, marginTop: 4 }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
    width: "100%",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    height: 54,
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    height: "100%",
  },
});
