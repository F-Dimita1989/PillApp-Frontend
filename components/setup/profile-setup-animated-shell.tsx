import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  stepSwipeTiming,
  swipeEnterX,
  swipeLayerOpacity,
} from "@/lib/motion/screen-transition";

export type ProfileSetupTransitionDirection = "forward" | "back";

type ProfileSetupAnimatedShellProps = {
  stepKey: string;
  direction: ProfileSetupTransitionDirection;
  children: ReactNode;
};

export function ProfileSetupAnimatedShell({
  stepKey,
  direction,
  children,
}: ProfileSetupAnimatedShellProps) {
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.max(windowWidth, 1);
  const previousStepKey = useRef(stepKey);
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (previousStepKey.current === stepKey) {
      return;
    }

    previousStepKey.current = stepKey;
    translateX.value = swipeEnterX(width, direction);
    translateX.value = withTiming(0, stepSwipeTiming);
  }, [direction, stepKey, translateX, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: swipeLayerOpacity(translateX.value, width),
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.host}>
      <Animated.View style={[styles.shell, animatedStyle]}>{children}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
    width: "100%",
    overflow: "hidden",
  },
  shell: {
    flex: 1,
    width: "100%",
  },
});
