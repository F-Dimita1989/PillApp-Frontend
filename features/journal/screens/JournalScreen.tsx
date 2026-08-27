import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { XStack, YStack } from "tamagui";

import { JournalSectionHeading } from "@/components/journal/journal-section-heading";
import { JournalStripeCard } from "@/components/journal/journal-stripe-card";
import {
  AppBadge,
  AppCard,
  AppDivider,
  AppInput,
  AppInputMultiline,
  AppScreen,
  AppSegmentedControl,
  AppSnackbar,
  AppText,
  AppTopBar,
  BrandIntroCard,
  EmptyState,
  MeasurementCard,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui";
import { useAppData } from "@/features/store/app-data-context";
import {
  hasJournalExportData,
  shareJournalPdf,
} from "@/lib/journal/export-pdf";
import {
  MEASUREMENT_ICONS,
  MEASUREMENT_PLACEHOLDERS,
  MEASUREMENT_UNITS,
  MOOD_LABELS,
  moodBadgeTone,
} from "@/lib/journal/labels";
import { pillappColors } from "@/theme/tokens";
import type { MeasurementKind, MoodLevel } from "@/types/domain";
import { MEASUREMENT_LABELS } from "@/types/domain";

const MOOD_OPTIONS = (
  Object.entries(MOOD_LABELS) as [MoodLevel, string][]
).map(([value, label]) => ({ value, label }));

export function JournalScreen() {
  const {
    profile,
    medications,
    measurements,
    symptoms,
    journalNotes,
    addMeasurement,
    addSymptom,
    addJournalNote,
  } = useAppData();

  const [kind, setKind] = useState<MeasurementKind>("pressure");
  const [value, setValue] = useState("");
  const [symptomLabel, setSymptomLabel] = useState("");
  const [note, setNote] = useState("");
  const [mood, setMood] = useState<MoodLevel>("buono");
  const [snack, setSnack] = useState("");
  const [exporting, setExporting] = useState(false);

  const canExport = useMemo(
    () =>
      hasJournalExportData({
        profile,
        measurements,
        symptoms,
        notes: journalNotes,
        medications,
      }),
    [journalNotes, measurements, medications, profile, symptoms],
  );

  const saveMeasurement = () => {
    if (!value.trim()) {
      setSnack("Inserisci un valore prima di salvare.");
      return;
    }
    addMeasurement({
      id: `meas-${Date.now()}`,
      kind,
      label: MEASUREMENT_LABELS[kind],
      value: value.trim(),
      unit: MEASUREMENT_UNITS[kind],
      recordedAt: new Date().toISOString(),
    });
    setValue("");
    setSnack("Misurazione registrata");
  };

  const saveSymptom = () => {
    if (!symptomLabel.trim()) {
      setSnack("Scrivi il sintomo da registrare.");
      return;
    }
    addSymptom({
      id: `sym-${Date.now()}`,
      label: symptomLabel.trim(),
      severity: 2,
      recordedAt: new Date().toISOString(),
    });
    setSymptomLabel("");
    setSnack("Sintomo registrato");
  };

  const saveNote = () => {
    if (!note.trim()) {
      setSnack("Scrivi una nota prima di salvare.");
      return;
    }
    addJournalNote({
      id: `note-${Date.now()}`,
      mood,
      text: note.trim(),
      recordedAt: new Date().toISOString(),
    });
    setNote("");
    setSnack("Nota salvata nel diario");
  };

  const exportPdf = async () => {
    if (!canExport) {
      setSnack("Aggiungi almeno una misurazione o una nota, poi esporta il PDF.");
      return;
    }
    setExporting(true);
    try {
      await shareJournalPdf({
        profile,
        measurements,
        symptoms,
        notes: journalNotes,
        medications,
      });
      setSnack("PDF pronto: salvalo sul telefono o invialo al medico.");
    } catch (error) {
      setSnack(
        error instanceof Error
          ? error.message
          : "Non è stato possibile creare il PDF.",
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <AppScreen
      hero={
        <AppTopBar
          icon="notebook-heart-outline"
          eyebrow="Per te e per il medico"
          title="Diario salute"
          subtitle="Registra misurazioni e note, poi salva un PDF da inviare al tuo medico."
        />
      }
    >
      <JournalStripeCard
        actions={
          <PrimaryButton icon="content-save" fullWidth onPress={saveMeasurement}>
            Salva misurazione
          </PrimaryButton>
        }
      >
        <JournalSectionHeading
          icon="heart-pulse"
          title="Nuova misurazione"
          description="Pressione, glicemia, peso o saturazione."
        />
        <AppSegmentedControl
          value={kind}
          onValueChange={(next) => {
            setKind(next as MeasurementKind);
            setValue("");
          }}
          options={[
            { value: "pressure", label: "Pressione" },
            { value: "glucose", label: "Glicemia" },
            { value: "weight", label: "Peso" },
            { value: "saturation", label: "Sat." },
          ]}
        />
        <AppInput
          label={`Valore (${MEASUREMENT_UNITS[kind]})`}
          value={value}
          onChangeText={setValue}
          placeholder={MEASUREMENT_PLACEHOLDERS[kind]}
          keyboardType="decimal-pad"
          hint={`Unità: ${MEASUREMENT_UNITS[kind]}`}
          accessibilityLabel={`Valore ${MEASUREMENT_LABELS[kind]}`}
        />
      </JournalStripeCard>

      <JournalStripeCard
        actions={
          <PrimaryButton icon="notebook-edit-outline" fullWidth onPress={saveNote}>
            Salva nota
          </PrimaryButton>
        }
      >
        <JournalSectionHeading
          icon="emoticon-outline"
          title="Come ti senti"
          description="Umore e una nota da tenere nel tempo."
        />
        <AppSegmentedControl
          value={mood}
          onValueChange={(next) => setMood(next as MoodLevel)}
          options={MOOD_OPTIONS}
        />
        <AppInputMultiline
          label="Note del giorno"
          value={note}
          onChangeText={setNote}
          rows={4}
          placeholder="Es. stamattina un po' di stanchezza, pressione nella norma…"
          accessibilityLabel="Note del giorno"
        />
        <AppDivider />
        <JournalSectionHeading
          icon="alert-circle-outline"
          title="Sintomo"
          description="Facoltativo — es. mal di testa, nausea, affanno."
        />
        <AppInput
          label="Sintomo"
          value={symptomLabel}
          onChangeText={setSymptomLabel}
          placeholder="Es. stanchezza"
          accessibilityLabel="Sintomo da registrare"
        />
        <SecondaryButton icon="plus" fullWidth onPress={saveSymptom}>
          Aggiungi sintomo
        </SecondaryButton>
      </JournalStripeCard>

      <YStack width="100%" gap="$3">
        <JournalSectionHeading
          icon="chart-line"
          title="Misurazioni recenti"
          description={
            measurements.length
              ? `${measurements.length} registrazioni nel diario.`
              : "Le misurazioni che registri compariranno qui."
          }
        />
        {measurements.length === 0 ? (
          <EmptyState
            title="Nessuna misurazione"
            description="Salva pressione, glicemia, peso o saturazione per vederle qui e nel PDF."
            icon={
              <MaterialCommunityIcons
                name="heart-pulse"
                size={28}
                color={pillappColors.onPrimary}
              />
            }
          />
        ) : (
          <XStack width="100%" flexWrap="wrap" gap="$3">
            {measurements.slice(0, 8).map((item) => (
              <MeasurementCard
                key={item.id}
                icon={MEASUREMENT_ICONS[item.kind]}
                label={item.label}
                value={item.value}
                unit={item.unit}
                hint={new Date(item.recordedAt).toLocaleString("it-IT", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              />
            ))}
          </XStack>
        )}
      </YStack>

      <YStack width="100%" gap="$3">
        <JournalSectionHeading
          icon="medical-bag"
          title="Sintomi recenti"
          description={
            symptoms.length
              ? `${symptoms.length} sintomi annotati.`
              : "I sintomi restano nel diario e nel PDF per il medico."
          }
        />
        {symptoms.length === 0 ? (
          <AppCard>
            <YStack padding="$4">
              <AppText variant="body" muted>
                Nessun sintomo registrato.
              </AppText>
            </YStack>
          </AppCard>
        ) : (
          <AppCard>
            <YStack width="100%" gap="$1" padding="$2">
              {symptoms.slice(0, 8).map((item) => (
                <XStack
                  key={item.id}
                  gap="$3"
                  alignItems="center"
                  paddingVertical="$2"
                  paddingHorizontal="$2"
                >
                  <YStack
                    width={36}
                    height={36}
                    borderRadius={18}
                    alignItems="center"
                    justifyContent="center"
                    backgroundColor="$secondarySoft"
                    flexShrink={0}
                  >
                    <MaterialCommunityIcons
                      name="alert-circle-outline"
                      size={18}
                      color={pillappColors.secondary}
                    />
                  </YStack>
                  <YStack flex={1} minWidth={0} gap="$0.5">
                    <AppText variant="bodyStrong">{item.label}</AppText>
                    <AppText variant="caption" muted>
                      {new Date(item.recordedAt).toLocaleString("it-IT", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </AppText>
                  </YStack>
                </XStack>
              ))}
            </YStack>
          </AppCard>
        )}
      </YStack>

      <YStack width="100%" gap="$3">
        <JournalSectionHeading
          icon="notebook-outline"
          title="Note diario"
          description="Storico delle tue annotazioni, pronto per il PDF."
        />
        {journalNotes.length === 0 ? (
          <EmptyState
            title="Nessuna nota"
            description="Scrivi come ti senti oggi per tenerne traccia nel tempo."
            icon={
              <MaterialCommunityIcons
                name="notebook-outline"
                size={28}
                color={pillappColors.onPrimary}
              />
            }
          />
        ) : (
          journalNotes.slice(0, 12).map((item) => (
            <JournalStripeCard key={item.id}>
              <XStack alignItems="center" justifyContent="space-between" gap="$3">
                <AppText variant="overline" color="primary">
                  {new Date(item.recordedAt).toLocaleString("it-IT", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </AppText>
                {item.mood ? (
                  <AppBadge
                    label={MOOD_LABELS[item.mood]}
                    tone={moodBadgeTone(item.mood)}
                  />
                ) : null}
              </XStack>
              <AppText variant="body">{item.text}</AppText>
            </JournalStripeCard>
          ))
        )}
      </YStack>

      <BrandIntroCard
        icon="file-pdf-box"
        title="Report per il medico"
        description="Crea un PDF con misurazioni, note, sintomi e terapia in corso. Potrai salvarlo sul telefono o inviarlo."
      >
        <PrimaryButton
          icon="share-variant"
          fullWidth
          loading={exporting}
          disabled={exporting}
          onPress={() => void exportPdf()}
          accessibilityHint="Genera un PDF e apre la condivisione del telefono"
        >
          {exporting ? "Preparazione PDF…" : "Salva e condividi PDF"}
        </PrimaryButton>
      </BrandIntroCard>

      <AppSnackbar
        visible={Boolean(snack)}
        message={snack}
        onDismiss={() => setSnack("")}
      />
    </AppScreen>
  );
}
