import { Switch, type SwitchProps } from "react-native";
import { XStack, YStack, type XStackProps } from "tamagui";

import { AppText } from "@/components/ui/app-text";
import { useCardSurface } from "@/components/ui/card-surface";
import { useAccessibility } from "@/lib/accessibility/context";
import { playAppHaptic } from "@/lib/accessibility/haptics";
import { speakAppText } from "@/lib/accessibility/speech";
import { pillappColors } from "@/theme/tokens";

type AppSwitchProps = SwitchProps & {
  label?: string;
  description?: string;
  containerProps?: XStackProps;
};

export function AppSwitch({
  label,
  description,
  containerProps,
  value,
  onValueChange,
  ...rest
}: AppSwitchProps) {
  const onBrand = useCardSurface() === "brand";
  const { easyTap, hapticsEnabled, speechEnabled } = useAccessibility();
  const switchControl = (
    <Switch
      value={value}
      onValueChange={(next) => {
        void playAppHaptic(hapticsEnabled, next ? "success" : "light");
        const name = String(rest.accessibilityLabel ?? label ?? "").trim();
        if (speechEnabled && name) {
          speakAppText(`${name} ${next ? "attivata" : "disattivata"}`);
        }
        onValueChange?.(next);
      }}
      style={easyTap ? { transform: [{ scaleX: 1.28 }, { scaleY: 1.28 }] } : undefined}
      trackColor={{
        false: onBrand ? "rgba(255,255,255,0.35)" : pillappColors.border,
        true: onBrand ? "rgba(255,255,255,0.55)" : pillappColors.secondary,
      }}
      thumbColor={value ? pillappColors.surface : pillappColors.surfaceMuted}
      ios_backgroundColor={onBrand ? "rgba(255,255,255,0.35)" : pillappColors.border}
      {...rest}
    />
  );

  if (!label && !description) {
    return switchControl;
  }

  return (
    <XStack
      width="100%"
      alignItems="center"
      justifyContent="space-between"
      gap="$3"
      {...containerProps}
    >
      <YStack flex={1} gap="$1">
        {label ? <AppText variant="label">{label}</AppText> : null}
        {description ? (
          <AppText variant="caption" muted>
            {description}
          </AppText>
        ) : null}
      </YStack>
      {switchControl}
    </XStack>
  );
}
