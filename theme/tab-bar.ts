import { Platform } from "react-native";

import { pillappColors, pillappSize } from "@/theme/tokens";

/** Stili condivisi per Expo Router Tabs — healthcare premium */
export const tabBarTheme = {
  activeTintColor: pillappColors.primary,
  inactiveTintColor: pillappColors.textMuted,
  backgroundColor: pillappColors.surface,
  borderTopColor: pillappColors.border,
  borderTopWidth: 1,
  height: pillappSize.tabBarHeight,
  paddingTop: 8,
  elevation: 0,
  shadowOpacity: 0,
  labelStyle: {
    fontSize: 11,
    fontWeight: "600" as const,
    fontFamily: Platform.OS === "ios" ? "InterSemiBold" : "InterSemiBold",
    marginTop: 2,
    letterSpacing: 0.2,
  },
} as const;
