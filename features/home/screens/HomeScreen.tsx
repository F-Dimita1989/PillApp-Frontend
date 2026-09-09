import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import { XStack, YStack } from "tamagui";

import { HomeWeekCalendar } from "@/components/home/home-week-calendar";
import {
    AppCard,
    AppCardContent,
    AppProgress,
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
import { AppRoutes } from "@/features/navigation/routes";
import { useAppData } from "@/features/store/app-data-context";
import { useNow } from "@/hooks/use-now";
import { mergeDoseStatuses } from "@/lib/app-data/storage";
import {
    buildDosesForDate,
    medicationsToCombinedDayPlan,
} from "@/lib/app-data/sync";
import { formatDateKey, parseDateKey } from "@/lib/calendar/week-utils";
import { MEASUREMENT_ICONS } from "@/lib/journal/labels";
import { formatItalianDate } from "@/lib/time/datetime-labels";
import { pillappColors, pillappRadius } from "@/theme/tokens";
import type { DoseEvent } from "@/types/domain";

const HOME_DIARY_IMAGE = require("@/assets/onboarding/home-diario.jpg");

function AdherenceBar({ taken, total }: { taken: number; total: number }) {
  const progress = total ? taken / total : 0;

  return (
    <YStack width="100%" gap="$2">
      <AppProgress progress={progress} height={8} borderRadius={999} />
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
            color={pillappColors.onPrimary}
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
            color={pillappColors.onPrimary}
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

  const now = useNow(60_000);
  const todayKey = formatDateKey(now);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const isSelectedToday = selectedDate === todayKey;
  const selectedDayLabel = useMemo(
    () => formatItalianDate(parseDateKey(selectedDate)),
    [selectedDate],
  );
  const therapyDayPlan = useMemo(
    () => medicationsToCombinedDayPlan(medications),
    [medications],
  );
  const greeting = profile.name ? `Ciao, ${profile.name}` : "Ciao";
  const hasMedications = medications.some((m) => m.active);
  const hasDosesToday = dosesToday.length > 0;

  const dosesForSelectedDay = useMemo(() => {
    const generated = buildDosesForDate(
      medications,
      parseDateKey(selectedDate),
    );
    if (!isSelectedToday) {
      return generated;
    }
    return mergeDoseStatuses(generated, dosesToday);
  }, [dosesToday, isSelectedToday, medications, selectedDate]);

  const hasDosesOnSelectedDay = dosesForSelectedDay.length > 0;

  const heroSubtitle = hasDosesToday
    ? `${adherenceToday.taken} di ${adherenceToday.total} assunzioni completate oggi`
    : hasMedications
      ? "Nessuna assunzione in programma per oggi"
      : "Inizia aggiungendo il tuo primo farmaco";

  const dosesForList = useMemo(
    () =>
      isSelectedToday && nextDose
        ? dosesForSelectedDay.filter((d) => d.id !== nextDose.id)
        : dosesForSelectedDay,
    [dosesForSelectedDay, isSelectedToday, nextDose],
  );

  return (
    <AppScreen
      hero={
        <AppTopBar
          image={require("@/assets/onboarding/home.png")}
          imageCoverScale={0.76}
          eyebrow={formatItalianDate(now)}
          title={greeting}
          subtitle={heroSubtitle}
        />
      }
    >
      <Image
        source={HOME_DIARY_IMAGE}
        style={styles.diaryImage}
        contentFit="cover"
        accessibilityRole="image"
        accessibilityLabel="Illustrazione: diario medico, benessere a casa"
      />

      <YStack width="100%" gap="$3">
        <SectionHeader
          title="La tua settimana"
          description="I giorni con farmaci da prendere"
        />
        <AppCard>
          <AppCardContent>
            <HomeWeekCalendar
              dayPlan={therapyDayPlan}
              selectedDate={selectedDate}
              onSelectedDateChange={setSelectedDate}
            />
          </AppCardContent>
        </AppCard>
      </YStack>

      {isSelectedToday ? (
        <FeaturedDoseSection
          hasMedications={hasMedications}
          hasDosesToday={hasDosesToday}
          nextDose={nextDose}
          onMarkTaken={markDoseTaken}
          onSnooze={snoozeDose}
          onScan={() => router.push(AppRoutes.scan)}
        />
      ) : null}

      <YStack width="100%" gap="$3">
        <SectionHeader
          title={isSelectedToday ? "Agenda di oggi" : "Terapia del giorno"}
          description={
            hasDosesOnSelectedDay
              ? `${dosesForSelectedDay.length} assunzion${dosesForSelectedDay.length === 1 ? "e" : "i"} · ${selectedDayLabel}`
              : selectedDayLabel
          }
        />
        {hasDosesOnSelectedDay ? (
          <YStack width="100%" gap="$3">
            {dosesForList.map((dose) => (
              <MedicationScheduleCard
                key={dose.id}
                dose={dose}
                compact={
                  !isSelectedToday ||
                  dose.status === "taken" ||
                  dose.status === "skipped"
                }
                statusMessage={
                  isSelectedToday ? undefined : "In programma per questo giorno"
                }
                onMarkTaken={
                  isSelectedToday &&
                  dose.status !== "taken" &&
                  dose.status !== "skipped"
                    ? () => markDoseTaken(dose.id)
                    : undefined
                }
              />
            ))}
            {isSelectedToday && dosesForList.length === 0 && nextDose ? (
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
                ? isSelectedToday
                  ? "Oggi non ci sono altre assunzioni previste per i tuoi farmaci."
                  : `Nessuna assunzione prevista per ${selectedDayLabel.toLowerCase()}.`
                : "Aggiungi un farmaco per iniziare a ricevere promemoria personalizzati."
            }
            actionLabel={hasMedications ? undefined : "Scansiona codice AIC"}
            onAction={
              hasMedications ? undefined : () => router.push(AppRoutes.scan)
            }
          />
        )}
      </YStack>

      {isSelectedToday && hasDosesToday ? (
        <AppCard>
          <AppCardContent>
            <SectionHeader
              title="Aderenza di oggi"
              description="Ogni conferma aiuta te e il medico a monitorare la terapia"
            />
            <XStack
              width="100%"
              justifyContent="space-between"
              alignItems="baseline"
            >
              <AppText variant="display">{adherenceToday.percentage}%</AppText>
              <AppText variant="bodyStrong" muted>
                {adherenceToday.taken}/{adherenceToday.total}
              </AppText>
            </XStack>
            <AdherenceBar
              taken={adherenceToday.taken}
              total={adherenceToday.total}
            />
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
                icon={MEASUREMENT_ICONS[m.kind]}
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
        <AppCard>
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

const styles = StyleSheet.create({
  diaryImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: pillappRadius[3],
    overflow: "hidden",
  },
});
