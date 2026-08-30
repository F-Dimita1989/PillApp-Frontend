import { useMemo, useState } from "react";
import { YStack } from "tamagui";

import { SecondaryButton } from "@/components/ui/app-button";
import { AppDivider } from "@/components/ui/app-divider";
import { AppMultiSelect } from "@/components/ui/app-multi-select";
import { AppSegmentedControl } from "@/components/ui/app-segmented-control";
import { AppSelect } from "@/components/ui/app-select";
import { AppSwitch } from "@/components/ui/app-switch";
import { AppText } from "@/components/ui/app-text";
import {
  THERAPY_NOTIFICATION_LEAD_OPTIONS,
  type TherapyNotificationLeadId,
} from "@/constants/therapy-notification-lead";
import { THERAPY_REMINDER_SOUNDS } from "@/constants/therapy-reminder-sounds";
import {
  nearestTherapyDoseOption,
  therapyDoseOptionsForUnit,
} from "@/lib/therapy/dose-options";
import {
  normalizeOrariForTimesPerDay,
  type TherapyReminderSettingsValue,
} from "@/lib/therapy/reminder-settings";
import {
  nearestTherapyTimeOption,
  THERAPY_TIME_OPTIONS,
} from "@/lib/therapy/time-options";
import { THERAPY_DAYS, type TherapyDayKey } from "@/lib/therapy/types";
import { previewReminderSound } from "@/lib/notifications/preview-sound";
import type { QuantitaUnit } from "@/types/domain";

type TherapyReminderSettingsProps = {
  value: TherapyReminderSettingsValue;
  onChange: (value: TherapyReminderSettingsValue) => void;
  dose: string;
  onDoseChange: (dose: string) => void;
  unitaQuantita?: QuantitaUnit;
  readOnly?: boolean;
  hideIntro?: boolean;
  showNotificationSettings?: boolean;
};

const TIMES_PER_DAY_OPTIONS = [
  { value: "1", label: "1×" },
  { value: "2", label: "2×" },
  { value: "3", label: "3×" },
  { value: "4", label: "4×" },
] as const;

const DAY_OPTIONS = THERAPY_DAYS.map((day) => ({
  value: day,
  label: day,
}));

function therapyDayPlanToValues(dayPlan: TherapyReminderSettingsValue["dayPlan"]) {
  return THERAPY_DAYS.filter((day) => dayPlan[day]);
}

function therapyValuesToDayPlan(values: string[]): TherapyReminderSettingsValue["dayPlan"] {
  const set = new Set(values);
  return THERAPY_DAYS.reduce(
    (plan, day) => ({
      ...plan,
      [day]: set.has(day),
    }),
    {} as TherapyReminderSettingsValue["dayPlan"],
  );
}

export function TherapyReminderSettings({
  value,
  onChange,
  dose,
  onDoseChange,
  unitaQuantita = "pillole",
  readOnly = false,
  hideIntro = false,
  showNotificationSettings = true,
}: TherapyReminderSettingsProps) {
  const doseOptions = useMemo(
    () => therapyDoseOptionsForUnit(unitaQuantita),
    [unitaQuantita],
  );
  const selectedDose = nearestTherapyDoseOption(dose, unitaQuantita);
  const selectedDays = therapyDayPlanToValues(value.dayPlan);

  const setTimesPerDay = (timesPerDay: number) => {
    if (readOnly) return;
    onChange({
      ...value,
      timesPerDay,
      orari: normalizeOrariForTimesPerDay(timesPerDay, value.orari),
    });
  };

  const setOrario = (index: number, orario: string) => {
    if (readOnly) return;
    const orari = [...value.orari];
    orari[index] = nearestTherapyTimeOption(orario);
    onChange({ ...value, orari });
  };

  const setDayValues = (days: string[]) => {
    if (readOnly) return;
    onChange({
      ...value,
      dayPlan: therapyValuesToDayPlan(days as TherapyDayKey[]),
    });
  };

  const [previewingSoundId, setPreviewingSoundId] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState("");

  const playSoundPreview = async (soundId: string) => {
    if (readOnly) return;
    setPreviewError("");
    setPreviewingSoundId(soundId);
    try {
      await previewReminderSound(soundId, true);
    } catch (error) {
      setPreviewError(
        error instanceof Error ? error.message : "Impossibile provare la suoneria.",
      );
    } finally {
      setPreviewingSoundId(null);
    }
  };

  return (
    <YStack width="100%" gap="$3">
      {hideIntro ? null : (
        <YStack width="100%" gap="$1" alignItems="center">
          <AppText variant="title" textAlign="center">
            Orario e promemoria
          </AppText>
          <AppText variant="body" muted textAlign="center">
            Scegli dosaggio, orari e giorni. Puoi attivare le notifiche e personalizzare
            suoneria e anticipo.
          </AppText>
        </YStack>
      )}

      <AppSelect
        label="Dosaggio per assunzione"
        value={selectedDose}
        options={doseOptions}
        onValueChange={onDoseChange}
        disabled={readOnly}
        accessibilityLabel="Dosaggio per ogni assunzione"
      />

      <YStack width="100%" gap="$2">
        <AppText variant="label">Assunzioni al giorno</AppText>
        <AppSegmentedControl
          value={String(value.timesPerDay)}
          onValueChange={(next) => {
            if (next && !readOnly) setTimesPerDay(Number(next));
          }}
          options={TIMES_PER_DAY_OPTIONS.map((option) => ({
            ...option,
            disabled: readOnly,
          }))}
        />
      </YStack>

      <YStack width="100%" gap="$3">
        {value.orari.slice(0, value.timesPerDay).map((orario, index) => (
          <AppSelect
            key={`orario-${index}`}
            label={`Orario ${index + 1}`}
            value={nearestTherapyTimeOption(orario)}
            options={THERAPY_TIME_OPTIONS}
            onValueChange={(next) => setOrario(index, next)}
            disabled={readOnly}
            accessibilityLabel={`Orario assunzione ${index + 1}`}
          />
        ))}
      </YStack>

      <AppMultiSelect
        label="Giorni della settimana"
        values={selectedDays}
        options={DAY_OPTIONS}
        onValuesChange={setDayValues}
        placeholder="Seleziona i giorni"
        disabled={readOnly}
        accessibilityLabel="Giorni della settimana per il promemoria"
      />
      <AppText variant="caption" muted>
        Giorni attivi: {selectedDays.length}/7
      </AppText>

      {showNotificationSettings ? (
        <>
          <AppDivider />

          <AppSwitch
            label="Notifiche promemoria"
            description="Avviso in anticipo e, dopo l'orario, un reminder ogni ora finché non confermi — anche a app chiusa"
            value={value.notificationsEnabled}
            onValueChange={(notificationsEnabled) =>
              onChange({ ...value, notificationsEnabled })
            }
            disabled={readOnly}
            accessibilityLabel="Attiva o disattiva le notifiche promemoria"
          />

          {value.notificationsEnabled ? (
            <>
              <AppSelect
                label="Anticipo notifica"
                value={value.notificationLeadId}
                options={THERAPY_NOTIFICATION_LEAD_OPTIONS.map((option) => ({
                  value: option.id,
                  label: option.label,
                }))}
                onValueChange={(notificationLeadId) =>
                  onChange({
                    ...value,
                    notificationLeadId: notificationLeadId as TherapyNotificationLeadId,
                  })
                }
                disabled={readOnly}
                accessibilityLabel="Quanto tempo prima ricevere la notifica"
              />

              <AppText variant="caption" muted>
                Dopo l'orario di assunzione PillApp insiste ogni ora, fino alle 22,
                chiedendo di confermare. Si ferma quando confermi o salti la dose.
              </AppText>

              <AppSelect
                label="Suoneria notifica"
                value={value.notificationSoundId}
                options={THERAPY_REMINDER_SOUNDS.map((sound) => ({
                  value: sound.id,
                  label: sound.label,
                  description: sound.description,
                }))}
                onValueChange={(notificationSoundId) => {
                  onChange({
                    ...value,
                    notificationSoundId:
                      notificationSoundId as TherapyReminderSettingsValue["notificationSoundId"],
                  });
                  void playSoundPreview(notificationSoundId);
                }}
                onPreviewOption={(soundId) => void playSoundPreview(soundId)}
                previewingOption={previewingSoundId}
                disabled={readOnly}
                accessibilityLabel="Suoneria del promemoria"
              />
              {previewError ? (
                <AppText variant="caption" color="error">
                  {previewError}
                </AppText>
              ) : (
                <AppText variant="caption" muted>
                  Tocca play per ascoltare, o scegli una suoneria: la prova parte subito.
                </AppText>
              )}
              <SecondaryButton
                icon="play"
                fullWidth
                loading={previewingSoundId === value.notificationSoundId}
                disabled={readOnly}
                onPress={() => void playSoundPreview(value.notificationSoundId)}
                accessibilityLabel="Prova la suoneria selezionata"
              >
                Prova suoneria
              </SecondaryButton>
            </>
          ) : null}
        </>
      ) : null}
    </YStack>
  );
}
