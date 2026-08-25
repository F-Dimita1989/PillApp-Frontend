import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { Input, XStack, type InputProps } from "tamagui";

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

  return (
    <XStack
      width="100%"
      alignItems="center"
      backgroundColor="rgba(255,255,255,0.94)"
      borderWidth={1.5}
      borderColor="rgba(42, 171, 160, 0.35)"
      borderRadius="$3"
      paddingLeft="$4"
      paddingRight="$2"
      height={52}
      gap="$2"
      focusStyle={{
        borderColor: "$secondary",
        borderWidth: 1.5,
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
        fontSize={16}
        lineHeight={22}
        height={50}
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
          pressStyle={{ opacity: 0.6 }}
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
