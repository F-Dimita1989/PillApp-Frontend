import { Easing } from "react-native-reanimated";

/** Motion della guida AIC: overlay, tooltip, spotlight e intro. */
export const TOUR_HOLE_MS = 400;
export const TOUR_OVERLAY_MS = 320;
export const TOUR_TOOLTIP_MS = 300;
export const TOUR_INTRO_MS = 320;
export const TOUR_PROGRESS_MS = 360;
export const TOUR_EXIT_MS = 200;

export const tourEase = Easing.bezier(0.22, 1, 0.36, 1);

export const tourOverlayTiming = {
  duration: TOUR_OVERLAY_MS,
  easing: tourEase,
};

export const tourTooltipTiming = {
  duration: TOUR_TOOLTIP_MS,
  easing: tourEase,
};

export const tourIntroTiming = {
  duration: TOUR_INTRO_MS,
  easing: tourEase,
};

export const tourProgressTiming = {
  duration: TOUR_PROGRESS_MS,
  easing: tourEase,
};

export const tourExitTiming = {
  duration: TOUR_EXIT_MS,
  easing: tourEase,
};
