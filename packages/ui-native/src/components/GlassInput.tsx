import React from "react";
import { StyleSheet, TextInput, TextInputProps, Text, View } from "react-native";
import { useTheme } from "../theme";

interface GlassInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const GlassInput: React.FC<GlassInputProps> = ({ label, error, style, ...props }) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.card,
            borderColor: error ? "#FF3B30" : theme.colors.border,
            borderRadius: theme.radius.sm,
          },
        ]}
      >
        <TextInput placeholderTextColor={theme.colors.textMuted} style={[styles.input, { color: theme.colors.text }, style]} {...props} />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "500",
  },
  inputContainer: {
    borderWidth: 1,
    minHeight: 48,
    justifyContent: "center",
  },
  input: {
    paddingHorizontal: 12,
    fontSize: 16,
    height: "100%",
  },
  error: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 4,
  },
});
