import type { RefObject } from "react";
import { Dimensions, type ScrollView, type View } from "react-native";

import { spacing } from "@/constants/spacing";

/** Spazio riservato in basso per il pannello guida del tour. */
export const TOUR_TOOLTIP_BOTTOM_RESERVE = 340;

type SafeInsets = {
  top: number;
  bottom: number;
};

/** Porta un anchor dello ScrollView sopra il pannello guida in basso. */
export function ensureVisibleInScroll(
  scrollRef: RefObject<ScrollView | null>,
  elementRef: RefObject<View | null>,
  getScrollY: () => number,
  insets: SafeInsets,
  bottomReserve = TOUR_TOOLTIP_BOTTOM_RESERVE,
): Promise<void> {
  return new Promise((resolve) => {
    const element = elementRef.current;
    const scroll = scrollRef.current;
    if (!element || !scroll) {
      resolve();
      return;
    }

    element.measureInWindow((_x, elemY, _w, elemH) => {
      const windowH = Dimensions.get("window").height;
      const visibleTop = insets.top + spacing.md;
      const visibleBottom = windowH - insets.bottom - bottomReserve;
      const availableHeight = visibleBottom - visibleTop;
      const currentScrollY = getScrollY();
      let targetScrollY = currentScrollY;

      if (elemH > availableHeight) {
        targetScrollY = currentScrollY + elemY - visibleTop - spacing.sm;
      } else if (elemY + elemH > visibleBottom) {
        targetScrollY =
          currentScrollY + elemY + elemH - visibleBottom + spacing.sm;
      } else if (elemY < visibleTop) {
        targetScrollY = currentScrollY + elemY - visibleTop - spacing.sm;
      }

      if (targetScrollY !== currentScrollY) {
        scroll.scrollTo({
          y: Math.max(0, targetScrollY),
          animated: true,
        });
        setTimeout(resolve, 450);
        return;
      }

      resolve();
    });
  });
}
