import {
  getMedicationStatusColors,
  getMedicationStatusLabel,
  type PillAppMedicationStatus,
} from "@/constants/colors";
import type { DoseStatus } from "@/types/domain";

import { AppBadge } from "@/components/ui/app-badge";

type StatusChipProps = {
  status: PillAppMedicationStatus | DoseStatus;
};

function toneForStatus(
  status: PillAppMedicationStatus,
): "success" | "primary" | "error" | "secondary" | "neutral" | "warning" {
  switch (status) {
    case "taken":
      return "success";
    case "due_soon":
      return "primary";
    case "overdue":
      return "error";
    case "snoozed":
      return "secondary";
    case "skipped":
      return "neutral";
    default:
      return "neutral";
  }
}

export function StatusChip({ status }: StatusChipProps) {
  const normalized = status as PillAppMedicationStatus;
  return (
    <AppBadge
      label={getMedicationStatusLabel(normalized)}
      tone={toneForStatus(normalized)}
      accessibilityLabel={`Stato: ${getMedicationStatusLabel(normalized)}`}
    />
  );
}

/** @deprecated Usa StatusChip */
export const StatusBadge = StatusChip;

export { getMedicationStatusColors, getMedicationStatusLabel };
