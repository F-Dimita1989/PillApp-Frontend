import type { XStackProps, YStackProps } from "tamagui";

/** Stack verticale a larghezza piena — figli stretch (form, card). */
export const fullWidthStackProps = {
  width: "100%",
  maxWidth: "100%",
  alignSelf: "stretch",
  alignItems: "stretch",
} as const satisfies YStackProps;

/** Riga a larghezza piena — figli centrati verticalmente (toolbar, righe). */
export const fullWidthRowProps = {
  width: "100%",
  maxWidth: "100%",
  alignSelf: "stretch",
  flexDirection: "row",
  alignItems: "center",
} as const satisfies XStackProps;

/** Padding standard schermata scrollabile */
export const screenContentProps = {
  ...fullWidthStackProps,
  paddingHorizontal: "$4",
  paddingTop: "$4",
  paddingBottom: "$8",
  gap: "$6",
} as const satisfies YStackProps;

/** Sezione con titolo + contenuto */
export const sectionProps = {
  ...fullWidthStackProps,
  gap: "$3",
} as const satisfies YStackProps;
