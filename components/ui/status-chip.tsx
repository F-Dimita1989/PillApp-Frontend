import type { DoseStatus } from "@/types/domain";

import { AppBadge } from "@/components/ui/app-badge";

type StatusChipProps = {
  status: DoseStatus;
};

function statusLabel(status: DoseStatus): string {
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

function toneForStatus(
  status: DoseStatus,
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
  const label = statusLabel(status);
  return (
    <AppBadge
      label={label}
      tone={toneForStatus(status)}
      accessibilityLabel={`Stato: ${label}`}
    />
  );
}
