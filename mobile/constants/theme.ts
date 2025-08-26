import { scale, verticalScale } from "@/utils/styling";
import { useEffect, useState } from "react";
import { ColorSchemeName, useColorScheme } from "react-native";

export interface ColorPalette {
  // Brand colors
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Background colors
  background: string;
  backgroundElevated: string;
  backgroundInverse: string;

  // Border colors
  border: string;
  borderLight: string;

  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Grayscale
  gray50: string;
  gray100: string;
  gray200: string;
  gray300: string;
  gray400: string;
  gray500: string;
  gray600: string;
  gray700: string;
  gray800: string;
  gray900: string;
}

export interface Theme {
  colors: ColorPalette;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    "2xl": number;
    "3xl": number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
  fontSize: {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    "2xl": number;
    "3xl": number;
  };
}

// Light theme colors
export const lightColors: ColorPalette = {
  // Brand colors
  primary: "#F7955D",
  primaryLight: "#FFA977",
  primaryDark: "#E07C4A",

  // Text colors
  text: "#1A1A1A",
  textSecondary: "#4A4A4A",
  textTertiary: "#8E8E8E",
  textInverse: "#FFFFFF",

  // Background colors
  background: "#FFFFFF",
  backgroundElevated: "#F8F8F8",
  backgroundInverse: "#1A1A1A",

  // Border colors
  border: "#E0E0E0",
  borderLight: "#F0F0F0",

  // Status colors
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",

  // Grayscale
  gray50: "#FAFAFA",
  gray100: "#F5F5F5",
  gray200: "#EEEEEE",
  gray300: "#E0E0E0",
  gray400: "#BDBDBD",
  gray500: "#9E9E9E",
  gray600: "#8E8E8E",
  gray700: "#616161",
  gray800: "#424242",
  gray900: "#212121",
};

// Dark theme colors
export const darkColors: ColorPalette = {
  // Brand colors
  primary: "#F7955D",
  primaryLight: "#FFA977",
  primaryDark: "#E07C4A",

  // Text colors
  text: "#FFFFFF",
  textSecondary: "#E0E0E0",
  textTertiary: "#A0A0A0",
  textInverse: "#1A1A1A",

  // Background colors
  background: "#121212",
  backgroundElevated: "#1E1E1E",
  backgroundInverse: "#FFFFFF",

  // Border colors
  border: "#333333",
  borderLight: "#252525",

  // Status colors
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",

  // Grayscale
  gray50: "#1A1A1A",
  gray100: "#212121",
  gray200: "#2D2D2D",
  gray300: "#424242",
  gray400: "#616161",
  gray500: "#8E8E8E",
  gray600: "#9E9E9E",
  gray700: "#BDBDBD",
  gray800: "#E0E0E0",
  gray900: "#F5F5F5",
};

// Common theme properties
const commonTheme = {
  spacing: {
    xs: scale(4),
    sm: scale(8),
    md: scale(16),
    lg: scale(24),
    xl: scale(32),
    "2xl": scale(40),
    "3xl": scale(48),
  },
  borderRadius: {
    sm: scale(4),
    md: scale(8),
    lg: scale(12),
    full: scale(9999),
  },
  fontSize: {
    xs: scale(12),
    sm: scale(14),
    base: scale(16),
    lg: scale(18),
    xl: scale(20),
    "2xl": scale(24),
    "3xl": scale(30),
  },
};

// Theme generator function
export const getTheme = (colorScheme: ColorSchemeName): Theme => ({
  colors: colorScheme === "dark" ? darkColors : lightColors,
  ...commonTheme,
});

export const useTheme = () => {
  const deviceColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState<"light" | "dark" | null>(null);

  // Initialize with device color scheme
  useEffect(() => {
    if (colorScheme === null && deviceColorScheme) {
      setColorScheme(deviceColorScheme);
    }
  }, [deviceColorScheme]);

  const toggleColorScheme = () => {
    setColorScheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return {
    ...getTheme(colorScheme || deviceColorScheme || "light"),
    colorScheme,
    toggleColorScheme,
  };
};

export const theme = useTheme();
export const isDarkMode = theme.colorScheme === "dark";

// Default export for backward compatibility
export const colors = lightColors;

export const spacingX = {
  _3: scale(3),
  _5: scale(5),
  _7: scale(7),
  _10: scale(10),
  _12: scale(12),
  _15: scale(15),
  _20: scale(20),
  _25: scale(25),
  _30: scale(30),
  _35: scale(35),
  _40: scale(40),
};

export const spacingY = {
  _5: verticalScale(5),
  _7: verticalScale(7),
  _10: verticalScale(10),
  _12: verticalScale(12),
  _15: verticalScale(15),
  _17: verticalScale(17),
  _20: verticalScale(20),
  _25: verticalScale(25),
  _30: verticalScale(30),
  _35: verticalScale(35),
  _40: verticalScale(40),
  _50: verticalScale(50),
  _60: verticalScale(60),
};

export const radius = {
  _3: verticalScale(3),
  _6: verticalScale(6),
  _10: verticalScale(10),
  _12: verticalScale(12),
  _15: verticalScale(15),
  _17: verticalScale(17),
  _20: verticalScale(20),
  _30: verticalScale(30),
};
