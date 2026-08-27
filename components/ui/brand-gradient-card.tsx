import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { pillappBrandGradient, pillappRadius, pillappShadows } from "@/theme/tokens";

type BrandGradientCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function BrandGradientCard({ children, style }: BrandGradientCardProps) {
  return (
    <View style={styles.shadow}>
      <LinearGradient
        colors={[...pillappBrandGradient.colors]}
        locations={[...pillappBrandGradient.locations]}
        start={pillappBrandGradient.start}
        end={pillappBrandGradient.end}
        style={[styles.card, style]}
      >
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    width: "100%",
    borderRadius: pillappRadius[4],
    ...pillappShadows.md,
  },
  card: {
    width: "100%",
    borderRadius: pillappRadius[4],
    padding: 16,
    overflow: "hidden",
  },
});
