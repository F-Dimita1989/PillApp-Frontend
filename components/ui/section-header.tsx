import type { ReactNode } from "react";
import { XStack, YStack } from "tamagui";

import { AppText } from "@/components/ui/app-text";
import { useCardSurface } from "@/components/ui/card-surface";

type SectionHeaderProps = {
  title: string;
  description?: string;
  /** @deprecated Usa description */
  subtitle?: string;
  action?: ReactNode;
};

export function SectionHeader({
  title,
  description,
  subtitle,
  action,
}: SectionHeaderProps) {
  const resolvedDescription = description ?? subtitle;
  const onBrand = useCardSurface() === "brand";

  return (
    <XStack
      width="100%"
      alignItems="flex-end"
      justifyContent="space-between"
      gap="$3"
    >
      <YStack flex={1} gap="$1" minWidth={0}>
        <AppText variant="overline" color={onBrand ? "inverse" : "secondary"}>
          {title}
        </AppText>
        {resolvedDescription ? (
          <AppText variant="body" muted>
            {resolvedDescription}
          </AppText>
        ) : null}
      </YStack>
      {action}
    </XStack>
  );
}
