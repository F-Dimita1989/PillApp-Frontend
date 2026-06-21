import type { ReactNode } from "react";
import { XStack, YStack } from "tamagui";

import { AppText } from "@/components/ui/app-text";

type SectionHeaderProps = {
  title: string;
  description?: string;
  /** @deprecated Usa description */
  subtitle?: string;
  action?: ReactNode;
};

export function SectionHeader({ title, description, subtitle, action }: SectionHeaderProps) {
  const resolvedDescription = description ?? subtitle;

  return (
    <XStack
      width="100%"
      alignItems="flex-start"
      justifyContent="space-between"
      gap="$3"
      paddingBottom="$1"
    >
      <YStack flex={1} gap="$2" minWidth={0}>
        <AppText variant="title">{title}</AppText>
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

export const SectionTitle = SectionHeader;
