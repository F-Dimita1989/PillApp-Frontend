import { Pressable } from "react-native";
import { YStack } from "tamagui";

import { AppText } from "@/components/ui/app-text";

type ProfileSetupChoiceCardProps = {
  label: string;
  description?: string;
  selected?: boolean;
  onPress: () => void;
};

export function ProfileSetupChoiceCard({
  label,
  description,
  selected = false,
  onPress,
}: ProfileSetupChoiceCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      <YStack
        width="100%"
        alignItems="center"
        gap="$1"
        padding="$4"
        borderRadius="$2"
        borderWidth={selected ? 2 : 1}
        borderColor={selected ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.55)"}
        backgroundColor={selected ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.1)"}
      >
        <AppText variant="title" color="inverse" textAlign="center">
          {label}
        </AppText>
        {description ? (
          <AppText variant="caption" color="inverse" opacity={0.88} textAlign="center">
            {description}
          </AppText>
        ) : null}
      </YStack>
    </Pressable>
  );
}
