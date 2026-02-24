import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "../theme";

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  intensity?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, intensity, style, ...props }) => {
  const theme = useTheme();

  return (
    <BlurView
      intensity={intensity ?? theme.glass.intensity}
      tint="dark"
      style={[
        styles.card,
        {
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
});
