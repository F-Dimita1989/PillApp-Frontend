import { MaterialCommunityIcons } from "@expo/vector-icons";
import { XStack, YStack } from "tamagui";

import { AppText } from "@/components/ui/app-text";
import { pillappColors } from "@/theme/tokens";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  onBack?: () => void;
};

export function AppHeader({ title, subtitle, eyebrow, onBack }: AppHeaderProps) {
  return (
    <YStack width="100%" gap="$2" paddingBottom="$2">
      <XStack width="100%" alignItems="flex-start" gap="$2">
        {onBack ? (
          <XStack
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Indietro"
            accessibilityHint="Torna alla schermata precedente"
            padding="$1"
            marginTop={2}
            pressStyle={{ opacity: 0.7 }}
          >
            <MaterialCommunityIcons name="arrow-left" size={26} color={pillappColors.textPrimary} />
          </XStack>
        ) : null}
        <YStack flex={1} gap="$2" minWidth={0}>
          {eyebrow ? (
            <AppText variant="label" color="primary">
              {eyebrow}
            </AppText>
          ) : null}
          <AppText variant="headline">{title}</AppText>
        </YStack>
      </XStack>
      {subtitle ? (
        <AppText variant="body" muted>
          {subtitle}
        </AppText>
      ) : null}
    </YStack>
  );
}
