import { createContext, useContext } from "react";

export interface ThemeTokens {
  colors: {
    primary: string;
    accent: string;
    background: string;
    foreground: string;
    glass: string;
    glassDark: string;
    card: string;
    border: string;
    text: string;
    textMuted: string;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
  blur: {
    sm: number;
    md: number;
    lg: number;
  };
  glass: {
    opacity: number;
    intensity: number;
  };
}

export const defaultTheme: ThemeTokens = {
  colors: {
    primary: "#007AFF",
    accent: "#5856D6",
    background: "#000000",
    foreground: "#FFFFFF",
    glass: "rgba(255, 255, 255, 0.1)",
    glassDark: "rgba(0, 0, 0, 0.2)",
    card: "rgba(255, 255, 255, 0.05)",
    border: "rgba(255, 255, 255, 0.1)",
    text: "#FFFFFF",
    textMuted: "#8E8E93",
  },
  radius: {
    sm: 8,
    md: 16,
    lg: 24,
    full: 9999,
  },
  blur: {
    sm: 4,
    md: 10,
    lg: 20,
  },
  glass: {
    opacity: 0.1,
    intensity: 10,
  },
};

export const ThemeContext = createContext<ThemeTokens>(defaultTheme);

export const useTheme = () => useContext(ThemeContext);

export const createTenantTheme = (tenant: any): ThemeTokens => {
  return {
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      primary: tenant.primaryColor || defaultTheme.colors.primary,
      accent: tenant.accentColor || defaultTheme.colors.accent,
    },
    glass: {
      opacity: tenant.glassOpacity ?? defaultTheme.glass.opacity,
      intensity: tenant.blurIntensity ?? defaultTheme.glass.intensity,
    },
  };
};
