/**
 * PillApp design tokens — healthcare consumer moderno.
 * Fonte unica per Tamagui, StyleSheet legacy e componenti UI.
 */

export const pillappColors = {
  /** Sfondo app — off-white azzurrato, calmo */
  background: "#F7FAFC",
  backgroundSoft: "#EEF4FA",
  surface: "#FFFFFF",
  surfaceMuted: "#F2F6FA",
  surfaceElevated: "#FFFFFF",

  /** Blu medicale — CTA primari, link, focus */
  primary: "#2B7FD4",
  primarySoft: "#E8F2FB",
  primaryDark: "#1E5F9E",
  onPrimary: "#FFFFFF",

  /** Teal clinico — progressi, conferme secondarie, brand accent */
  secondary: "#2AABA0",
  secondarySoft: "#E6F6F4",
  secondaryDark: "#1F8A82",
  onSecondary: "#FFFFFF",

  /** Verde soft — assunzione confermata, successo */
  success: "#2EAD7A",
  successSoft: "#EAF7F0",
  successDark: "#1F7A55",
  onSuccess: "#FFFFFF",

  /** Testo — alto contrasto WCAG AA+ */
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#64748B",
  textInverse: "#FFFFFF",

  /** Bordi delicati — separazione senza rumore */
  border: "#E2EBF3",
  borderStrong: "#C5D6E8",
  shadow: "#0F172A",

  error: "#DC2626",
  errorSoft: "#FEF2F2",
  onError: "#FFFFFF",

  warning: "#C27803",
  warningSoft: "#FFFBEB",

  /** Stati assunzione — tinte soft, mai aggressive */
  status: {
    taken: { bg: "#EAF7F0", text: "#1F7A55", border: "#A8DFC4" },
    pending: { bg: "#F2F6FA", text: "#475569", border: "#E2EBF3" },
    dueSoon: { bg: "#E8F2FB", text: "#1E5F9E", border: "#9DC5EB" },
    overdue: { bg: "#FEF2F2", text: "#B91C1C", border: "#F5B4B4" },
    snoozed: { bg: "#E6F6F4", text: "#1F8A82", border: "#9DD9D2" },
    skipped: { bg: "#F2F6FA", text: "#64748B", border: "#E2EBF3" },
  },
} as const;

/** Scala 4pt — mobile-first, coerente con Tamagui $N */
export const pillappSpace = {
  true: 16,
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 32,
  8: 40,
  9: 48,
  10: 56,
} as const;

/** Radius moderni — card 16–20, chip 8–12, pill per badge */
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

/** Dimensioni touch e icone */
export const pillappSize = {
  true: 16,
  iconSm: 20,
  iconMd: 24,
  iconLg: 28,
  touchMin: 48,
  touchComfortable: 52,
  inputHeight: 52,
  topBarHeight: 56,
  tabBarHeight: 56,
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

/** Ombre leggere — niente glow o profondità pesante */
export const pillappShadows = {
  none: {
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  sm: {
    shadowColor: pillappColors.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  md: {
    shadowColor: pillappColors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  lg: {
    shadowColor: pillappColors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
} as const;

export const pillappTouch = {
  min: pillappSize.touchMin,
  comfortable: pillappSize.touchComfortable,
} as const;

/** Gradiente brand (cupola intro, CTA onboarding, welcome) */
export const pillappBrandGradient = {
  colors: [
    pillappColors.secondary,
    "#4EC4B5",
    pillappColors.primary,
    pillappColors.primaryDark,
  ] as const,
  locations: [0, 0.35, 0.7, 1] as const,
  start: { x: 0, y: 0 } as const,
  end: { x: 1, y: 1 } as const,
};

export const pillappLayout = {
  screenPaddingX: 16,
  screenPaddingY: 16,
  sectionGap: 24,
  cardGap: 12,
  contentMaxWidth: 480,
} as const;

export type PillappStatusToken = keyof typeof pillappColors.status;
