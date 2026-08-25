import type { YStackProps } from "tamagui";

/** Stack verticale a larghezza piena — figli stretch (form, card). */
export const fullWidthStackProps = {
  width: "100%",
  maxWidth: "100%",
  alignSelf: "stretch",
  alignItems: "stretch",
} as const satisfies YStackProps;

/** Padding standard schermata scrollabile */
export const screenContentProps = {
  ...fullWidthStackProps,
  paddingHorizontal: "$4",
  paddingTop: "$4",
  paddingBottom: "$8",
  gap: "$6",
} as const satisfies YStackProps;
