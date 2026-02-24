import React from "react";
import { StyleSheet, View, ViewProps, SafeAreaView, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useTheme } from "../theme";

interface GlassScreenProps extends ViewProps {
  children: React.ReactNode;
  gradient?: readonly [string, string, ...string[]];
  noSafeArea?: boolean;
}

export const GlassScreen: React.FC<GlassScreenProps> = ({ children, gradient, noSafeArea, style, ...props }) => {
  const theme = useTheme();

  const colors: readonly [string, string, ...string[]] = gradient || [
    theme.colors.background,
    theme.colors.background,
    theme.colors.primary + "20", // Add some transparency
  ];

  const content = (
    <View style={[styles.container, style]} {...props}>
      {children}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={colors} style={styles.gradient} />
      {noSafeArea ? content : <SafeAreaView style={styles.container}>{content}</SafeAreaView>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
});
