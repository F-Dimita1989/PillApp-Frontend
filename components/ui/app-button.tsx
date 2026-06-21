import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { ActivityIndicator, Platform } from "react-native";
import { XStack, type XStackProps } from "tamagui";

import {
  HealthcareButtonFrame,
  HealthcareText,
} from "@/theme/tamagui-primitives";
import { pillappColors } from "@/theme/tokens";

export type AppButtonVariant = "primary" | "secondary" | "ghost" | "success" | "danger";
export type AppButtonSize = "lg" | "md";

type AppButtonProps = XStackProps & {
  children: ReactNode;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  onPress?: () => void;
};

function iconColor(variant: AppButtonVariant): string {
  switch (variant) {
    case "secondary":
      return pillappColors.primary;
    case "ghost":
      return pillappColors.textPrimary;
    case "success":
      return pillappColors.onSuccess;
    case "danger":
      return pillappColors.onError;
    default:
      return pillappColors.onPrimary;
  }
}

function textTone(
  variant: AppButtonVariant,
): "primary" | "secondary" | "inverse" | undefined {
  if (variant === "secondary") return "primary";
  if (variant === "ghost") return undefined;
  if (variant === "success") return "inverse";
  if (variant === "danger") return "inverse";
  return "inverse";
}

function IconSlot({
  name,
  size,
  color,
}: {
  name: keyof typeof MaterialCommunityIcons.glyphMap;
  size: number;
  color: string;
}) {
  return (
    <XStack
      width={size + 2}
      height={size + 2}
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
    >
      <MaterialCommunityIcons name={name} size={size} color={color} />
    </XStack>
  );
}

export function AppButton({
  children,
  variant = "primary",
  size = "lg",
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
  onPress,
  flex,
  ...rest
}: AppButtonProps) {
  const isDisabled = disabled || loading;
  const iconSize = size === "lg" ? 22 : 20;
  const stretches = fullWidth || flex != null;

  return (
    <HealthcareButtonFrame
      variant={variant}
      size={size}
      disabled={isDisabled}
      fullWidth={stretches}
      flex={flex}
      onPress={isDisabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ?? (typeof children === "string" ? children : undefined)
      }
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={iconColor(variant)} />
      ) : (
        <XStack
          alignItems="center"
          justifyContent="center"
          gap={8}
          flexShrink={1}
          width={stretches ? "100%" : undefined}
          maxWidth="100%"
        >
          {icon ? (
            <IconSlot name={icon} size={iconSize} color={iconColor(variant)} />
          ) : null}
          <HealthcareText
            variant="button"
            tone={textTone(variant)}
            flexShrink={1}
            style={
              Platform.OS === "android"
                ? { includeFontPadding: false, textAlignVertical: "center" }
                : undefined
            }
          >
            {children}
          </HealthcareText>
        </XStack>
      )}
    </HealthcareButtonFrame>
  );
}

export function PrimaryButton(props: Omit<AppButtonProps, "variant">) {
  return <AppButton variant="primary" {...props} />;
}

export function SecondaryButton(props: Omit<AppButtonProps, "variant">) {
  return <AppButton variant="secondary" {...props} />;
}
