import { MaterialCommunityIcons } from "@expo/vector-icons";
import { XStack, YStack } from "tamagui";

import { AppButton } from "@/components/ui/app-button";
import { AppCard, AppCardActions, AppCardContent } from "@/components/ui/app-card";
import { AppText } from "@/components/ui/app-text";
import { StatusChip } from "@/components/ui/status-chip";
import { pillappColors } from "@/theme/tokens";
import type { DoseEvent } from "@/types/domain";

type MedicationScheduleCardProps = {
  dose: DoseEvent;
  onMarkTaken?: () => void;
  onSnooze?: () => void;
  compact?: boolean;
  /** Messaggio contestuale sotto l'orario */
  statusMessage?: string;
};

function defaultStatusMessage(status: DoseEvent["status"]): string {
  switch (status) {
    case "due_soon":
      return "Da prendere tra poco";
    case "overdue":
      return "Orario superato — conviene prenderlo adesso";
    case "snoozed":
      return "Promemoria posticipato";
    case "taken":
      return "Assunzione confermata";
    case "skipped":
      return "Assunzione saltata";
    default:
      return "In programma per oggi";
  }
}

export function MedicationScheduleCard({
  dose,
  onMarkTaken,
  onSnooze,
  compact = false,
  statusMessage,
}: MedicationScheduleCardProps) {
  const message = statusMessage ?? defaultStatusMessage(dose.status);
  const showActions =
    !compact && dose.status !== "taken" && dose.status !== "skipped";

  return (
    <AppCard variant={dose.status === "overdue" ? "highlight" : "elevated"}>
      <AppCardContent>
        <XStack width="100%" justifyContent="space-between" alignItems="flex-start" gap="$3">
          <XStack
            width={48}
            height={48}
            borderRadius="$2"
            backgroundColor="$primarySoft"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <MaterialCommunityIcons name="pill" size={24} color={pillappColors.primary} />
          </XStack>
          <YStack flex={1} gap="$1.5" minWidth={0}>
            <AppText variant="bodyStrong" numberOfLines={2}>
              {dose.medicationName}
            </AppText>
            <AppText variant="body" muted>
              {dose.dose}
            </AppText>
          </YStack>
          <StatusChip status={dose.status} />
        </XStack>

        <XStack
          width="100%"
          alignItems="baseline"
          justifyContent="space-between"
          paddingTop="$1"
          gap="$3"
        >
          <YStack gap="$1" flex={1}>
            <AppText variant="overline" muted>
              Orario
            </AppText>
            <AppText variant="title" color="primary">
              {dose.scheduledTime}
            </AppText>
          </YStack>
          <AppText variant="caption" muted flex={1} textAlign="right">
            {message}
          </AppText>
        </XStack>
      </AppCardContent>

      {showActions ? (
        <AppCardActions>
          {onMarkTaken ? (
            <AppButton
              variant="primary"
              icon="check-circle-outline"
              fullWidth
              onPress={onMarkTaken}
              accessibilityLabel={`Conferma assunzione di ${dose.medicationName}`}
            >
              Conferma assunzione
            </AppButton>
          ) : null}
          {onSnooze ? (
            <AppButton
              variant="secondary"
              icon="bell-outline"
              fullWidth
              onPress={onSnooze}
              accessibilityLabel={`Posticipa promemoria per ${dose.medicationName}`}
            >
              Ricordamelo dopo
            </AppButton>
          ) : null}
        </AppCardActions>
      ) : null}
    </AppCard>
  );
}

/** @deprecated Usa MedicationScheduleCard */
export const ReminderCard = MedicationScheduleCard;
