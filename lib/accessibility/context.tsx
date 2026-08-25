import { createContext, useContext, type ReactNode } from "react";

import {
  DEFAULT_ACCESSIBILITY_PREFS,
  type AccessibilityPrefs,
} from "@/lib/accessibility/prefs";

const AccessibilityContext = createContext<AccessibilityPrefs>(
  DEFAULT_ACCESSIBILITY_PREFS,
);

export function AccessibilityProvider({
  value,
  children,
}: {
  value: AccessibilityPrefs;
  children: ReactNode;
}) {
  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityPrefs {
  return useContext(AccessibilityContext);
}
