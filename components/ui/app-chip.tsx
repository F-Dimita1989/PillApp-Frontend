import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { XStack, type XStackProps } from "tamagui";

import { AppText } from "@/components/ui/app-text";
import { useCardSurface } from "@/components/ui/card-surface";
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
  const onBrand = useCardSurface() === "brand";
  const content = (
    <XStack
      alignItems="center"
      justifyContent="center"
      gap="$2"
      minHeight={48}
      backgroundColor={
        onBrand
          ? selected
            ? "rgba(255,255,255,0.22)"
            : "rgba(255,255,255,0.1)"
          : selected
            ? "$secondarySoft"
            : "$surface"
      }
      borderColor={
        onBrand
          ? selected
            ? "rgba(255,255,255,1)"
            : "rgba(255,255,255,0.55)"
          : selected
            ? "$secondary"
            : "$border"
      }
      borderWidth={selected ? 2 : 1}
      borderRadius="$pill"
      paddingHorizontal="$3"
      paddingVertical="$2"
      opacity={disabled ? 0.45 : 1}
      {...rest}
    >
      {selected ? (
        <MaterialCommunityIcons
          name="check"
          size={16}
          color={onBrand ? pillappColors.onPrimary : pillappColors.secondary}
        />
      ) : icon ? (
        <MaterialCommunityIcons
          name={icon}
          size={16}
          color={onBrand ? pillappColors.onPrimary : pillappColors.textSecondary}
        />
      ) : null}
      <AppText
        variant="label"
        color={onBrand ? "inverse" : selected ? "secondary" : undefined}
        muted={!onBrand && !selected}
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
