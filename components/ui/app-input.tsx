import { Platform } from "react-native";
import { Input, Label, YStack, type InputProps } from "tamagui";

const SINGLE_LINE_HEIGHT = 52;

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
  const isDisabled = disabled ?? editable === false;
  const isMultiline = Boolean(multiline);
  const rows = typeof numberOfLines === "number" ? numberOfLines : 4;
  const fieldHeight = isMultiline
    ? typeof height === "number"
      ? height
      : multilineHeight(rows, typeof minHeight === "number" ? minHeight : undefined)
    : typeof height === "number"
      ? height
      : SINGLE_LINE_HEIGHT;

  return (
    <YStack width="100%" gap="$2" flexShrink={0} alignSelf="stretch">
      {label ? (
        <Label
          color="$textPrimary"
          fontSize={14}
          fontWeight="600"
          lineHeight={20}
        >
          {label}
        </Label>
      ) : null}
      <Input
        width="100%"
        alignSelf="stretch"
        flexShrink={0}
        multiline={isMultiline}
        numberOfLines={isMultiline ? rows : 1}
        backgroundColor="$surface"
        borderColor={error ? "$error" : "$border"}
        borderWidth={1.5}
        borderRadius="$3"
        color="$textPrimary"
        fontSize={16}
        lineHeight={22}
        height={fieldHeight}
        minHeight={fieldHeight}
        maxHeight={isMultiline ? undefined : fieldHeight}
        paddingHorizontal="$4"
        paddingTop={isMultiline ? 12 : Platform.OS === "android" ? 14 : 12}
        paddingBottom={isMultiline ? 12 : Platform.OS === "android" ? 14 : 12}
        textAlignVertical={textAlignVertical ?? (isMultiline ? "top" : "center")}
        placeholderTextColor="$textMuted"
        disabled={isDisabled}
        opacity={isDisabled ? 0.55 : 1}
        focusStyle={{
          borderColor: "$primary",
          borderWidth: 2,
        }}
        {...rest}
      />
      {error ? (
        <Label color="$error" fontSize={13} lineHeight={18}>
          {error}
        </Label>
      ) : hint ? (
        <Label color="$textSecondary" fontSize={13} lineHeight={18}>
          {hint}
        </Label>
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

export function AppTextField(props: AppInputProps) {
  return <AppInput {...props} />;
}
