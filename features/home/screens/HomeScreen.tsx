import { useRouter } from "expo-router";
import { useMemo } from "react";
import { XStack, YStack } from "tamagui";

import { HomeWeekCalendar } from "@/components/home/home-week-calendar";
import { useNow } from "@/hooks/use-now";
import {
  AppCard,
  AppCardActions,
  AppCardContent,
  AppScreen,
  AppText,
  EmptyState,
  MeasurementCard,
  PrimaryButton,
  QuickActionButton,
  ReminderCard,
  SecondaryButton,
  SectionHeader,
  StatusChip,
} from "@/components/ui";
import { useAppData } from "@/features/store/app-data-context";
import { AppRoutes } from "@/features/navigation/routes";
import { medicationsToCombinedDayPlan } from "@/lib/app-data/sync";
import { formatItalianDate, formatItalianTime } from "@/lib/time/datetime-labels";

function heroMessage(status: string): string {
  switch (status) {
    case "due_soon":
      return "Da prendere tra poco";
    case "overdue":
      return "Orario superato: conviene prenderlo adesso";
    case "snoozed":
      return "Promemoria posticipato";
    default:
      return "In programma per oggi";
  }
}

function AdherenceBar({ taken, total }: { taken: number; total: number }) {
  const progress = total ? taken / total : 0;

  return (
    <XStack width="100%" height={10} backgroundColor="$surfaceMuted" borderRadius={999} overflow="hidden">
      <XStack flex={Math.max(progress, 0.001)} backgroundColor="$secondary" borderRadius={999} />
      <XStack flex={Math.max(1 - progress, 0.001)} />
    </XStack>
  );
}

export function HomeScreen() {
  const router = useRouter();
  const {
    profile,
    medications,
    dosesToday,
    measurements,
    nextDose,
    adherenceToday,
    markDoseTaken,
    snoozeDose,
  } = useAppData();

  const now = useNow();
  const therapyDayPlan = useMemo(
    () => medicationsToCombinedDayPlan(medications),
    [medications],
  );
  const greeting = profile.name ? `Ciao, ${profile.name}` : "Ciao";
  const hasMedications = medications.some((m) => m.active);
  const hasDosesToday = dosesToday.length > 0;

  return (
    <AppScreen>
      <YStack width="100%" gap="$1" paddingBottom="$1">
        <AppText variant="headline">{greeting}</AppText>
        <AppText variant="body" muted>
          {formatItalianDate(now)}
        </AppText>
        <AppText variant="title" color="primary">
          {formatItalianTime(now)}
        </AppText>
      </YStack>

      <AppCard>
        <AppCardContent>
          <HomeWeekCalendar dayPlan={therapyDayPlan} />
        </AppCardContent>
      </AppCard>

      {nextDose ? (
        <AppCard>
          <AppCardContent>
            <XStack width="100%" justifyContent="space-between" alignItems="center">
              <AppText variant="label" color="primary">
                Prossimo farmaco
              </AppText>
              <StatusChip status={nextDose.status} />
            </XStack>
            <YStack width="100%" gap="$2">
              <AppText variant="bodyStrong">{nextDose.medicationName}</AppText>
              <AppText variant="body" muted>
                {nextDose.dose}
              </AppText>
              <AppText variant="title">Orario: {nextDose.scheduledTime}</AppText>
              <AppText variant="body" muted>
                {heroMessage(nextDose.status)}
              </AppText>
            </YStack>
          </AppCardContent>
          <AppCardActions>
            <PrimaryButton
              icon="check-circle-outline"
              fullWidth
              onPress={() => markDoseTaken(nextDose.id)}
            >
              Segna come preso
            </PrimaryButton>
            <SecondaryButton icon="bell-outline" fullWidth onPress={() => snoozeDose(nextDose.id)}>
              Ricordamelo dopo
            </SecondaryButton>
          </AppCardActions>
        </AppCard>
      ) : hasMedications && !hasDosesToday ? (
        <AppCard>
          <AppCardContent>
            <AppText variant="headline">Nessuna assunzione oggi</AppText>
            <AppText variant="body" muted>
              I tuoi farmaci non sono programmati per oggi. Controlla la tab Farmaci per
              l&apos;agenda settimanale.
            </AppText>
          </AppCardContent>
        </AppCard>
      ) : hasMedications ? (
        <AppCard variant="muted">
          <AppCardContent>
            <AppText variant="headline">Ottimo lavoro!</AppText>
            <AppText variant="body" muted>
              Hai completato tutte le assunzioni programmate per oggi.
            </AppText>
          </AppCardContent>
        </AppCard>
      ) : (
        <AppCard>
          <AppCardContent>
            <AppText variant="headline">Benvenuto in PillApp</AppText>
            <AppText variant="body" muted>
              Scansiona il codice AIC sulla confezione per aggiungere il tuo primo farmaco e
              ricevere i promemoria.
            </AppText>
          </AppCardContent>
          <AppCardActions>
            <PrimaryButton icon="barcode-scan" fullWidth onPress={() => router.push(AppRoutes.scan)}>
              Scansiona codice AIC
            </PrimaryButton>
          </AppCardActions>
        </AppCard>
      )}

      <YStack width="100%" gap="$3">
        <SectionHeader
          title="Oggi"
          description={
            hasDosesToday
              ? `${adherenceToday.taken} di ${adherenceToday.total} assunzioni completate`
              : "Nessuna assunzione in programma"
          }
        />
        {hasDosesToday ? (
          <YStack width="100%" gap="$3">
            {dosesToday.map((dose) => (
              <ReminderCard
                key={dose.id}
                dose={dose}
                onMarkTaken={() => markDoseTaken(dose.id)}
              />
            ))}
          </YStack>
        ) : (
          <EmptyState
            title="Agenda vuota"
            description={
              hasMedications
                ? "Oggi non ci sono assunzioni previste per i tuoi farmaci."
                : "Aggiungi un farmaco scansionando il codice AIC o dalla configurazione iniziale."
            }
            actionLabel={hasMedications ? undefined : "Scansiona codice AIC"}
            onAction={hasMedications ? undefined : () => router.push(AppRoutes.scan)}
          />
        )}
      </YStack>

      {measurements.length > 0 ? (
        <YStack width="100%" gap="$3">
          <SectionHeader title="Misurazioni recenti" />
          <XStack width="100%" flexWrap="wrap" gap="$3">
            {measurements.slice(0, 3).map((m) => (
              <MeasurementCard
                key={m.id}
                label={m.label}
                value={m.value}
                unit={m.unit}
                hint={new Date(m.recordedAt).toLocaleTimeString("it-IT", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              />
            ))}
          </XStack>
        </YStack>
      ) : null}

      <YStack width="100%" gap="$3">
        <SectionHeader title="Azioni rapide" />
        <YStack width="100%" gap="$2">
          <QuickActionButton
            label="Scansiona codice AIC"
            icon="barcode-scan"
            highlight
            onPress={() => router.push(AppRoutes.scan)}
            accessibilityHint="Apre la scansione del codice AIC sulla confezione"
          />
          <QuickActionButton
            label="I miei farmaci"
            icon="pill"
            onPress={() => router.push(AppRoutes.medications)}
            accessibilityHint="Apre l'elenco dei farmaci attivi"
          />
          <QuickActionButton
            label="Diario salute"
            icon="notebook-outline"
            onPress={() => router.push(AppRoutes.journal)}
            accessibilityHint="Registra misurazioni, sintomi e note"
          />
        </YStack>
      </YStack>

      <AppCard>
        <AppCardContent>
          <XStack width="100%" justifyContent="space-between" alignItems="center">
            <AppText variant="title">Aderenza di oggi</AppText>
            <AppText variant="title" color="primary">
              {adherenceToday.percentage}%
            </AppText>
          </XStack>
          <AdherenceBar taken={adherenceToday.taken} total={adherenceToday.total} />
          <AppText variant="body" muted>
            Ogni dose confermata aiuta te e il tuo medico a monitorare la terapia.
          </AppText>
        </AppCardContent>
      </AppCard>
    </AppScreen>
  );
}
