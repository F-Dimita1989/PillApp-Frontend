import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { Input, XStack, type InputProps } from "tamagui";

import { useAccessibility } from "@/lib/accessibility/context";
import { scaleFontSize } from "@/lib/accessibility/prefs";
import { pillappColors } from "@/theme/tokens";

type SearchInputProps = Omit<InputProps, "value" | "onChangeText"> & {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
};

export function SearchInput({
  value,
  onChangeText,
  placeholder = "Cerca farmaco…",
  onClear,
  ...rest
}: SearchInputProps) {
  const showClear = value.length > 0;
  const { easyTap, fontScale, highContrast, largeText, reduceMotion } = useAccessibility();
  const fieldHeight = easyTap ? 60 : 52;
  const inputFont = largeText ? scaleFontSize(16, fontScale) : 16;

  return (
    <XStack
      width="100%"
      alignItems="center"
      backgroundColor="rgba(255,255,255,0.94)"
      borderWidth={highContrast ? 2 : 1.5}
      borderColor={highContrast ? pillappColors.textPrimary : "rgba(42, 171, 160, 0.35)"}
      borderRadius="$3"
      paddingLeft="$4"
      paddingRight="$2"
      height={fieldHeight}
      minHeight={fieldHeight}
      gap="$2"
      focusStyle={{
        borderColor: "$secondary",
        borderWidth: 2,
      }}
    >
      <MaterialCommunityIcons
        name="magnify"
        size={22}
        color={pillappColors.textMuted}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
      <Input
        flex={1}
        unstyled
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="$textMuted"
        color="$textPrimary"
        fontSize={inputFont}
        lineHeight={largeText ? scaleFontSize(22, fontScale) : 22}
        height={fieldHeight - 2}
        paddingVertical={Platform.OS === "android" ? 14 : 12}
        backgroundColor="transparent"
        borderWidth={0}
        accessibilityRole="search"
        accessibilityLabel={placeholder}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        {...rest}
      />
      {showClear ? (
        <XStack
          onPress={() => (onClear ? onClear() : onChangeText(""))}
          accessibilityRole="button"
          accessibilityLabel="Cancella ricerca"
          padding="$2"
          pressStyle={reduceMotion ? undefined : { opacity: 0.6 }}
        >
          <MaterialCommunityIcons
            name="close-circle"
            size={20}
            color={pillappColors.textMuted}
          />
        </XStack>
      ) : null}
    </XStack>
  );
}
