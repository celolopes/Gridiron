import React from "react";
import { StyleSheet, Text, View, ViewProps } from "react-native";
import { useTheme } from "../theme";

interface GlassBadgeProps extends ViewProps {
  label: string;
  variant?: "success" | "warning" | "error" | "info";
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({ label, variant = "info", style, ...props }) => {
  const theme = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return { bg: "#34C75920", text: "#34C759" };
      case "warning":
        return { bg: "#FF950020", text: "#FF9500" };
      case "error":
        return { bg: "#FF3B3020", text: "#FF3B30" };
      case "info":
        return { bg: theme.colors.primary + "20", text: theme.colors.primary };
      default:
        return { bg: theme.colors.primary + "20", text: theme.colors.primary };
    }
  };

  const colors = getVariantStyles();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderRadius: theme.radius.full,
        },
        style,
      ]}
      {...props}
    >
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});
