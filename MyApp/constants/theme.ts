export const Palette = {
  // Brand Primary (Government-grade Emerald Green)
  primary: "#008545",
  primaryDark: "#006032",
  primaryLight: "#E8F5E9",
  primaryGradientStart: "#008545",
  primaryGradientEnd: "#00A859",

  // Secondary & Accents
  secondary: "#007AFF",
  secondaryLight: "#EBF5FF",
  accent: "#6366F1",

  // Status Colors
  success: "#10B981",
  successLight: "#D1FAE5",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  error: "#EF4444",
  errorLight: "#FEE2E2",
  info: "#3B82F6",
  infoLight: "#DBEAFE",

  // Neutral Light Theme
  light: {
    background: "#F4F7F6",
    surface: "#FFFFFF",
    card: "#FFFFFF",
    text: "#111827",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
    border: "#E5E7EB",
    borderFocus: "#008545",
    inputBackground: "#F9FAFB",
    shadow: "rgba(0, 0, 0, 0.06)",
    overlay: "rgba(0, 0, 0, 0.4)",
  },

  // Neutral Dark Theme
  dark: {
    background: "#121816",
    surface: "#1A2320",
    card: "#1F2B27",
    text: "#F9FAFB",
    textSecondary: "#9CA3AF",
    textMuted: "#6B7280",
    border: "#2D3B36",
    borderFocus: "#10B981",
    inputBackground: "#1A2320",
    shadow: "rgba(0, 0, 0, 0.3)",
    overlay: "rgba(0, 0, 0, 0.7)",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  sl: 32,
  huge: 40,
  giant: 48,
  massive: 64,
};

export const Typography = {
  display: { fontSize: 32, fontWeight: "900" as const, lineHeight: 40 },
  h1: { fontSize: 26, fontWeight: "800" as const, lineHeight: 34 },
  h2: { fontSize: 20, fontWeight: "700" as const, lineHeight: 28 },
  h3: { fontSize: 17, fontWeight: "700" as const, lineHeight: 24 },
  body: { fontSize: 15, fontWeight: "400" as const, lineHeight: 22 },
  bodyBold: { fontSize: 15, fontWeight: "600" as const, lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: "400" as const, lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: "500" as const, lineHeight: 16 },
  button: { fontSize: 16, fontWeight: "700" as const, lineHeight: 24 },
  label: { fontSize: 14, fontWeight: "600" as const, lineHeight: 20 },
};

export const BorderRadius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: "#008545",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
};
