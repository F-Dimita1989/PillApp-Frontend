import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { XStack, type XStackProps } from "tamagui";

import { AppText } from "@/components/ui/app-text";
import { pillappColors } from "@/theme/tokens";

type AppChipProps = XStackProps & {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress?: () => void;
  onClose?: () => void;
  accessibilityLabel?: string;
};

export function AppChip({
  label,
  selected = false,
  disabled = false,
  icon,
  onPress,
  onClose,
  accessibilityLabel,
  ...rest
}: AppChipProps) {
  const content = (
    <XStack
      alignItems="center"
      justifyContent="center"
      gap="$2"
      minHeight={44}
      backgroundColor={selected ? "$primarySoft" : "$surface"}
      borderColor={selected ? "$primary" : "$border"}
      borderWidth={selected ? 2 : 1}
      borderRadius="$3"
      paddingHorizontal="$3"
      paddingVertical="$2"
      opacity={disabled ? 0.45 : 1}
      {...rest}
    >
      {selected ? (
        <MaterialCommunityIcons name="check" size={16} color={pillappColors.primary} />
      ) : icon ? (
        <MaterialCommunityIcons name={icon} size={16} color={pillappColors.textSecondary} />
      ) : null}
      <AppText
        variant="label"
        color={selected ? "primary" : undefined}
        muted={!selected}
        flexShrink={0}
        textAlign="center"
      >
        {label}
      </AppText>
      {onClose ? (
        <Pressable
          onPress={onClose}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Rimuovi ${label}`}
        >
          <MaterialCommunityIcons name="close-circle" size={18} color={pillappColors.textMuted} />
        </Pressable>
      ) : null}
    </XStack>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
    >
      {content}
    </Pressable>
  );
}
