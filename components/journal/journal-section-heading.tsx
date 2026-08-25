import type { ComponentProps } from "react";
import { XStack, YStack } from "tamagui";

import { AppText } from "@/components/ui";
import { BrandIconBadge } from "@/components/ui/brand-icon-badge";

type IconName = ComponentProps<
  typeof import("@expo/vector-icons").MaterialCommunityIcons
>["name"];

export function JournalSectionHeading({
  icon,
  title,
  description,
}: {
  icon: IconName;
  title: string;
  description?: string;
}) {
  return (
    <XStack alignItems="flex-start" gap="$3" width="100%">
      <BrandIconBadge name={icon} size={40} iconSize={20} />
      <YStack flex={1} gap="$1" minWidth={0}>
        <AppText variant="overline" color="secondary">
          {title}
        </AppText>
        {description ? (
          <AppText variant="caption" muted>
            {description}
          </AppText>
        ) : null}
      </YStack>
    </XStack>
  );
}
