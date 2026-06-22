import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { XStack, YStack } from "tamagui";

import { HomeWeekCalendar } from "@/components/home/home-week-calendar";
import { useNow } from "@/hooks/use-now";
import {
  AppCard,
  AppCardContent,
  AppScreen,
  AppText,
  AppTopBar,
  EmptyState,
  MeasurementCard,
  MedicationScheduleCard,
  QuickActionButton,
  SectionHeader,
  SuccessState,
} from "@/components/ui";
import { useAppData } from "@/features/store/app-data-context";
import { AppRoutes } from "@/features/navigation/routes";
import { medicationsToCombinedDayPlan } from "@/lib/app-data/sync";
import { formatItalianDate, formatItalianTime } from "@/lib/time/datetime-labels";
import { pillappColors } from "@/theme/tokens";
import type { DoseEvent } from "@/types/domain";

function TimeBadge({ time }: { time: string }) {
  return (
    <YStack
      backgroundColor="$primarySoft"
      borderRadius="$2"
      paddingHorizontal="$3"
      paddingVertical="$2"
      alignItems="center"
      justifyContent="center"
      borderWidth={1}
      borderColor="$border"
      flexShrink={0}
      accessibilityLabel={`Ora attuale: ${time}`}
    >
      <AppText variant="title" color="primary">
        {time}
      </AppText>
    </YStack>
  );
}

function AdherenceBar({ taken, total }: { taken: number; total: number }) {
  const progress = total ? taken / total : 0;

  return (
    <YStack width="100%" gap="$2">
      <XStack
        width="100%"
        height={8}
        backgroundColor="$surfaceMuted"
        borderRadius="$pill"
        overflow="hidden"
      >
        <XStack
          flex={Math.max(progress, 0.001)}
          backgroundColor="$success"
          borderRadius="$pill"
        />
        <XStack flex={Math.max(1 - progress, 0.001)} />
      </XStack>
      <XStack width="100%" justifyContent="space-between">
        <AppText variant="caption" muted>
          {taken} completate
        </AppText>
        <AppText variant="caption" muted>
          {total} totali
        </AppText>
      </XStack>
    </YStack>
  );
}

function FeaturedDoseSection({
  hasMedications,
  hasDosesToday,
  nextDose,
  onMarkTaken,
  onSnooze,
  onScan,
}: {
  hasMedications: boolean;
  hasDosesToday: boolean;
  nextDose: DoseEvent | null | undefined;
  onMarkTaken: (id: string) => void;
  onSnooze: (id: string) => void;
  onScan: () => void;
}) {
  if (nextDose) {
    return (
      <YStack width="100%" gap="$3">
        <SectionHeader title="Prossima assunzione" />
        <MedicationScheduleCard
          dose={nextDose}
          onMarkTaken={() => onMarkTaken(nextDose.id)}
          onSnooze={() => onSnooze(nextDose.id)}
        />
      </YStack>
    );
  }

  if (!hasMedications) {
    return (
      <EmptyState
        title="Benvenuto in PillApp"
        description="Aggiungi il tuo primo farmaco scansionando il codice AIC sulla confezione. Riceverai promemoria puntuali per ogni assunzione."
        actionLabel="Scansiona codice AIC"
        onAction={onScan}
        icon={
          <MaterialCommunityIcons
            name="barcode-scan"
            size={32}
            color={pillappColors.primary}
          />
        }
      />
    );
  }

  if (!hasDosesToday) {
    return (
      <EmptyState
        title="Nessuna assunzione oggi"
        description="I tuoi farmaci non sono programmati per oggi. Consulta la tab Farmaci per l'agenda settimanale."
        icon={
          <MaterialCommunityIcons
            name="calendar-blank-outline"
            size={32}
            color={pillappColors.textMuted}
          />
        }
      />
    );
  }

  return (
    <SuccessState
      title="Terapia completata"
      description="Hai confermato tutte le assunzioni previste per oggi. Ottimo lavoro nel seguire la tua terapia."
    />
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

  const heroSubtitle = hasDosesToday
    ? `${adherenceToday.taken} di ${adherenceToday.total} assunzioni completate oggi`
    : hasMedications
      ? "Nessuna assunzione in programma per oggi"
      : "Inizia aggiungendo il tuo primo farmaco";

  const dosesForList = useMemo(
    () => (nextDose ? dosesToday.filter((d) => d.id !== nextDose.id) : dosesToday),
    [dosesToday, nextDose],
  );

  return (
    <AppScreen>
      <AppTopBar
        variant="hero"
        eyebrow={formatItalianDate(now)}
        title={greeting}
        subtitle={heroSubtitle}
        trailing={<TimeBadge time={formatItalianTime(now)} />}
      />

      <YStack width="100%" gap="$3">
        <SectionHeader
          title="La tua settimana"
          description="Terapia e impegni in calendario"
        />
        <AppCard variant="outlined">
          <AppCardContent>
            <HomeWeekCalendar dayPlan={therapyDayPlan} />
          </AppCardContent>
        </AppCard>
      </YStack>

      <FeaturedDoseSection
        hasMedications={hasMedications}
        hasDosesToday={hasDosesToday}
        nextDose={nextDose}
        onMarkTaken={markDoseTaken}
        onSnooze={snoozeDose}
        onScan={() => router.push(AppRoutes.scan)}
      />

      <YStack width="100%" gap="$3">
        <SectionHeader
          title="Agenda di oggi"
          description={
            hasDosesToday
              ? `${dosesToday.length} assunzion${dosesToday.length === 1 ? "e" : "i"} in programma`
              : undefined
          }
        />
        {hasDosesToday ? (
          <YStack width="100%" gap="$3">
            {dosesForList.map((dose) => (
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
            ))}
            {dosesForList.length === 0 && nextDose ? (
              <AppText variant="body" muted>
                La prossima assunzione è evidenziata sopra.
              </AppText>
            ) : null}
          </YStack>
        ) : (
          <EmptyState
            title="Agenda vuota"
            description={
              hasMedications
                ? "Oggi non ci sono altre assunzioni previste per i tuoi farmaci."
                : "Aggiungi un farmaco per iniziare a ricevere promemoria personalizzati."
            }
            actionLabel={hasMedications ? undefined : "Scansiona codice AIC"}
            onAction={hasMedications ? undefined : () => router.push(AppRoutes.scan)}
          />
        )}
      </YStack>

      {hasDosesToday ? (
        <AppCard variant="muted">
          <AppCardContent>
            <SectionHeader
              title="Aderenza di oggi"
              description="Ogni conferma aiuta te e il medico a monitorare la terapia"
            />
            <XStack width="100%" justifyContent="space-between" alignItems="baseline">
              <AppText variant="display" color="primary">
                {adherenceToday.percentage}%
              </AppText>
              <AppText variant="bodyStrong" muted>
                {adherenceToday.taken}/{adherenceToday.total}
              </AppText>
            </XStack>
            <AdherenceBar taken={adherenceToday.taken} total={adherenceToday.total} />
          </AppCardContent>
        </AppCard>
      ) : null}

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
        <AppCard variant="outlined">
          <AppCardContent gap="$2">
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
          </AppCardContent>
        </AppCard>
      </YStack>
    </AppScreen>
  );
}
