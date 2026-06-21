/**
 * Palette PillApp — allineata a theme/tokens.ts (healthcare calm).
 */
import { pillappColors } from "@/theme/tokens";

export const PillAppColors = {
  primary: pillappColors.primary,
  onPrimary: pillappColors.onPrimary,
  primaryContainer: pillappColors.primarySoft,
  onPrimaryContainer: pillappColors.primaryDark,

  secondary: pillappColors.secondary,
  onSecondary: pillappColors.onSecondary,
  secondaryContainer: pillappColors.secondarySoft,
  onSecondaryContainer: pillappColors.secondary,

  tertiary: pillappColors.success,
  onTertiary: pillappColors.onSuccess,
  tertiaryContainer: pillappColors.successSoft,
  onTertiaryContainer: pillappColors.successDark,

  background: pillappColors.background,
  onBackground: pillappColors.textPrimary,

  surface: pillappColors.surface,
  onSurface: pillappColors.textPrimary,
  surfaceVariant: pillappColors.surfaceMuted,
  onSurfaceVariant: pillappColors.textSecondary,

  outline: pillappColors.border,
  outlineVariant: pillappColors.border,

  error: pillappColors.error,
  onError: pillappColors.onError,
  errorContainer: pillappColors.errorSoft,
  onErrorContainer: pillappColors.error,

  shadow: pillappColors.shadow,
  scrim: pillappColors.shadow,

  status: {
    taken: {
      background: pillappColors.status.taken.bg,
      text: pillappColors.status.taken.text,
      border: pillappColors.status.taken.border,
    },
    pending: {
      background: pillappColors.status.pending.bg,
      text: pillappColors.status.pending.text,
      border: pillappColors.status.pending.border,
    },
    dueSoon: {
      background: pillappColors.status.dueSoon.bg,
      text: pillappColors.status.dueSoon.text,
      border: pillappColors.status.dueSoon.border,
    },
    overdue: {
      background: pillappColors.status.overdue.bg,
      text: pillappColors.status.overdue.text,
      border: pillappColors.status.overdue.border,
    },
    snoozed: {
      background: pillappColors.status.snoozed.bg,
      text: pillappColors.status.snoozed.text,
      border: pillappColors.status.snoozed.border,
    },
  },
} as const;

export type PillAppMedicationStatus =
  | "pending"
  | "due_soon"
  | "overdue"
  | "taken"
  | "snoozed"
  | "skipped";

export function getMedicationStatusColors(status: PillAppMedicationStatus) {
  switch (status) {
    case "taken":
      return PillAppColors.status.taken;
    case "due_soon":
      return PillAppColors.status.dueSoon;
    case "overdue":
      return PillAppColors.status.overdue;
    case "snoozed":
      return PillAppColors.status.snoozed;
    case "skipped":
      return PillAppColors.status.pending;
    default:
      return PillAppColors.status.pending;
  }
}

export const Colors = {
  light: {
    text: PillAppColors.onBackground,
    background: PillAppColors.background,
    tint: PillAppColors.primary,
    icon: PillAppColors.onSurfaceVariant,
    tabIconDefault: PillAppColors.onSurfaceVariant,
    tabIconSelected: PillAppColors.primary,
    surface: PillAppColors.surface,
    surfaceVariant: PillAppColors.surfaceVariant,
    outline: PillAppColors.outline,
    error: PillAppColors.error,
    success: PillAppColors.onTertiaryContainer,
  },
  dark: {
    text: PillAppColors.onBackground,
    background: PillAppColors.background,
    tint: PillAppColors.primary,
    icon: PillAppColors.onSurfaceVariant,
    tabIconDefault: PillAppColors.onSurfaceVariant,
    tabIconSelected: PillAppColors.primary,
    surface: PillAppColors.surface,
    surfaceVariant: PillAppColors.surfaceVariant,
    outline: PillAppColors.outline,
    error: PillAppColors.error,
    success: PillAppColors.onTertiaryContainer,
  },
};

export function getMedicationStatusLabel(status: PillAppMedicationStatus): string {
  switch (status) {
    case "taken":
      return "Completato";
    case "due_soon":
      return "Tra poco";
    case "overdue":
      return "In ritardo";
    case "snoozed":
      return "Posticipato";
    case "skipped":
      return "Saltato";
    default:
      return "In attesa";
  }
}

export { pillappColors } from "@/theme/tokens";
