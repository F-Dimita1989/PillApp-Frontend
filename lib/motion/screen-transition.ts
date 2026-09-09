import { Easing } from "react-native-reanimated";

/** Transizioni schermata: slide corto + fade, stesso easing in tutta l'app. */
export const SCREEN_SWIPE_MS = 320;
export const STEP_SWIPE_MS = 280;
export const SCREEN_FADE_MS = 280;

export const screenEase = Easing.bezier(0.22, 1, 0.36, 1);

export const screenSwipeTiming = {
  duration: SCREEN_SWIPE_MS,
  easing: screenEase,
};

export const stepSwipeTiming = {
  duration: STEP_SWIPE_MS,
  easing: screenEase,
};

export const screenFadeTiming = {
  duration: SCREEN_FADE_MS,
  easing: screenEase,
};

export const nativeStackSlideAnimation = "slide_from_right" as const;
export const nativeStackFadeAnimation = "fade" as const;

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

/** Opacità accoppiata allo slide: la schermata sfuma mentre esce. */
export function swipeLayerOpacity(translateX: number, width: number): number {
  "worklet";
  if (width <= 0) {
    return 1;
  }
  return 1 - Math.min(1, Math.abs(translateX) / width);
}
