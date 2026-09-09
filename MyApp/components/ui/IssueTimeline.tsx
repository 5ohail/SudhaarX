import React from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import { Palette, Typography, Spacing, BorderRadius } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

export interface TimelineStep {
  title: string;
  subtitle?: string;
  timestamp?: string;
  status: "completed" | "current" | "pending";
}

interface IssueTimelineProps {
  currentStatus: string; // Pending, Verified, Assigned, In Progress, Resolved
  createdAt?: string;
}

export const IssueTimeline: React.FC<IssueTimelineProps> = ({ currentStatus, createdAt }) => {
  const scheme = useColorScheme() || "light";
  const isDark = scheme === "dark";
  const colors = isDark ? Palette.dark : Palette.light;

  const statusUpper = (currentStatus || "PENDING").toUpperCase();

  const getStepStatus = (stepIndex: number): "completed" | "current" | "pending" => {
    // 0: Submitted, 1: Verified, 2: Assigned, 3: In Progress, 4: Resolved
    let activeLevel = 0;
    if (statusUpper === "VERIFIED") activeLevel = 1;
    else if (statusUpper === "ASSIGNED") activeLevel = 2;
    else if (statusUpper === "IN_PROGRESS") activeLevel = 3;
    else if (statusUpper === "RESOLVED") activeLevel = 4;

    if (stepIndex < activeLevel) return "completed";
    if (stepIndex === activeLevel) return "current";
    return "pending";
  };

  const steps: TimelineStep[] = [
    { title: "Report Submitted", subtitle: "Received & Logged", timestamp: createdAt ? new Date(createdAt).toLocaleDateString() : "Just now", status: getStepStatus(0) },
    { title: "AI / Admin Verification", subtitle: "Authenticity Confirmed", status: getStepStatus(1) },
    { title: "Officer Assigned", subtitle: "Assigned to Ward Department", status: getStepStatus(2) },
    { title: "Work In Progress", subtitle: "On-site Repair Underway", status: getStepStatus(3) },
    { title: "Issue Resolved", subtitle: "Citizen Impact Verified", status: getStepStatus(4) },
  ];

  return (
    <View style={styles.container}>
      <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.lg }]}>
        Resolution Progress
      </Text>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isCompleted = step.status === "completed";
        const isCurrent = step.status === "current";

        let iconName: keyof typeof Ionicons.glyphMap = "radio-button-off-outline";
        let iconColor = colors.textMuted;
        let circleBg = colors.inputBackground;

        if (isCompleted) {
          iconName = "checkmark-circle";
          iconColor = Palette.primary;
          circleBg = Palette.primaryLight;
        } else if (isCurrent) {
          iconName = "ellipsis-horizontal-circle";
          iconColor = Palette.secondary;
          circleBg = Palette.secondaryLight;
        }

        return (
          <View key={index} style={styles.stepRow}>
            <View style={styles.leftCol}>
              <View style={[styles.iconCircle, { backgroundColor: circleBg }]}>
                <Ionicons name={iconName} size={20} color={iconColor} />
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.line,
                    {
                      backgroundColor: isCompleted ? Palette.primary : colors.border,
                    },
                  ]}
                />
              )}
            </View>
            <View style={styles.rightCol}>
              <View style={styles.headerRow}>
                <Text
                  style={[
                    Typography.bodyBold,
                    {
                      color: isCurrent ? Palette.primary : isCompleted ? colors.text : colors.textMuted,
                    },
                  ]}
                >
                  {step.title}
                </Text>
                {step.timestamp && (
                  <Text style={[Typography.caption, { color: colors.textMuted }]}>
                    {step.timestamp}
                  </Text>
                )}
              </View>
              {step.subtitle && (
                <Text style={[Typography.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>
                  {step.subtitle}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
    width: "100%",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  leftCol: {
    alignItems: "center",
    marginRight: Spacing.lg,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  line: {
    width: 2,
    height: 38,
    marginVertical: 2,
  },
  rightCol: {
    flex: 1,
    paddingBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
