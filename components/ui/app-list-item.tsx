import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable } from "react-native";
import { XStack, YStack, type XStackProps } from "tamagui";

import { AppText } from "@/components/ui/app-text";
import { BrandIconBadge } from "@/components/ui/brand-icon-badge";
import { useAccessibility } from "@/lib/accessibility/context";
import { playAppHaptic } from "@/lib/accessibility/haptics";

type AppListItemProps = XStackProps & {
  title: string;
  description?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  trailing?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: { selected?: boolean; disabled?: boolean };
};

export function AppListItem({
  title,
  description,
  icon,
  trailing,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  ...rest
}: AppListItemProps) {
  const { easyTap, hapticsEnabled } = useAccessibility();
  const content = (
    <XStack
      width="100%"
      alignItems="center"
      gap="$3"
      paddingVertical={easyTap ? "$4" : "$3"}
      minHeight={easyTap ? 64 : undefined}
      {...rest}
    >
      {icon ? (
        <BrandIconBadge name={icon} size={40} iconSize={20} radius={12} />
      ) : null}
      <YStack flex={1} gap="$1">
        <AppText variant="bodyStrong">{title}</AppText>
        {description ? (
          <AppText variant="caption" muted>
            {description}
          </AppText>
        ) : null}
      </YStack>
      {trailing}
    </XStack>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      onPress={() => {
        void playAppHaptic(hapticsEnabled);
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={accessibilityState}
    >
      {content}
    </Pressable>
  );
}
