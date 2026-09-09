import type { ReactNode } from "react";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { screenFadeTiming } from "@/lib/motion/screen-transition";

type ScreenFadeInProps = {
  children: ReactNode;
  disabled?: boolean;
};

/** Ingresso morbido quando si monta un albero di schermate (es. home dopo il setup). */
export function ScreenFadeIn({ children, disabled = false }: ScreenFadeInProps) {
  const opacity = useSharedValue(disabled ? 1 : 0);

  useEffect(() => {
    opacity.value = disabled ? 1 : withTiming(1, screenFadeTiming);
  }, [disabled, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (disabled) {
    return children;
  }

  return (
    <Animated.View style={[styles.host, style]}>{children}</Animated.View>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
});
