/** Spacing e dimensioni touch — coerenti in tutta l'app. */
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 12,
  md: 16,
  lg: 20,
  pill: 999,
} as const;

export const layout = {
  screenPaddingHorizontal: spacing.md,
  screenPaddingVertical: spacing.sm,
  sectionGap: spacing.lg,
  cardGap: spacing.sm,
} as const;
