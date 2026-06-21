import {
  MD3LightTheme,
  configureFonts,
  type MD3Theme,
} from "react-native-paper";

import { PillAppColors } from "@/constants/colors";
import { radii } from "@/constants/spacing";

const fontConfig = {
  fontFamily: "System",
};

export const PillAppMaterialTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: radii.md,
  colors: {
    ...MD3LightTheme.colors,
    primary: PillAppColors.primary,
    onPrimary: PillAppColors.onPrimary,
    primaryContainer: PillAppColors.primaryContainer,
    onPrimaryContainer: PillAppColors.onPrimaryContainer,

    secondary: PillAppColors.secondary,
    onSecondary: PillAppColors.onSecondary,
    secondaryContainer: PillAppColors.secondaryContainer,
    onSecondaryContainer: PillAppColors.onSecondaryContainer,

    tertiary: PillAppColors.tertiary,
    onTertiary: PillAppColors.onTertiary,
    tertiaryContainer: PillAppColors.tertiaryContainer,
    onTertiaryContainer: PillAppColors.onTertiaryContainer,

    error: PillAppColors.error,
    onError: PillAppColors.onError,
    errorContainer: PillAppColors.errorContainer,
    onErrorContainer: PillAppColors.onErrorContainer,

    background: PillAppColors.background,
    onBackground: PillAppColors.onBackground,

    surface: PillAppColors.surface,
    onSurface: PillAppColors.onSurface,
    surfaceVariant: PillAppColors.surfaceVariant,
    onSurfaceVariant: PillAppColors.onSurfaceVariant,

    outline: PillAppColors.outline,
    outlineVariant: PillAppColors.outlineVariant,

    shadow: PillAppColors.shadow,
    scrim: PillAppColors.scrim,

    inverseSurface: PillAppColors.onBackground,
    inverseOnSurface: PillAppColors.surface,
    inversePrimary: PillAppColors.primaryContainer,

    elevation: {
      level0: "transparent",
      level1: PillAppColors.surface,
      level2: PillAppColors.surfaceVariant,
      level3: PillAppColors.primaryContainer,
      level4: PillAppColors.secondaryContainer,
      level5: PillAppColors.tertiaryContainer,
    },

    surfaceDisabled: "rgba(26, 43, 60, 0.12)",
    onSurfaceDisabled: "rgba(26, 43, 60, 0.38)",
    backdrop: "rgba(26, 43, 60, 0.45)",
  },
  fonts: configureFonts({ config: fontConfig }),
};

/** Stili comuni per bottoni primari/secondari */
export const pillButtonStyles = {
  primary: {
    mode: "contained" as const,
    contentStyle: { minHeight: 52, paddingVertical: 8 },
  },
  secondary: {
    mode: "outlined" as const,
    contentStyle: { minHeight: 48, paddingVertical: 6 },
  },
  tonal: {
    mode: "contained-tonal" as const,
    contentStyle: { minHeight: 48, paddingVertical: 6 },
  },
};
