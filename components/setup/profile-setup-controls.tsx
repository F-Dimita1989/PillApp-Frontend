import { forwardRef, type ComponentRef, type ReactNode } from "react";
import { Platform, Pressable, StyleSheet } from "react-native";
import { Input, Label, XStack, YStack, type InputProps } from "tamagui";

import { AppText } from "@/components/ui/app-text";
import { pillappColors } from "@/theme/tokens";

const FIELD_HEIGHT = 52;

type ProfileSetupInputProps = InputProps & {
  label?: string;
  error?: string;
  editable?: boolean;
};

export const ProfileSetupInput = forwardRef<
  ComponentRef<typeof Input>,
  ProfileSetupInputProps
>(function ProfileSetupInput(
  { label, error, editable, disabled, ...rest },
  ref,
) {
  const isDisabled = disabled ?? editable === false;

  return (
    <YStack width="100%" gap="$2" flexShrink={0}>
      {label ? (
        <Label
          color={pillappColors.onPrimary}
          fontSize={14}
          fontWeight="600"
          lineHeight={20}
        >
          {label}
        </Label>
      ) : null}
      <Input
        ref={ref}
        width="100%"
        alignSelf="stretch"
        flexShrink={0}
        backgroundColor="rgba(255,255,255,0.94)"
        borderColor={error ? pillappColors.error : "rgba(255,255,255,0.5)"}
        borderWidth={1.5}
        borderRadius="$3"
        color={pillappColors.textPrimary}
        fontSize={16}
        lineHeight={22}
        height={FIELD_HEIGHT}
        minHeight={FIELD_HEIGHT}
        maxHeight={FIELD_HEIGHT}
        paddingHorizontal="$4"
        paddingTop={Platform.OS === "android" ? 14 : 12}
        paddingBottom={Platform.OS === "android" ? 14 : 12}
        placeholderTextColor="$textMuted"
        disabled={isDisabled}
        opacity={isDisabled ? 0.55 : 1}
        showSoftInputOnFocus
        focusStyle={{
          borderColor: pillappColors.surface,
          borderWidth: 2,
        }}
        {...rest}
      />
      {error ? (
        <AppText variant="caption" color="inverse" opacity={0.95}>
          {error}
        </AppText>
      ) : null}
    </YStack>
  );
});

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
