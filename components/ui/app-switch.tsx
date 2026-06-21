import { Switch, type SwitchProps } from "react-native";
import { XStack, YStack, type XStackProps } from "tamagui";

import { AppText } from "@/components/ui/app-text";
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
  const switchControl = (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{
        false: pillappColors.border,
        true: pillappColors.primarySoft,
      }}
      thumbColor={value ? pillappColors.primary : pillappColors.surface}
      ios_backgroundColor={pillappColors.border}
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
