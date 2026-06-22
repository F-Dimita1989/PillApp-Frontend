import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { XStack, YStack } from "tamagui";

import {
  AppBadge,
  AppCard,
  AppCardContent,
  AppScreen,
  AppTopBar,
  EmptyState,
  InfoRow,
  MedicationScheduleCard,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
} from "@/components/ui";
import { AppRoutes } from "@/features/navigation/routes";
import { useAppData } from "@/features/store/app-data-context";
import { MEDICATION_FORM_LABELS } from "@/types/domain";

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

export function MedicationDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getMedicationById, dosesToday, markDoseTaken } = useAppData();

  const medication = getMedicationById(id ?? "");

  const todayDoses = useMemo(
    () => dosesToday.filter((d) => d.medicationId === id),
    [dosesToday, id],
  );

  if (!medication) {
    return (
      <AppScreen>
        <EmptyState
          title="Farmaco non trovato"
          description="Il farmaco richiesto non è più disponibile o l'identificativo non è valido."
          actionLabel="Torna ai farmaci"
          onAction={() => router.replace(AppRoutes.medications)}
        />
      </AppScreen>
    );
  }

  const activeDays = medication.schedule.daysActive
    .map((active, index) => (active ? DAY_LABELS[index] : null))
    .filter(Boolean)
    .join(", ");

  return (
    <AppScreen>
      <AppTopBar
        title={medication.name}
        subtitle={medication.dose}
        eyebrow={medication.source === "aic_scan" ? "Da scansione AIC" : "Inserimento manuale"}
        onBack={() => router.back()}
      />

      <AppCard variant="outlined">
        <AppCardContent>
          <SectionHeader title="Informazioni" />
          <InfoRow label="Forma" value={MEDICATION_FORM_LABELS[medication.form]} />
          {medication.aic ? (
            <InfoRow label="Codice AIC" value={medication.aic} emphasized />
          ) : null}
          <InfoRow
            label="Orari"
            value={medication.schedule.times.join(" · ")}
            emphasized
          />
          <InfoRow label="Giorni attivi" value={activeDays || "Nessuno"} />
          {medication.notes ? <InfoRow label="Note" value={medication.notes} /> : null}
          <XStack width="100%" flexWrap="wrap" gap="$2" paddingTop="$1">
            <AppBadge
              label={medication.active ? "Terapia attiva" : "Sospesa"}
              tone={medication.active ? "success" : "neutral"}
            />
            {medication.source === "aic_scan" ? (
              <AppBadge label="Da AIC" tone="primary" />
            ) : null}
          </XStack>
        </AppCardContent>
      </AppCard>

      <YStack width="100%" gap="$3">
        <SectionHeader
          title="Assunzioni di oggi"
          description={
            todayDoses.length > 0
              ? `${todayDoses.length} dose${todayDoses.length === 1 ? "" : "i"} programmate`
              : undefined
          }
        />
        {todayDoses.length === 0 ? (
          <EmptyState
            title="Nessuna dose oggi"
            description="Questo farmaco non ha assunzioni previste per oggi."
          />
        ) : (
          todayDoses.map((dose) => (
            <MedicationScheduleCard
              key={dose.id}
              dose={dose}
              compact={dose.status === "taken" || dose.status === "skipped"}
              onMarkTaken={
                dose.status !== "taken" && dose.status !== "skipped"
                  ? () => markDoseTaken(dose.id)
                  : undefined
              }
            />
          ))
        )}
      </YStack>

      <YStack width="100%" gap="$3" marginTop="$2">
        <PrimaryButton icon="pencil-outline" fullWidth onPress={() => router.push(AppRoutes.scan)}>
          Modifica terapia
        </PrimaryButton>
        <SecondaryButton icon="history" fullWidth onPress={() => router.push(AppRoutes.journal)}>
          Vedi storico
        </SecondaryButton>
      </YStack>
    </AppScreen>
  );
}
