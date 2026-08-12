/**
 * Farm Express Design System
 * -----------------------------------------------------------------------
 * Minimal, premium, agriculture-inspired design tokens.
 * Every screen in the app should consume these tokens rather than
 * hard-coded values, so the whole product stays visually consistent
 * and dark mode / rebranding only ever requires editing this file.
 */

export const palette = {
  white: "#FFFFFF",
  black: "#0B1210",

  // Soft green — primary brand accent (agriculture inspired)
  green50: "#F2F9F4",
  green100: "#E1F2E6",
  green200: "#BFE3CA",
  green300: "#93CDA6",
  green400: "#63B27F",
  green500: "#3E9563",
  green600: "#2F6E4E", // primary
  green700: "#265A40",
  green800: "#1E4733",
  green900: "#173629",

  // Warm neutrals for premium, clean backgrounds
  neutral0: "#FFFFFF",
  neutral50: "#FAFBFA",
  neutral100: "#F4F6F5",
  neutral200: "#E7EBE8",
  neutral300: "#D3D9D5",
  neutral400: "#A7B0AB",
  neutral500: "#7C877F",
  neutral600: "#5B655E",
  neutral700: "#414944",
  neutral800: "#2A302C",
  neutral900: "#171B18",
  neutral950: "#0D110E",

  amber500: "#E0A730",
  amber600: "#C4901F",
  red500: "#D9534F",
  red600: "#C13F3B",
  blue500: "#3E7EBF",

  transparent: "transparent",
} as const;

export const lightTheme = {
  mode: "light" as const,
  background: palette.neutral50,
  surface: palette.white,
  surfaceAlt: palette.green50,
  border: palette.neutral200,
  textPrimary: palette.neutral900,
  textSecondary: palette.neutral600,
  textInverse: palette.white,
  primary: palette.green600,
  primaryPressed: palette.green700,
  primarySoft: palette.green100,
  success: palette.green600,
  warning: palette.amber500,
  danger: palette.red500,
  info: palette.blue500,
  card: palette.white,
  overlay: "rgba(13, 17, 14, 0.45)",
  tabBarBackground: palette.white,
  skeleton: palette.neutral200,
};

export const darkTheme = {
  mode: "dark" as const,
  background: palette.neutral950,
  surface: palette.neutral900,
  surfaceAlt: palette.green900,
  border: palette.neutral800,
  textPrimary: palette.neutral50,
  textSecondary: palette.neutral400,
  textInverse: palette.neutral900,
  primary: palette.green400,
  primaryPressed: palette.green300,
  primarySoft: palette.green800,
  success: palette.green400,
  warning: palette.amber500,
  danger: "#E27672",
  info: "#6FA6DE",
  card: palette.neutral900,
  overlay: "rgba(0, 0, 0, 0.6)",
  tabBarBackground: palette.neutral900,
  skeleton: palette.neutral800,
};

/**
 * `mode` is intentionally widened to the full union here (rather than just
 * inferring `typeof lightTheme`, which would lock it to the literal
 * `"light"`) — every component compares `theme.mode === "dark"` at runtime,
 * which only type-checks if both branches of the union are possible.
 */
export type AppTheme = Omit<typeof lightTheme, "mode"> & { mode: "light" | "dark" };

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radii = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
} as const;

export const typography = {
  fontFamily: {
    regular: "System",
    medium: "System",
    semibold: "System",
    bold: "System",
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    display: 34,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 26,
    xl: 30,
    xxl: 36,
    display: 42,
  },
} as const;

export const shadows = {
  sm: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    elevation: 8,
  },
} as const;

export const animation = {
  fast: 150,
  base: 250,
  slow: 400,
} as const;
