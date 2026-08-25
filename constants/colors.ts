/**
 * Etichette stato terapia.
 * Palette colori: `@/theme/tokens`.
 */

export type PillAppMedicationStatus =
  | "pending"
  | "due_soon"
  | "overdue"
  | "taken"
  | "snoozed"
  | "skipped";

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
