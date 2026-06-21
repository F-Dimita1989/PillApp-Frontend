import { XStack, YStack } from "tamagui";

import { AppChip } from "@/components/ui/app-chip";
import { AppDivider } from "@/components/ui/app-divider";
import { AppInput } from "@/components/ui/app-input";
import { AppSegmentedControl } from "@/components/ui/app-segmented-control";
import { AppSwitch } from "@/components/ui/app-switch";
import { AppText } from "@/components/ui/app-text";
import { THERAPY_REMINDER_SOUNDS } from "@/constants/therapy-reminder-sounds";
import {
  normalizeOrariForTimesPerDay,
  type TherapyReminderSettingsValue,
} from "@/lib/therapy/reminder-settings";
import { THERAPY_DAYS, type TherapyDayKey } from "@/lib/therapy/types";

type TherapyReminderSettingsProps = {
  value: TherapyReminderSettingsValue;
  onChange: (value: TherapyReminderSettingsValue) => void;
  dose: string;
  onDoseChange: (dose: string) => void;
  readOnly?: boolean;
};

const TIMES_PER_DAY_OPTIONS = [
  { value: "1", label: "1×" },
  { value: "2", label: "2×" },
  { value: "3", label: "3×" },
  { value: "4", label: "4×" },
] as const;

export function TherapyReminderSettings({
  value,
  onChange,
  dose,
  onDoseChange,
  readOnly = false,
}: TherapyReminderSettingsProps) {
  const activeDaysCount = Object.values(value.dayPlan).filter(Boolean).length;

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
    orari[index] = orario;
    onChange({ ...value, orari });
  };

  const toggleDay = (day: TherapyDayKey) => {
    if (readOnly) return;
    onChange({
      ...value,
      dayPlan: { ...value.dayPlan, [day]: !value.dayPlan[day] },
    });
  };

  return (
    <YStack width="100%" gap="$3">
      <YStack width="100%" gap="$1" alignItems="center">
        <AppText variant="title" textAlign="center">
          Orario e promemoria
        </AppText>
        <AppText variant="body" muted textAlign="center">
          Imposta quante volte al giorno assumere il farmaco, a che ora e in quali giorni.
        </AppText>
      </YStack>

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

      <AppText variant="label">Orari</AppText>
      <YStack width="100%" gap="$3">
        {value.orari.slice(0, value.timesPerDay).map((orario, index) => (
          <AppInput
            key={`orario-${index}`}
            label={`Orario ${index + 1} (HH:mm)`}
            value={orario}
            onChangeText={(text) => setOrario(index, text)}
            placeholder={index === 0 ? "08:00" : "20:00"}
            keyboardType="numbers-and-punctuation"
            editable={!readOnly}
            accessibilityLabel={`Orario assunzione ${index + 1}`}
          />
        ))}
      </YStack>

      <AppInput
        label="Dose per assunzione"
        value={dose}
        onChangeText={onDoseChange}
        placeholder="1 compressa"
        editable={!readOnly}
        accessibilityLabel="Dose per ogni assunzione"
      />

      <AppDivider />

      <AppText variant="label">Giorni della settimana</AppText>
      <XStack width="100%" flexWrap="wrap" gap="$2" justifyContent="center">
        {THERAPY_DAYS.map((day) => (
          <AppChip
            key={day}
            label={day}
            selected={value.dayPlan[day]}
            disabled={readOnly}
            onPress={() => toggleDay(day)}
          />
        ))}
      </XStack>
      <AppText variant="caption" muted>
        Giorni attivi: {activeDaysCount}/7
      </AppText>

      <AppDivider />

      <AppSwitch
        label="Notifiche promemoria"
        description="Ricevi un avviso sugli orari programmati"
        value={value.notificationsEnabled}
        onValueChange={(notificationsEnabled) =>
          onChange({ ...value, notificationsEnabled })
        }
        disabled={readOnly}
        accessibilityLabel="Attiva o disattiva le notifiche promemoria"
      />

      {value.notificationsEnabled ? (
        <>
          <AppText variant="label">Suoneria notifica</AppText>
          <XStack width="100%" flexWrap="wrap" gap="$2">
            {THERAPY_REMINDER_SOUNDS.map((sound) => (
              <AppChip
                key={sound.id}
                label={sound.label}
                selected={value.notificationSoundId === sound.id}
                disabled={readOnly}
                onPress={() => onChange({ ...value, notificationSoundId: sound.id })}
                accessibilityLabel={`Suoneria ${sound.label}`}
              />
            ))}
          </XStack>
          <AppText variant="caption" muted>
            {
              THERAPY_REMINDER_SOUNDS.find(
                (sound) => sound.id === value.notificationSoundId,
              )?.description
            }
          </AppText>
        </>
      ) : null}
    </YStack>
  );
}
