/** Tipografia PillApp — varianti Paper + pesi consigliati. */
export const typography = {
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
  },
  headline: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700" as const,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "700" as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
  bodyStrong: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600" as const,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600" as const,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500" as const,
  },
  /** Minimo consigliato per utenti fragili */
  minimumReadable: 15,
} as const;

export const textVariants = {
  screenTitle: "headlineMedium" as const,
  sectionTitle: "titleLarge" as const,
  cardTitle: "titleMedium" as const,
  body: "bodyLarge" as const,
  caption: "bodyMedium" as const,
  eyebrow: "labelLarge" as const,
};
