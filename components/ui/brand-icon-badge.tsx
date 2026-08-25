import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";

import { pillappBrandGradient, pillappColors } from "@/theme/tokens";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export function BrandIconBadge({
  name,
  size = 48,
  iconSize = 24,
  radius,
}: {
  name: IconName;
  size?: number;
  iconSize?: number;
  radius?: number;
}) {
  return (
    <LinearGradient
      colors={[...pillappBrandGradient.colors]}
      locations={[...pillappBrandGradient.locations]}
      start={pillappBrandGradient.start}
      end={pillappBrandGradient.end}
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: radius ?? size / 2,
        },
      ]}
    >
      <MaterialCommunityIcons
        name={name}
        size={iconSize}
        color={pillappColors.onPrimary}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
