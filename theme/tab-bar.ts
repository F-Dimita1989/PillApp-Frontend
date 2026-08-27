import { Platform } from "react-native";

import { pillappColors } from "@/theme/tokens";

/**
 * Area icone+label (senza inset di sistema).
 * 56px era troppo basso su Android (includeFontPadding, font di sistema, 3 tasti).
 */
export const tabBarTheme = {
  activeTintColor: pillappColors.onPrimary,
  inactiveTintColor: "rgba(255,255,255,0.62)",
  backgroundColor: "transparent",
  borderTopColor: "transparent",
  borderTopWidth: 0,
  contentHeight: 64,
  comfortableContentHeight: 72,
  paddingTop: 4,
  elevation: 0,
  shadowOpacity: 0,
  iconSize: 22,
  labelStyle: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700" as const,
    fontFamily: Platform.OS === "ios" ? "InterSemiBold" : "InterSemiBold",
    marginTop: 2,
    marginBottom: 0,
    letterSpacing: 0.2,
    includeFontPadding: false,
  },
} as const;
