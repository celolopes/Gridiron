import React, { useEffect, useRef } from "react";
import { StyleSheet, Animated, View, ViewProps } from "react-native";
import { useTheme } from "../theme";

interface LoadingSkeletonProps extends ViewProps {
  width?: any;
  height?: any;
  borderRadius?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ width = "100%", height = 20, borderRadius, style, ...props }) => {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: theme.colors.card,
          borderRadius: borderRadius ?? theme.radius.sm,
          opacity,
        },
        style,
      ]}
      {...props}
    />
  );
};
