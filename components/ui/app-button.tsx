import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet } from "react-native";
import { XStack, type XStackProps } from "tamagui";

import { useCardSurface } from "@/components/ui/card-surface";
import { useAccessibility } from "@/lib/accessibility/context";
import { playAppHaptic } from "@/lib/accessibility/haptics";
import { scaleFontSize } from "@/lib/accessibility/prefs";
import {
  childrenToSpeakableText,
  speakAppText,
} from "@/lib/accessibility/speech";
import {
  HealthcareButtonFrame,
  HealthcareText,
} from "@/theme/tamagui-primitives";
import { pillappBrandGradient, pillappColors, pillappShadows } from "@/theme/tokens";

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

function iconColor(variant: AppButtonVariant, onBrand: boolean): string {
  if (onBrand && variant === "primary") return pillappColors.primary;
  if (onBrand && variant === "secondary") return pillappColors.onPrimary;
  switch (variant) {
    case "secondary":
      return pillappColors.secondary;
    case "ghost":
      return onBrand ? pillappColors.onPrimary : pillappColors.textPrimary;
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
  onBrand: boolean,
): "primary" | "secondary" | "inverse" | undefined {
  if (onBrand && variant === "primary") return "primary";
  if (onBrand && variant === "secondary") return "inverse";
  if (variant === "secondary") return "secondary";
  if (variant === "ghost") return onBrand ? "inverse" : undefined;
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

function ButtonInner({
  children,
  variant,
  size,
  icon,
  loading,
  onBrand,
  stretches,
}: {
  children: ReactNode;
  variant: AppButtonVariant;
  size: AppButtonSize;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  loading: boolean;
  onBrand: boolean;
  stretches: boolean;
}) {
  const { fontScale, largeText } = useAccessibility();
  const iconSize = size === "lg" ? 22 : 20;
  const color = iconColor(variant, onBrand);
  const buttonFont = largeText ? scaleFontSize(16, fontScale) : 16;
  const buttonLine = largeText ? scaleFontSize(22, fontScale) : 22;

  if (loading) {
    return <ActivityIndicator color={color} />;
  }

  return (
    <XStack
      alignItems="center"
      justifyContent="center"
      gap={8}
      flexShrink={1}
      width={stretches ? "100%" : undefined}
      maxWidth="100%"
    >
      {icon ? <IconSlot name={icon} size={iconSize} color={color} /> : null}
      <HealthcareText
        variant="button"
        tone={textTone(variant, onBrand)}
        flexShrink={1}
        fontSize={buttonFont}
        lineHeight={buttonLine}
        style={
          Platform.OS === "android"
            ? { includeFontPadding: false, textAlignVertical: "center" }
            : undefined
        }
      >
        {children}
      </HealthcareText>
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
  const surface = useCardSurface();
  const { easyTap, hapticsEnabled, reduceMotion, speechEnabled } = useAccessibility();
  const onBrand = surface === "brand";
  const isDisabled = disabled || loading;
  const stretches = fullWidth || flex != null;
  const label =
    accessibilityLabel ??
    (typeof children === "string"
      ? children
      : childrenToSpeakableText(children) || undefined);
  const easyTapStyle = easyTap ? styles.easyTap : undefined;

  const handlePress = () => {
    if (isDisabled) return;
    void playAppHaptic(hapticsEnabled, variant === "danger" ? "warning" : "light");
    if (speechEnabled && label) speakAppText(label, { force: true });
    onPress?.();
  };

  const inner = (
    <ButtonInner
      variant={variant}
      size={size}
      icon={icon}
      loading={loading}
      onBrand={onBrand}
      stretches={stretches}
    >
      {children}
    </ButtonInner>
  );

  if (onBrand && (variant === "primary" || variant === "secondary")) {
    return (
      <Pressable
        onPress={isDisabled ? undefined : handlePress}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: isDisabled }}
        style={({ pressed }) => [
          styles.pill,
          size === "md" ? styles.pillMd : styles.pillLg,
          easyTapStyle,
          variant === "primary" ? styles.brandPrimary : styles.brandSecondary,
          stretches && styles.fullWidth,
          isDisabled && styles.disabled,
          pressed && !isDisabled && !reduceMotion && styles.pressed,
        ]}
      >
        {inner}
      </Pressable>
    );
  }

  if (!onBrand && variant === "primary") {
    return (
      <Pressable
        onPress={isDisabled ? undefined : handlePress}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: isDisabled }}
        style={({ pressed }) => [
          stretches && styles.fullWidth,
          isDisabled && styles.disabled,
          pressed && !isDisabled && !reduceMotion && styles.pressed,
        ]}
      >
        <LinearGradient
          colors={[...pillappBrandGradient.colors]}
          locations={[...pillappBrandGradient.locations]}
          start={pillappBrandGradient.start}
          end={pillappBrandGradient.end}
          style={[
            styles.pill,
            size === "md" ? styles.pillMd : styles.pillLg,
            easyTapStyle,
            stretches && styles.fullWidth,
          ]}
        >
          {inner}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <HealthcareButtonFrame
      variant={variant}
      size={size}
      disabled={isDisabled}
      fullWidth={stretches}
      flex={flex}
      onPress={isDisabled ? undefined : handlePress}
      minHeight={easyTap ? 60 : undefined}
      pressStyle={reduceMotion ? { opacity: 1, scale: 1 } : undefined}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled }}
      {...rest}
    >
      {inner}
    </HealthcareButtonFrame>
  );
}

export function PrimaryButton(props: Omit<AppButtonProps, "variant">) {
  return <AppButton variant="primary" {...props} />;
}

export function SecondaryButton(props: Omit<AppButtonProps, "variant">) {
  return <AppButton variant="secondary" {...props} />;
}

const styles = StyleSheet.create({
  pill: {
    minHeight: 48,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    ...pillappShadows.sm,
  },
  pillLg: {
    minHeight: 52,
  },
  pillMd: {
    minHeight: 48,
  },
  easyTap: {
    minHeight: 60,
    paddingVertical: 14,
  },
  brandPrimary: {
    backgroundColor: pillappColors.surface,
  },
  brandSecondary: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.88)",
  },
  fullWidth: {
    width: "100%",
    alignSelf: "stretch",
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.9,
  },
});
