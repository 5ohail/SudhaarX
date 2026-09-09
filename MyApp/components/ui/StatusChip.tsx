import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Palette, Typography, BorderRadius, Spacing } from "@/constants/theme";

export type IssueStatus = "Pending" | "VERIFIED" | "Assigned" | "IN_PROGRESS" | "Resolved" | "Rejected";

interface StatusChipProps {
  status: IssueStatus | string;
  size?: "small" | "medium";
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = "medium" }) => {
  const normStatus = (status || "Pending").toString().toUpperCase();

  let bg = Palette.warningLight;
  let text = Palette.warning;
  let label = "Pending";

  if (normStatus === "VERIFIED") {
    bg = Palette.infoLight;
    text = Palette.info;
    label = "Verified";
  } else if (normStatus === "ASSIGNED") {
    bg = Palette.secondaryLight;
    text = Palette.secondary;
    label = "Assigned";
  } else if (normStatus === "IN_PROGRESS") {
    bg = "#E0F2FE";
    text = "#0284C7";
    label = "In Progress";
  } else if (normStatus === "RESOLVED") {
    bg = Palette.successLight;
    text = Palette.success;
    label = "Resolved";
  } else if (normStatus === "REJECTED") {
    bg = Palette.errorLight;
    text = Palette.error;
    label = "Rejected";
  }

  const isSmall = size === "small";

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: bg,
          paddingHorizontal: isSmall ? Spacing.sm : Spacing.md,
          paddingVertical: isSmall ? 2 : Spacing.xs,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: text }]} />
      <Text style={[Typography.caption, { color: text, fontWeight: "700", fontSize: isSmall ? 11 : 12 }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.full,
    alignSelf: "flex-start",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
});
