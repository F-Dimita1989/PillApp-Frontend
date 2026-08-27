import { Platform } from "react-native";
import { Input, YStack, type InputProps } from "tamagui";

import { AppText } from "@/components/ui/app-text";
import { useCardSurface } from "@/components/ui/card-surface";
import { useAccessibility } from "@/lib/accessibility/context";
import { scaleFontSize } from "@/lib/accessibility/prefs";
import { pillappColors } from "@/theme/tokens";

const SINGLE_LINE_HEIGHT = 52;
const EASY_TAP_LINE_HEIGHT = 60;

function multilineHeight(rows: number, minHeight?: number | string) {
  if (typeof minHeight === "number") return minHeight;
  return rows * 28 + 32;
}

type AppInputProps = InputProps & {
  label?: string;
  hint?: string;
  error?: string;
  /** Alias RN — mappa su disabled */
  editable?: boolean;
};

export function AppInput({
  label,
  hint,
  error,
  editable,
  disabled,
  multiline,
  numberOfLines,
  minHeight,
  height,
  textAlignVertical,
  ...rest
}: AppInputProps) {
  const onBrand = useCardSurface() === "brand";
  const { easyTap, fontScale, highContrast, largeText } = useAccessibility();
  const isDisabled = disabled ?? editable === false;
  const isMultiline = Boolean(multiline);
  const rows = typeof numberOfLines === "number" ? numberOfLines : 4;
  const singleHeight = easyTap ? EASY_TAP_LINE_HEIGHT : SINGLE_LINE_HEIGHT;
  const fieldHeight = isMultiline
    ? typeof height === "number"
      ? height
      : multilineHeight(rows, typeof minHeight === "number" ? minHeight : undefined)
    : typeof height === "number"
      ? height
      : singleHeight;
  const inputFont = largeText ? scaleFontSize(16, fontScale) : 16;
  const inputLine = largeText ? scaleFontSize(22, fontScale) : 22;

  return (
    <YStack width="100%" gap="$2" flexShrink={0} alignSelf="stretch">
      {label ? <AppText variant="label">{label}</AppText> : null}
      <Input
        width="100%"
        alignSelf="stretch"
        flexShrink={0}
        multiline={isMultiline}
        numberOfLines={isMultiline ? rows : 1}
        backgroundColor="rgba(255,255,255,0.94)"
        borderColor={
          error
            ? "$error"
            : highContrast
              ? pillappColors.textPrimary
              : onBrand
                ? "rgba(255,255,255,0.5)"
                : "$border"
        }
        borderWidth={highContrast ? 2 : 1.5}
        borderRadius="$3"
        color="$textPrimary"
        fontSize={inputFont}
        lineHeight={inputLine}
        height={fieldHeight}
        minHeight={fieldHeight}
        maxHeight={isMultiline ? undefined : fieldHeight}
        paddingHorizontal="$4"
        paddingTop={isMultiline ? 12 : Platform.OS === "android" ? 14 : 12}
        paddingBottom={isMultiline ? 12 : Platform.OS === "android" ? 14 : 12}
        textAlignVertical={textAlignVertical ?? (isMultiline ? "top" : "center")}
        placeholderTextColor={highContrast ? "$textSecondary" : "$textMuted"}
        disabled={isDisabled}
        opacity={isDisabled ? 0.55 : 1}
        focusStyle={{
          borderColor: "$secondary",
          borderWidth: 2,
        }}
        {...rest}
      />
      {error ? (
        <AppText variant="caption" color="error">
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" muted>
          {hint}
        </AppText>
      ) : null}
    </YStack>
  );
}

export function AppInputMultiline({
  rows = 4,
  minHeight,
  ...rest
}: AppInputProps & { rows?: number }) {
  const fieldHeight = multilineHeight(
    rows,
    typeof minHeight === "number" ? minHeight : undefined,
  );

  return (
    <AppInput
      multiline
      numberOfLines={rows}
      textAlignVertical="top"
      height={fieldHeight}
      minHeight={fieldHeight}
      {...rest}
    />
  );
}
