import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { pillappColors } from "@/theme/tokens";

const brandGradient = {
  colors: [
    pillappColors.secondary,
    "#4EC4B5",
    pillappColors.primary,
    pillappColors.primaryDark,
  ] as const,
  locations: [0, 0.35, 0.7, 1] as const,
  start: { x: 0, y: 0 } as const,
  end: { x: 1, y: 1 } as const,
};

type OnboardingGradientButtonProps = {
  label: string;
  onPress: () => void;
};

export function OnboardingGradientButton({
  label,
  onPress,
}: OnboardingGradientButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <LinearGradient
        colors={brandGradient.colors}
        locations={brandGradient.locations}
        start={brandGradient.start}
        end={brandGradient.end}
        style={styles.gradient}
      >
        <AppText variant="body" color="inverse" fontWeight="700">
          {label}
        </AppText>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    minHeight: 48,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.9,
  },
});
