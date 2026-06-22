import { Pressable } from "react-native";
import { YStack, type YStackProps } from "tamagui";

import { AppText } from "@/components/ui/app-text";

type ChoiceCardProps = YStackProps & {
  label: string;
  description?: string;
  selected?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
};

export function ChoiceCard({
  label,
  description,
  selected = false,
  onPress,
  accessibilityLabel,
  ...rest
}: ChoiceCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <YStack
        width="100%"
        alignItems="center"
        gap="$1"
        padding="$4"
        borderRadius="$2"
        borderWidth={selected ? 2 : 1}
        borderColor={selected ? "$primary" : "$border"}
        backgroundColor={selected ? "$primarySoft" : "$surfaceMuted"}
        {...rest}
      >
        <AppText variant="title" color={selected ? "primary" : undefined} textAlign="center">
          {label}
        </AppText>
        {description ? (
          <AppText variant="caption" muted textAlign="center">
            {description}
          </AppText>
        ) : null}
      </YStack>
    </Pressable>
  );
}
