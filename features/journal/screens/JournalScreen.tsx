import { useState } from "react";
import { XStack, YStack } from "tamagui";

import {
  AppCard,
  AppCardActions,
  AppCardContent,
  AppHeader,
  AppInputMultiline,
  AppScreen,
  AppSegmentedControl,
  AppSnackbar,
  AppText,
  AppTextField,
  MeasurementCard,
  PrimaryButton,
  SecondaryButton,
  SectionTitle,
} from "@/components/ui";
import { useAppData } from "@/features/store/app-data-context";
import type { MeasurementKind, MoodLevel } from "@/types/domain";
import { MEASUREMENT_LABELS } from "@/types/domain";

const MOOD_OPTIONS: { value: MoodLevel; label: string }[] = [
  { value: "ottimo", label: "Ottimo" },
  { value: "buono", label: "Buono" },
  { value: "cosi_cosi", label: "Così così" },
  { value: "male", label: "Male" },
  { value: "pessimo", label: "Pessimo" },
];

export function JournalScreen() {
  const { measurements, symptoms, journalNotes, addMeasurement, addSymptom, addJournalNote } =
    useAppData();

  const [kind, setKind] = useState<MeasurementKind>("pressure");
  const [value, setValue] = useState("");
  const [symptomLabel, setSymptomLabel] = useState("");
  const [note, setNote] = useState("");
  const [mood, setMood] = useState<MoodLevel>("buono");
  const [snack, setSnack] = useState("");

  const saveMeasurement = () => {
    if (!value.trim()) return;
    addMeasurement({
      id: `meas-${Date.now()}`,
      kind,
      label: MEASUREMENT_LABELS[kind],
      value: value.trim(),
      unit: kind === "pressure" ? "mmHg" : kind === "glucose" ? "mg/dL" : kind === "weight" ? "kg" : "%",
      recordedAt: new Date().toISOString(),
    });
    setValue("");
    setSnack("Misurazione registrata");
  };

  const saveSymptom = () => {
    if (!symptomLabel.trim()) return;
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
    if (!note.trim()) return;
    addJournalNote({
      id: `note-${Date.now()}`,
      mood,
      text: note.trim(),
      recordedAt: new Date().toISOString(),
    });
    setNote("");
    setSnack("Nota salvata nel diario");
  };

  return (
    <AppScreen>
      <AppHeader
        title="Diario salute"
        subtitle="Registra pressione, glicemia, peso, sintomi e come ti senti oggi."
      />

      <AppCard variant="elevated">
        <AppCardContent>
          <AppText variant="title">Nuova misurazione</AppText>
          <AppSegmentedControl
            value={kind}
            onValueChange={(v) => setKind(v as MeasurementKind)}
            options={[
              { value: "pressure", label: "Pressione" },
              { value: "glucose", label: "Glicemia" },
              { value: "weight", label: "Peso" },
              { value: "saturation", label: "Sat." },
            ]}
          />
          <AppTextField
            label="Valore"
            value={value}
            onChangeText={setValue}
            keyboardType="decimal-pad"
            accessibilityLabel={`Valore ${MEASUREMENT_LABELS[kind]}`}
          />
        </AppCardContent>
        <AppCardActions>
          <PrimaryButton icon="content-save" fullWidth onPress={saveMeasurement}>
            Salva misurazione
          </PrimaryButton>
        </AppCardActions>
      </AppCard>

      <AppCard variant="elevated">
        <AppCardContent>
          <AppText variant="title">Sintomi e umore</AppText>
          <AppTextField
            label="Sintomo (es. stanchezza)"
            value={symptomLabel}
            onChangeText={setSymptomLabel}
          />
          <SecondaryButton icon="plus" fullWidth onPress={saveSymptom}>
            Aggiungi sintomo
          </SecondaryButton>
          <AppSegmentedControl
            value={mood}
            onValueChange={(v) => setMood(v as MoodLevel)}
            options={MOOD_OPTIONS.map((m) => ({ value: m.value, label: m.label }))}
          />
          <AppInputMultiline
            label="Note del giorno"
            value={note}
            onChangeText={setNote}
            rows={4}
            accessibilityLabel="Note del giorno"
          />
        </AppCardContent>
        <AppCardActions>
          <PrimaryButton icon="notebook-edit-outline" fullWidth onPress={saveNote}>
            Salva nota
          </PrimaryButton>
        </AppCardActions>
      </AppCard>

      <YStack width="100%" gap="$3">
        <SectionTitle title="Misurazioni recenti" />
        <XStack width="100%" flexWrap="wrap" gap="$3">
          {measurements.slice(0, 4).map((m) => (
            <MeasurementCard
              key={m.id}
              label={m.label}
              value={m.value}
              unit={m.unit}
              hint={new Date(m.recordedAt).toLocaleDateString("it-IT")}
            />
          ))}
        </XStack>
      </YStack>

      <YStack width="100%" gap="$3">
        <SectionTitle title="Sintomi recenti" />
        {symptoms.length === 0 ? (
          <AppText variant="body" muted>
            Nessun sintomo registrato.
          </AppText>
        ) : (
          symptoms.slice(0, 5).map((s) => (
            <AppText key={s.id} variant="body">
              · {s.label} — {new Date(s.recordedAt).toLocaleDateString("it-IT")}
            </AppText>
          ))
        )}
      </YStack>

      <YStack width="100%" gap="$3">
        <SectionTitle
          title="Note diario"
          description="Predisposto per futuri grafici e report PDF."
        />
        {journalNotes.map((n) => (
          <AppCard key={n.id} variant="outlined">
            <AppCardContent>
              <YStack gap="$2">
                <AppText variant="label" color="primary">
                  {n.mood ? `Umore: ${n.mood.replace("_", " ")}` : "Nota"}
                </AppText>
                <AppText variant="body">{n.text}</AppText>
                <AppText variant="caption" muted>
                  {new Date(n.recordedAt).toLocaleString("it-IT")}
                </AppText>
              </YStack>
            </AppCardContent>
          </AppCard>
        ))}
      </YStack>

      <AppSnackbar
        visible={Boolean(snack)}
        message={snack}
        onDismiss={() => setSnack("")}
      />
    </AppScreen>
  );
}
