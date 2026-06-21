import type { QuantitaUnit } from "@/types/domain";

export type TherapyDoseOption = {
  value: string;
  label: string;
};

const PILLOLE_DOSES: TherapyDoseOption[] = [
  { value: "1/2 compressa", label: "1/2 compressa" },
  { value: "1 compressa", label: "1 compressa" },
  { value: "2 compresse", label: "2 compresse" },
  { value: "3 compresse", label: "3 compresse" },
];

const BUSTINE_DOSES: TherapyDoseOption[] = [
  { value: "1 bustina", label: "1 bustina" },
  { value: "2 bustine", label: "2 bustine" },
];

const ML_DOSES: TherapyDoseOption[] = [
  { value: "2.5 ml", label: "2.5 ml" },
  { value: "5 ml", label: "5 ml" },
  { value: "10 ml", label: "10 ml" },
  { value: "15 ml", label: "15 ml" },
];

export function therapyDoseOptionsForUnit(
  unita: QuantitaUnit,
): TherapyDoseOption[] {
  switch (unita) {
    case "ml":
      return ML_DOSES;
    case "bustine":
      return BUSTINE_DOSES;
    default:
      return PILLOLE_DOSES;
  }
}

export function nearestTherapyDoseOption(
  dose: string,
  unita: QuantitaUnit,
): string {
  const options = therapyDoseOptionsForUnit(unita);
  const trimmed = dose.trim();
  if (options.some((option) => option.value === trimmed)) {
    return trimmed;
  }
  return options[0]?.value ?? "1 compressa";
}
