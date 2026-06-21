import type { RefObject } from "react";
import { Dimensions, type ScrollView, type View } from "react-native";

import { spacing } from "@/constants/spacing";

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
  bottomReserve = 280,
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
      let delta = 0;

      if (elemY + elemH > visibleBottom) {
        delta = elemY + elemH - visibleBottom + spacing.sm;
      } else if (elemY < visibleTop) {
        delta = elemY - visibleTop - spacing.sm;
      }

      if (delta !== 0) {
        scroll.scrollTo({
          y: Math.max(0, getScrollY() + delta),
          animated: true,
        });
        setTimeout(resolve, 420);
        return;
      }

      resolve();
    });
  });
}
