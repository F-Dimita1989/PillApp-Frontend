import { PillAppColors } from "@/constants/colors";
import { PillAppMaterialTheme } from "@/constants/theme";
import { radii, spacing } from "@/constants/spacing";
import { pillappColors } from "@/theme/tokens";

/** Tema spotlight per il tour AIC — sfondo scuro + buco luminoso sull'anchor attivo. */
export const pillappCoachmarkTheme = {
  backdropColor: pillappColors.shadow,
  backdropOpacity: 0.72,
  holeShadowOpacity: 0.45,
  tooltip: {
    maxWidth: 360,
    radius: radii.md,
    bg: PillAppColors.surface,
    fg: PillAppColors.onSurface,
    arrowSize: 8,
    padding: spacing.md,
    buttonPrimaryBg: PillAppMaterialTheme.colors.primary,
    buttonSecondaryBg: PillAppColors.onSurfaceVariant,
  },
  motion: {
    durationMs: 320,
    easing: (t: number) => 1 - Math.pow(1 - t, 3),
  },
} as const;

/** Colore e spessore dell'alone attorno all'elemento evidenziato nel tour. */
export const pillappCoachmarkSpotlight = {
  ringColor: pillappColors.primary,
  ringWidth: 3,
  ringPadding: 4,
  ringShadowColor: pillappColors.primary,
  ringShadowOpacity: 0.55,
  ringShadowRadius: 14,
} as const;
