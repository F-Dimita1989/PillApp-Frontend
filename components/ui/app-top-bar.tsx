import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { XStack, YStack } from "tamagui";

import { AppText } from "@/components/ui/app-text";
import { pillappColors } from "@/theme/tokens";

type AppTopBarProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  onBack?: () => void;
  trailing?: ReactNode;
  /** Variante hero per schermate principali (es. Home) */
  variant?: "default" | "hero";
};

export function AppTopBar({
  title,
  subtitle,
  eyebrow,
  onBack,
  trailing,
  variant = "default",
}: AppTopBarProps) {
  if (variant === "hero") {
    return (
      <YStack width="100%" gap="$1" paddingBottom="$2">
        {eyebrow ? (
          <AppText variant="overline" color="primary">
            {eyebrow}
          </AppText>
        ) : null}
        <XStack width="100%" alignItems="flex-start" justifyContent="space-between" gap="$3">
          <YStack flex={1} gap="$1" minWidth={0}>
            <AppText variant="headline">{title}</AppText>
            {subtitle ? (
              <AppText variant="body" muted>
                {subtitle}
              </AppText>
            ) : null}
          </YStack>
          {trailing}
        </XStack>
      </YStack>
    );
  }

  return (
    <YStack width="100%" gap="$2" paddingBottom="$2">
      <XStack width="100%" alignItems="center" gap="$2" minHeight={44}>
        {onBack ? (
          <XStack
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Indietro"
            accessibilityHint="Torna alla schermata precedente"
            width={44}
            height={44}
            alignItems="center"
            justifyContent="center"
            marginLeft={-8}
            borderRadius="$2"
            pressStyle={{ opacity: 0.7, backgroundColor: "$surfaceMuted" }}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={pillappColors.textPrimary}
            />
          </XStack>
        ) : null}
        <YStack flex={1} gap="$1" minWidth={0}>
          {eyebrow ? (
            <AppText variant="overline" color="primary">
              {eyebrow}
            </AppText>
          ) : null}
          <AppText variant="title">{title}</AppText>
        </YStack>
        {trailing}
      </XStack>
      {subtitle ? (
        <AppText variant="body" muted paddingLeft={onBack ? 36 : 0}>
          {subtitle}
        </AppText>
      ) : null}
    </YStack>
  );
}

/** @deprecated Usa AppTopBar */
export const AppHeader = AppTopBar;
