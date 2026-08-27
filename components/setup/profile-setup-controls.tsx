import type { ReactNode } from "react";
import { Pressable, StyleSheet } from "react-native";
import { XStack } from "tamagui";

import { AppText } from "@/components/ui/app-text";
import { pillappColors } from "@/theme/tokens";

type ProfileSetupButtonProps = {
  children: string;
  onPress?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
};

export function ProfileSetupPrimaryButton({
  children,
  onPress,
  disabled = false,
  fullWidth = false,
}: ProfileSetupButtonProps) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={children}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.primaryButton,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <AppText
        variant="body"
        color="primary"
        fontWeight="700"
        textAlign="center"
      >
        {children}
      </AppText>
    </Pressable>
  );
}

export function ProfileSetupSecondaryButton({
  children,
  onPress,
  disabled = false,
  fullWidth = false,
}: ProfileSetupButtonProps) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={children}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.secondaryButton,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <AppText
        variant="body"
        color="inverse"
        fontWeight="600"
        textAlign="center"
      >
        {children}
      </AppText>
    </Pressable>
  );
}

export function ProfileSetupButtonRow({ children }: { children: ReactNode }) {
  return (
    <XStack width="100%" gap="$3" flexWrap="wrap">
      {children}
    </XStack>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    minHeight: 48,
    flex: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: pillappColors.surface,
  },
  secondaryButton: {
    minHeight: 48,
    flex: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.88)",
    backgroundColor: "transparent",
  },
  fullWidth: {
    flex: undefined,
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.9,
  },
});
