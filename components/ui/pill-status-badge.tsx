import {
  getMedicationStatusLabel,
  type PillAppMedicationStatus,
} from "@/constants/colors";
import type { DoseStatus } from "@/types/domain";

import { StatusChip } from "@/components/ui/status-chip";

type PillStatusBadgeProps = {
  status: PillAppMedicationStatus | DoseStatus;
  compact?: boolean;
};

/** @deprecated Usa StatusChip */
export function PillStatusBadge({ status }: PillStatusBadgeProps) {
  return <StatusChip status={status} />;
}

export { getMedicationStatusLabel };
