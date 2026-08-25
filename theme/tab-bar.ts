import { Platform } from "react-native";

import { pillappColors, pillappSize } from "@/theme/tokens";

/** Stili condivisi per Expo Router Tabs — stesso gradiente brand delle card. */
export const tabBarTheme = {
  activeTintColor: pillappColors.onPrimary,
  inactiveTintColor: "rgba(255,255,255,0.62)",
  backgroundColor: "transparent",
  borderTopColor: "transparent",
  borderTopWidth: 0,
  height: pillappSize.tabBarHeight,
  paddingTop: 8,
  elevation: 0,
  shadowOpacity: 0,
  labelStyle: {
    fontSize: 11,
    fontWeight: "700" as const,
    fontFamily: Platform.OS === "ios" ? "InterSemiBold" : "InterSemiBold",
    marginTop: 2,
    letterSpacing: 0.2,
  },
} as const;
