import { Easing } from "react-native-reanimated";

/** Swipe orizzontale semplice tra schermate (intro, accessi, setup). */
export const SCREEN_SWIPE_MS = 320;
export const STEP_SWIPE_MS = 280;

export const screenSwipeTiming = {
  duration: SCREEN_SWIPE_MS,
  easing: Easing.out(Easing.cubic),
};

export const stepSwipeTiming = {
  duration: STEP_SWIPE_MS,
  easing: Easing.out(Easing.cubic),
};

export function swipeEnterX(
  width: number,
  direction: "forward" | "back" = "forward",
): number {
  return direction === "forward" ? width : -width;
}

export function swipeExitX(
  width: number,
  direction: "forward" | "back" = "forward",
): number {
  return direction === "forward" ? -width : width;
}
