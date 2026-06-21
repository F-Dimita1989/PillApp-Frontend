import { Pressable, Platform } from "react-native";
import { XStack, type XStackProps } from "tamagui";

import { AppText } from "@/components/ui/app-text";

export type SegmentedOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type AppSegmentedControlProps = XStackProps & {
  value: string;
  options: SegmentedOption[];
  onValueChange: (value: string) => void;
};

export function AppSegmentedControl({
  value,
  options,
  onValueChange,
  ...rest
}: AppSegmentedControlProps) {
  return (
    <XStack
      width="100%"
      flexWrap="wrap"
      gap="$1"
      backgroundColor="$surfaceMuted"
      borderRadius="$3"
      borderWidth={1}
      borderColor="$border"
      padding="$1"
      {...rest}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            disabled={option.disabled}
            onPress={() => onValueChange(option.value)}
            style={{ flex: 1, minWidth: 72 }}
            accessibilityRole="button"
            accessibilityState={{ selected, disabled: option.disabled }}
            accessibilityLabel={option.label}
          >
            <XStack
              alignItems="center"
              justifyContent="center"
              height={44}
              paddingHorizontal="$2"
              borderRadius="$2"
              backgroundColor={selected ? "$primary" : "transparent"}
              opacity={option.disabled ? 0.45 : 1}
            >
              <AppText
                variant="label"
                color={selected ? "inverse" : undefined}
                muted={!selected}
                flexShrink={0}
                textAlign="center"
                style={
                  Platform.OS === "android"
                    ? { includeFontPadding: false }
                    : undefined
                }
              >
                {option.label}
              </AppText>
            </XStack>
          </Pressable>
        );
      })}
    </XStack>
  );
}
