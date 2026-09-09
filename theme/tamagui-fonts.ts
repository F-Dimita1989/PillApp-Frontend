/** Font Inter — allineati a createInterFont in tamagui.config.ts */
export const healthcareFontAssets = {
  Inter: require("@tamagui/font-inter/otf/Inter-Regular.otf"),
  InterMedium: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
  InterSemiBold: require("@tamagui/font-inter/otf/Inter-SemiBold.otf"),
  InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
} as const;

/** Nomi PostScript/RN delle face Inter caricate in AppThemeProvider. */
export const pillappFontFamily = {
  regular: "Inter",
  medium: "InterMedium",
  semiBold: "InterSemiBold",
  bold: "InterBold",
} as const;
