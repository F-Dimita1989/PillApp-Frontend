import type { ViewStyle } from "react-native";

import { TOUR_TOOLTIP_BOTTOM_RESERVE } from "@/lib/coachmark/scroll-anchor-into-view";
import { pillappLayout, pillappSpace } from "@/theme/tokens";

export const setupScrollBase: ViewStyle = {
  flexGrow: 1,
  paddingHorizontal: pillappLayout.screenPaddingX,
  paddingVertical: pillappSpace[6],
  gap: pillappSpace[4],
};

export const setupScrollShort: ViewStyle = {
  ...setupScrollBase,
  justifyContent: "center",
};

export const setupScrollTherapy: ViewStyle = {
  ...setupScrollBase,
  justifyContent: "flex-start",
  paddingBottom: pillappSpace[9] + pillappSpace[6],
};

export function setupScrollTourFraming(): ViewStyle {
  return {
    ...setupScrollTherapy,
    paddingBottom: pillappSpace[9] * 2 + pillappSpace[6],
  };
}

export function setupScrollTourResult(): ViewStyle {
  return {
    ...setupScrollTherapy,
    paddingBottom: TOUR_TOOLTIP_BOTTOM_RESERVE + pillappSpace[9],
  };
}
