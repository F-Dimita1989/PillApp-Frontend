import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet } from "react-native";
import { XStack, type XStackProps } from "tamagui";

import { AppText } from "@/components/ui/app-text";
import { useCardSurface } from "@/components/ui/card-surface";
import { pillappBrandGradient, pillappRadius } from "@/theme/tokens";

export type SegmentedOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type AppSegmentedControlProps = XStackProps & {
  value: string;
  options: SegmentedOption[];
  onValueChange: (value: string) => void;
};

export function AppSegmentedControl({
  value,
  options,
  onValueChange,
  ...rest
}: AppSegmentedControlProps) {
  const onBrand = useCardSurface() === "brand";

  return (
    <XStack
      width="100%"
      alignItems="center"
      overflow="hidden"
      backgroundColor={onBrand ? "rgba(255,255,255,0.12)" : "$surfaceMuted"}
      borderRadius="$pill"
      borderWidth={1}
      borderColor={onBrand ? "rgba(255,255,255,0.4)" : "$border"}
      padding={4}
      {...rest}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            disabled={option.disabled}
            onPress={() => onValueChange(option.value)}
            style={styles.segment}
            accessibilityRole="button"
            accessibilityState={{ selected, disabled: option.disabled }}
            accessibilityLabel={option.label}
          >
            {selected && !onBrand ? (
              <LinearGradient
                colors={[...pillappBrandGradient.colors]}
                locations={[...pillappBrandGradient.locations]}
                start={pillappBrandGradient.start}
                end={pillappBrandGradient.end}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            <XStack
              width="100%"
              height={40}
              alignItems="center"
              justifyContent="center"
              borderRadius="$pill"
              backgroundColor={
                selected && onBrand ? "rgba(255,255,255,0.94)" : "transparent"
              }
              opacity={option.disabled ? 0.45 : 1}
            >
              <AppText
                variant="label"
                color={
                  selected
                    ? onBrand
                      ? "primary"
                      : "inverse"
                    : onBrand
                      ? "inverse"
                      : undefined
                }
                muted={!selected && !onBrand}
                textAlign="center"
                numberOfLines={1}
              >
                {option.label}
              </AppText>
            </XStack>
          </Pressable>
        );
      })}
    </XStack>
  );
}

const styles = StyleSheet.create({
  segment: {
    flex: 1,
    minWidth: 0,
    borderRadius: pillappRadius.pill,
    overflow: "hidden",
  },
});
