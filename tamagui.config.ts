import { config as defaultConfig } from "@tamagui/config";
import { createInterFont } from "@tamagui/font-inter";
import { createTamagui, createTokens } from "tamagui";

import {
  pillappColors,
  pillappRadius,
  pillappSpace,
} from "./theme/tokens";

/** Scala tipografica healthcare — numeri fissi, niente token astratti nel testo. */
const healthcareFontSizes = {
  1: 13,
  2: 14,
  3: 15,
  4: 16,
  true: 16,
  5: 18,
  6: 20,
  7: 24,
  8: 28,
  9: 32,
} as const;

const healthcareLineHeights = {
  1: 18,
  2: 20,
  3: 22,
  4: 24,
  true: 24,
  5: 26,
  6: 28,
  7: 32,
  8: 36,
  9: 40,
} as const;

const bodyFont = createInterFont(
  {
    size: healthcareFontSizes,
    lineHeight: healthcareLineHeights,
    weight: {
      4: "400",
      5: "500",
      6: "600",
      7: "700",
    },
    face: {
      400: { normal: "Inter" },
      500: { normal: "InterMedium" },
      600: { normal: "InterSemiBold" },
      700: { normal: "InterBold" },
    },
  },
  {
    sizeLineHeight: (size) => Math.round(size * 1.5),
  },
);

const headingFont = createInterFont(
  {
    size: healthcareFontSizes,
    lineHeight: healthcareLineHeights,
    weight: {
      6: "600",
      7: "700",
    },
    face: {
      600: { normal: "InterSemiBold" },
      700: { normal: "InterBold" },
    },
  },
  {
    sizeLineHeight: (size) => Math.round(size * 1.35),
  },
);

const tokens = createTokens({
  color: {
    ...defaultConfig.tokens.color,
    background: pillappColors.background,
    backgroundSoft: pillappColors.backgroundSoft,
    surface: pillappColors.surface,
    surfaceMuted: pillappColors.surfaceMuted,
    primary: pillappColors.primary,
    primarySoft: pillappColors.primarySoft,
    primaryDark: pillappColors.primaryDark,
    secondary: pillappColors.secondary,
    secondarySoft: pillappColors.secondarySoft,
    secondaryDark: pillappColors.secondaryDark,
    success: pillappColors.success,
    successSoft: pillappColors.successSoft,
    successDark: pillappColors.successDark,
    textPrimary: pillappColors.textPrimary,
    textSecondary: pillappColors.textSecondary,
    textMuted: pillappColors.textMuted,
    border: pillappColors.border,
    borderStrong: pillappColors.borderStrong,
    shadow: pillappColors.shadow,
    error: pillappColors.error,
    errorSoft: pillappColors.errorSoft,
    warning: pillappColors.warning,
    warningSoft: pillappColors.warningSoft,
    onPrimary: pillappColors.onPrimary,
    onSecondary: pillappColors.onSecondary,
    textInverse: pillappColors.textInverse,
  },
  space: pillappSpace,
  size: pillappSpace,
  radius: pillappRadius,
  zIndex: defaultConfig.tokens.zIndex,
});

const healthcareLight = {
  ...defaultConfig.themes.light,
  background: pillappColors.background,
  backgroundHover: pillappColors.backgroundSoft,
  backgroundPress: pillappColors.backgroundSoft,
  backgroundFocus: pillappColors.backgroundSoft,
  color: pillappColors.textPrimary,
  colorHover: pillappColors.textPrimary,
  colorPress: pillappColors.textPrimary,
  colorFocus: pillappColors.textPrimary,
  colorTransparent: "transparent",
  borderColor: pillappColors.border,
  borderColorHover: pillappColors.borderStrong,
  borderColorPress: pillappColors.borderStrong,
  borderColorFocus: pillappColors.primary,
  placeholderColor: pillappColors.textMuted,
  shadowColor: pillappColors.shadow,
  shadowColorHover: pillappColors.shadow,
  shadowColorPress: pillappColors.shadow,
  shadowColorFocus: pillappColors.shadow,
};

export const tamaguiConfig = createTamagui({
  ...defaultConfig,
  tokens,
  themes: {
    light: healthcareLight,
    healthcare: healthcareLight,
  },
  fonts: {
    body: bodyFont,
    heading: headingFont,
  },
  defaultFont: "body",
});

export type AppTamaguiConfig = typeof tamaguiConfig;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppTamaguiConfig {}
}

export default tamaguiConfig;
