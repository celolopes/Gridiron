import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { GlassScreen } from "./GlassScreen";
import { GlassButton } from "./GlassButton";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <GlassScreen style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Oops!</Text>
            <Text style={styles.subtitle}>Ocorreu um erro inesperado. Verifique sua conexão ou tente novamente.</Text>
            <GlassButton title="Recarregar App" onPress={() => this.setState({ hasError: false })} />
          </View>
        </GlassScreen>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    marginBottom: 30,
  },
});
