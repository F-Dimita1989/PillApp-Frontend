import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { XStack, type XStackProps } from "tamagui";

import { tourProgressTiming } from "@/lib/motion/tour-transition";
import { pillappBrandGradient } from "@/theme/tokens";

type AppProgressProps = Omit<XStackProps, "borderRadius"> & {
  progress: number;
  borderRadius?: number;
};

export function AppProgress({
  progress,
  height = 4,
  borderRadius = 2,
  backgroundColor = "$surfaceMuted",
  ...rest
}: AppProgressProps) {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const widthPct = useSharedValue(clamped * 100);

  useEffect(() => {
    widthPct.value = withTiming(clamped * 100, tourProgressTiming);
  }, [clamped, widthPct]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${widthPct.value}%`,
  }));

  return (
    <XStack
      width="100%"
      height={height}
      backgroundColor={backgroundColor}
      borderRadius={borderRadius}
      overflow="hidden"
      {...rest}
    >
      <Animated.View style={[styles.fill, { borderRadius }, fillStyle]}>
        <LinearGradient
          colors={[...pillappBrandGradient.colors]}
          locations={[...pillappBrandGradient.locations]}
          start={pillappBrandGradient.start}
          end={pillappBrandGradient.end}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </XStack>
  );
}

const styles = StyleSheet.create({
  fill: {
    height: "100%",
    overflow: "hidden",
  },
});
