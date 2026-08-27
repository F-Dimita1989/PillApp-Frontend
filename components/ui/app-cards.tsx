import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { XStack, YStack } from "tamagui";

import { AppButton } from "@/components/ui/app-button";
import { AppCard, AppCardContent } from "@/components/ui/app-card";
import { BrandIconBadge } from "@/components/ui/brand-icon-badge";
import { AppText } from "@/components/ui/app-text";
import { pillappBrandGradient, pillappColors } from "@/theme/tokens";
import { useAccessibility } from "@/lib/accessibility/context";
import { speakAppText } from "@/lib/accessibility/speech";

type MedicationCardProps = {
  name: string;
  dose: string;
  formLabel: string;
  nextTime?: string;
  aic?: string;
  onPress?: () => void;
};

export function MedicationCard({
  name,
  dose,
  formLabel,
  nextTime,
  aic,
  onPress,
}: MedicationCardProps) {
  const { reduceMotion, speechEnabled } = useAccessibility();
  const content = (
    <AppCard variant="elevated">
      <AppCardContent>
        <XStack width="100%" alignItems="center" gap="$3">
          <BrandIconBadge name="pill" size={48} iconSize={24} radius={16} />
          <YStack flex={1} gap="$1.5" minWidth={0}>
            <AppText variant="bodyStrong" numberOfLines={2}>
              {name}
            </AppText>
            <AppText variant="body" muted>
              {dose} · {formLabel}
            </AppText>
            {nextTime ? (
              <AppText variant="overline" color="secondary">
                Prossima dose · {nextTime}
              </AppText>
            ) : null}
            {aic ? (
              <AppText variant="caption" muted>
                AIC {aic}
              </AppText>
            ) : null}
          </YStack>
          {onPress ? (
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={pillappColors.textMuted}
            />
          ) : null}
        </XStack>
      </AppCardContent>
    </AppCard>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      onPress={() => {
        if (speechEnabled) {
          speakAppText(
            [name, dose, formLabel, nextTime ? `Prossima dose ${nextTime}` : ""]
              .filter(Boolean)
              .join(". "),
          );
        }
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={`Dettagli farmaco ${name}`}
      style={({ pressed }) => [
        { width: "100%", opacity: reduceMotion ? 1 : pressed ? 0.92 : 1 },
      ]}
    >
      {content}
    </Pressable>
  );
}

type MeasurementCardProps = {
  label: string;
  value: string;
  unit: string;
  hint?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
};

export function MeasurementCard({
  label,
  value,
  unit,
  hint,
  icon,
}: MeasurementCardProps) {
  return (
    <AppCard flexGrow={1} flexBasis="45%" minWidth={140}>
      <AppCardContent>
        <XStack alignItems="center" gap="$2">
          {icon ? (
            <BrandIconBadge name={icon} size={28} iconSize={16} />
          ) : null}
          <AppText variant="overline" color="secondary">
            {label}
          </AppText>
        </XStack>
        <XStack alignItems="baseline" gap="$1" flexWrap="wrap">
          <AppText variant="title">{value}</AppText>
          <AppText variant="body" muted>
            {unit}
          </AppText>
        </XStack>
        {hint ? (
          <AppText variant="caption" muted>
            {hint}
          </AppText>
        ) : null}
      </AppCardContent>
    </AppCard>
  );
}

type QuickActionButtonProps = {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
  accessibilityHint: string;
  highlight?: boolean;
};

export function QuickActionButton({
  label,
  icon,
  onPress,
  accessibilityHint,
  highlight = false,
}: QuickActionButtonProps) {
  return (
    <AppButton
      variant={highlight ? "primary" : "ghost"}
      icon={icon}
      fullWidth
      onPress={onPress}
      accessibilityHint={accessibilityHint}
    >
      {label}
    </AppButton>
  );
}

type BottomActionBarProps = {
  primaryLabel: string;
  onPrimaryPress: () => void;
  primaryIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
};

export function BottomActionBar({
  primaryLabel,
  onPrimaryPress,
  primaryIcon,
  secondaryLabel,
  onSecondaryPress,
}: BottomActionBarProps) {
  return (
    <YStack
      width="100%"
      borderTopWidth={0}
      backgroundColor="$surface"
      flexShrink={0}
      overflow="hidden"
    >
      <LinearGradient
        colors={[...pillappBrandGradient.colors]}
        locations={[...pillappBrandGradient.locations]}
        start={pillappBrandGradient.start}
        end={pillappBrandGradient.end}
        style={{ height: 4, width: "100%" }}
      />
      <YStack width="100%" gap="$2" padding="$4">
        <AppButton
          variant="primary"
          fullWidth
          icon={primaryIcon}
          onPress={onPrimaryPress}
        >
          {primaryLabel}
        </AppButton>
        {secondaryLabel && onSecondaryPress ? (
          <AppButton variant="ghost" fullWidth onPress={onSecondaryPress}>
            {secondaryLabel}
          </AppButton>
        ) : null}
      </YStack>
    </YStack>
  );
}
