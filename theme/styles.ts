import { StyleSheet } from "react-native";

import {
  pillappColors,
  pillappLayout,
  pillappRadius,
  pillappSpace,
  pillappTouch,
} from "@/theme/tokens";

export const appStyles = StyleSheet.create({
  screenScroll: {
    flexGrow: 1,
    paddingHorizontal: pillappLayout.screenPaddingX,
    paddingTop: pillappLayout.screenPaddingY,
    paddingBottom: pillappSpace[7],
    gap: pillappLayout.sectionGap,
  },
  screenStatic: {
    flex: 1,
    paddingHorizontal: pillappLayout.screenPaddingX,
    paddingTop: pillappLayout.screenPaddingY,
    gap: pillappLayout.sectionGap,
  },
  section: {
    gap: pillappSpace[3],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: pillappColors.surface,
    borderRadius: pillappRadius[4],
    borderWidth: 1,
    borderColor: pillappColors.border,
    padding: pillappSpace[4],
    gap: pillappSpace[3],
    width: "100%",
  },
  cardElevated: {
    shadowColor: pillappColors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardMuted: {
    backgroundColor: pillappColors.surfaceMuted,
    borderWidth: 0,
  },
  cardOutlined: {
    backgroundColor: pillappColors.surface,
  },
});

export const appTextStyles = StyleSheet.create({
  display: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700",
    color: pillappColors.textPrimary,
  },
  headline: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700",
    color: pillappColors.textPrimary,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "700",
    color: pillappColors.textPrimary,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
    color: pillappColors.textPrimary,
  },
  bodyStrong: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
    color: pillappColors.textPrimary,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: pillappColors.textPrimary,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    color: pillappColors.textSecondary,
  },
  muted: {
    color: pillappColors.textSecondary,
  },
  primary: {
    color: pillappColors.primary,
  },
  secondary: {
    color: pillappColors.secondary,
  },
  inverse: {
    color: pillappColors.textInverse,
  },
});

export { pillappColors, pillappSpace, pillappRadius, pillappTouch, pillappLayout };
