import React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { useTheme } from "../theme";
import { GlassCard } from "./GlassCard";

interface ProductCardProps {
  name: string;
  price: number;
  image?: string;
  onPress?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({ name, price, image, onPress }) => {
  const theme = useTheme();

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <GlassCard style={styles.card}>
        {image ? (
          <Image source={{ uri: image }} style={[styles.image, { borderRadius: theme.radius.sm }]} />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.card, borderRadius: theme.radius.sm }]}>
            <Text style={{ color: theme.colors.textMuted }}>No Image</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text numberOfLines={2} style={[styles.name, { color: theme.colors.text }]}>
            {name}
          </Text>
          <Text style={[styles.price, { color: theme.colors.primary }]}>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price)}</Text>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 80,
    height: 80,
    marginRight: 16,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
  },
});
