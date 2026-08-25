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
    bg: pillappColors.surface,
    fg: pillappColors.textPrimary,
    arrowSize: 8,
    padding: spacing.md,
    buttonPrimaryBg: pillappColors.primary,
    buttonSecondaryBg: pillappColors.textSecondary,
  },
  motion: {
    durationMs: 400,
    easing: (t: number) => 1 - Math.pow(1 - t, 3),
  },
} as const;

/** Alone brand attorno all'elemento evidenziato. */
export const pillappCoachmarkSpotlight = {
  ringColor: pillappColors.secondary,
  ringWidth: 3,
  ringPadding: 4,
  ringShadowColor: pillappColors.primary,
  ringShadowOpacity: 0.45,
  ringShadowRadius: 14,
} as const;
