import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { XStack, YStack } from "tamagui";

import { AppCard } from "@/components/ui/app-card";
import { AppText } from "@/components/ui/app-text";
import { pillappColors } from "@/theme/tokens";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export function BrandIntroCard({
  icon,
  title,
  description,
  children,
}: {
  icon: IconName;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <AppCard variant="brand">
      <XStack alignItems="center" gap="$3">
        <YStack
          width={48}
          height={48}
          borderRadius={24}
          alignItems="center"
          justifyContent="center"
          backgroundColor="rgba(255,255,255,0.22)"
          flexShrink={0}
        >
          <MaterialCommunityIcons
            name={icon}
            size={24}
            color={pillappColors.onPrimary}
          />
        </YStack>
        <YStack flex={1} gap="$1" minWidth={0}>
          <AppText variant="title">{title}</AppText>
          <AppText variant="caption" muted>
            {description}
          </AppText>
        </YStack>
      </XStack>
      {children}
    </AppCard>
  );
}
