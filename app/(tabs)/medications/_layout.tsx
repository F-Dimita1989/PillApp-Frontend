import { Stack } from "expo-router";

import { useAccessibility } from "@/lib/accessibility/context";
import {
  nativeStackSlideAnimation,
  SCREEN_SWIPE_MS,
} from "@/lib/motion/screen-transition";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function MedicationsLayout() {
  const { reduceMotion } = useAccessibility();
  const animation = reduceMotion ? "none" : nativeStackSlideAnimation;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation,
        animationDuration: SCREEN_SWIPE_MS,
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="[id]"
        options={{
          animation,
        }}
      />
    </Stack>
  );
}
