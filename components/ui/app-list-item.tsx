import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable } from "react-native";
import { XStack, YStack, type XStackProps } from "tamagui";

import { AppText } from "@/components/ui/app-text";
import { pillappColors } from "@/theme/tokens";

type AppListItemProps = XStackProps & {
  title: string;
  description?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  trailing?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

export function AppListItem({
  title,
  description,
  icon,
  trailing,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  ...rest
}: AppListItemProps) {
  const content = (
    <XStack
      width="100%"
      alignItems="center"
      gap="$3"
      paddingVertical="$3"
      {...rest}
    >
      {icon ? (
        <MaterialCommunityIcons
          name={icon}
          size={24}
          color={pillappColors.primary}
        />
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
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
    >
      {content}
    </Pressable>
  );
}
