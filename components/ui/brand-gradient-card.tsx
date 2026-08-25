import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";

import { pillappBrandGradient, pillappRadius, pillappShadows } from "@/theme/tokens";

type BrandGradientCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function BrandGradientCard({ children, style }: BrandGradientCardProps) {
  return (
    <LinearGradient
      colors={[...pillappBrandGradient.colors]}
      locations={[...pillappBrandGradient.locations]}
      start={pillappBrandGradient.start}
      end={pillappBrandGradient.end}
      style={[styles.card, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: pillappRadius[4],
    padding: 16,
    overflow: "hidden",
    ...pillappShadows.md,
  },
});
