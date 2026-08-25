import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { pillappBrandGradient, pillappColors } from "@/theme/tokens";

export function BrandTabBarBackground() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[StyleSheet.absoluteFill, styles.host]}>
      <LinearGradient
        colors={[...pillappBrandGradient.colors]}
        locations={[...pillappBrandGradient.locations]}
        start={pillappBrandGradient.start}
        end={pillappBrandGradient.end}
        style={[styles.gradient, { bottom: insets.bottom }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    backgroundColor: pillappColors.surface,
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
});
