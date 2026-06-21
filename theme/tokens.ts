/**
 * PillApp design tokens — palette dal logo (blu + menta/teal).
 * Fonte unica per Tamagui e costanti legacy.
 */
export const pillappColors = {
  /** Sfondo app — bianco con leggera tinta azzurra */
  background: "#F4FAFF",
  backgroundSoft: "#EAF4FF",
  surface: "#FFFFFF",
  surfaceMuted: "#F0F7FD",
  surfaceElevated: "#FFFFFF",

  /** Blu vibrante — metà inferiore della pillola nel logo */
  primary: "#1A8CFF",
  primarySoft: "#E8F4FF",
  primaryDark: "#0F6FD6",
  onPrimary: "#FFFFFF",

  /** Teal/menta — metà superiore della pillola nel logo */
  secondary: "#2ECFB8",
  secondarySoft: "#E6FAF6",
  secondaryDark: "#1AAB95",
  onSecondary: "#FFFFFF",

  /** Verde menta — accento successo dal logo */
  success: "#4ADE80",
  successSoft: "#ECFDF5",
  successDark: "#22A06B",
  onSuccess: "#FFFFFF",

  /** Testo — nero profondo come la croce nel logo */
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#64748B",
  textInverse: "#FFFFFF",

  border: "#B8D4F0",
  borderStrong: "#7EB8E8",
  shadow: "#0F172A",

  error: "#DC2626",
  errorSoft: "#FEF2F2",
  onError: "#FFFFFF",

  warning: "#D97706",
  warningSoft: "#FFFBEB",

  status: {
    taken: { bg: "#ECFDF5", text: "#22A06B", border: "#4ADE80" },
    pending: { bg: "#F0F7FD", text: "#475569", border: "#B8D4F0" },
    dueSoon: { bg: "#E8F4FF", text: "#0F6FD6", border: "#1A8CFF" },
    overdue: { bg: "#FEF2F2", text: "#B91C1C", border: "#DC2626" },
    snoozed: { bg: "#E6FAF6", text: "#1AAB95", border: "#2ECFB8" },
    skipped: { bg: "#F0F7FD", text: "#64748B", border: "#B8D4F0" },
  },
} as const;

export const pillappSpace = {
  true: 16,
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 32,
  8: 40,
  9: 48,
} as const;

export const pillappRadius = {
  true: 16,
  0: 0,
  1: 8,
  2: 12,
  3: 16,
  4: 20,
  5: 24,
  pill: 999,
} as const;

export const pillappFontSize = {
  true: 16,
  1: 13,
  2: 14,
  3: 15,
  4: 16,
  5: 18,
  6: 20,
  7: 24,
  8: 28,
  9: 32,
} as const;

export const pillappLineHeight = {
  true: 24,
  1: 18,
  2: 20,
  3: 22,
  4: 24,
  5: 26,
  6: 28,
  7: 32,
  8: 36,
  9: 40,
} as const;

export const pillappTouch = {
  min: 48,
  comfortable: 52,
} as const;

export const pillappLayout = {
  screenPaddingX: 16,
  screenPaddingY: 12,
  sectionGap: 20,
  cardGap: 12,
} as const;

export type PillappStatusToken = keyof typeof pillappColors.status;
