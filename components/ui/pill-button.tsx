import type { ReactNode } from "react";

import {
  AppButton,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/app-button";
import type { AppButtonSize } from "@/components/ui/app-button";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type PillButtonProps = {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: "button";
  size?: AppButtonSize;
  style?: unknown;
  contentStyle?: unknown;
  mode?: string;
};

/** @deprecated Usa PrimaryButton / AppButton */
export function PillPrimaryButton({
  children,
  onPress,
  disabled,
  loading,
  icon,
  fullWidth = true,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  size = "lg",
}: PillButtonProps) {
  return (
    <AppButton
      variant="primary"
      size={size}
      icon={icon}
      loading={loading}
      disabled={disabled}
      fullWidth={fullWidth}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
    >
      {children}
    </AppButton>
  );
}

/** @deprecated Usa SecondaryButton / AppButton */
export function PillSecondaryButton({
  children,
  onPress,
  disabled,
  icon,
  fullWidth = true,
  size = "lg",
}: PillButtonProps) {
  return (
    <AppButton
      variant="secondary"
      size={size}
      icon={icon}
      disabled={disabled}
      fullWidth={fullWidth}
      onPress={onPress}
    >
      {children}
    </AppButton>
  );
}

export { PrimaryButton, SecondaryButton };
