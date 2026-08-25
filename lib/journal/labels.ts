import type { MeasurementKind, MoodLevel } from "@/types/domain";

export const MOOD_LABELS: Record<MoodLevel, string> = {
  ottimo: "Ottimo",
  buono: "Buono",
  cosi_cosi: "Così così",
  male: "Male",
  pessimo: "Pessimo",
};

export const MEASUREMENT_UNITS: Record<MeasurementKind, string> = {
  pressure: "mmHg",
  glucose: "mg/dL",
  weight: "kg",
  saturation: "%",
};

export const MEASUREMENT_PLACEHOLDERS: Record<MeasurementKind, string> = {
  pressure: "Es. 120/80",
  glucose: "Es. 95",
  weight: "Es. 72,5",
  saturation: "Es. 98",
};

export const MEASUREMENT_ICONS: Record<
  MeasurementKind,
  "heart-pulse" | "water" | "scale-bathroom" | "lungs"
> = {
  pressure: "heart-pulse",
  glucose: "water",
  weight: "scale-bathroom",
  saturation: "lungs",
};

export function moodBadgeTone(
  mood: MoodLevel,
): "success" | "primary" | "secondary" | "warning" | "error" {
  switch (mood) {
    case "ottimo":
      return "success";
    case "buono":
      return "primary";
    case "cosi_cosi":
      return "secondary";
    case "male":
      return "warning";
    case "pessimo":
      return "error";
  }
}
