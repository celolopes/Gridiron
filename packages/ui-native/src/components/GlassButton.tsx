import React from "react";
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, ActivityIndicator, View } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "../theme";

interface GlassButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: "primary" | "secondary" | "glass";
  textStyle?: import("react-native").TextStyle;
}

export const GlassButton: React.FC<GlassButtonProps> = ({ title, loading, variant = "primary", style, textStyle, ...props }) => {
  const theme = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case "primary":
        return theme.colors.primary;
      case "secondary":
        return theme.colors.accent;
      case "glass":
        return theme.colors.card;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={loading || props.disabled}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderRadius: theme.radius.md,
        },
        style,
      ]}
      {...props}
    >
      {loading ? <ActivityIndicator color={theme.colors.foreground} /> : <Text style={[styles.text, { color: theme.colors.foreground }, textStyle]}>{title}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});
