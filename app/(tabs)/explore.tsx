import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { YStack } from "tamagui";

import { MedicationQuantitySection } from "@/components/farmaci/medication-quantity-section";
import { TherapyReminderSettings } from "@/components/therapy/therapy-reminder-settings";
import { TherapyWeekCalendar } from "@/components/therapy-week-calendar";
import {
  AppCard,
  AppCardContent,
  AppHeader,
  AppInputMultiline,
  AppInput,
  AppScreen,
  AppSnackbar,
  AppText,
  PrimaryButton,
} from "@/components/ui";
import {
  buildScannedMedicationFormValues,
  type ScannedMedicationFormValues,
} from "@/lib/farmaci/form-values";
import {
  getTherapyPlan,
  saveTherapyPlan,
} from "@/lib/therapy/plan-storage";
import {
  INITIAL_THERAPY_REMINDER_SETTINGS,
  validateReminderSettings,
  type TherapyReminderSettingsValue,
} from "@/lib/therapy/reminder-settings";

const LAST_SCANNED_FARMACO_KEY = "pillapp:lastScannedFarmaco";

export default function TherapyUserScreen() {
  const [aic, setAic] = useState("");
  const [farmacoNome, setFarmacoNome] = useState("");
  const [scanFormValues, setScanFormValues] =
    useState<ScannedMedicationFormValues | null>(null);
  const [dose, setDose] = useState("1 compressa");
  const [note, setNote] = useState("");
  const [reminderSettings, setReminderSettings] =
    useState<TherapyReminderSettingsValue>(INITIAL_THERAPY_REMINDER_SETTINGS);
  const [saveMessage, setSaveMessage] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const isError = saveMessage.startsWith("Attenzione");

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const hydrateData = async () => {
        const [scannedRaw, savedPlan] = await Promise.all([
          AsyncStorage.getItem(LAST_SCANNED_FARMACO_KEY),
          getTherapyPlan(),
        ]);

        if (!isMounted) return;

        if (scannedRaw) {
          const parsed = JSON.parse(scannedRaw) as {
            aic?: string;
            data?: Record<string, unknown>;
          };
          if (parsed.aic && parsed.data) {
            const formValues = buildScannedMedicationFormValues(
              parsed.aic,
              parsed.data,
            );
            setScanFormValues(formValues);
            setAic(formValues.aic);
            setFarmacoNome(formValues.nome);
          }
        }

        if (savedPlan) {
          setAic(savedPlan.aic);
          setFarmacoNome(savedPlan.farmacoNome);
          setDose(savedPlan.dose);
          setNote(savedPlan.note);
          setScanFormValues((current) =>
            current
              ? {
                  ...current,
                  aic: savedPlan.aic,
                  nome: savedPlan.farmacoNome,
                  quantita: savedPlan.quantita,
                  unitaQuantita: savedPlan.unitaQuantita,
                }
              : {
                  aic: savedPlan.aic,
                  nome: savedPlan.farmacoNome,
                  marca: "",
                  principioAttivo: "",
                  quantita: savedPlan.quantita,
                  unitaQuantita: savedPlan.unitaQuantita,
                  dosaggio: "",
                  note: savedPlan.note,
                },
          );
          setReminderSettings({
            timesPerDay: savedPlan.timesPerDay,
            orari: savedPlan.orari,
            dayPlan: savedPlan.dayPlan,
            notificationsEnabled: savedPlan.notificationsEnabled,
            notificationSoundId: savedPlan.notificationSoundId,
          });
        }
      };

      void hydrateData();

      return () => {
        isMounted = false;
      };
    }, []),
  );

  const savePlan = async () => {
    const reminderError = validateReminderSettings(reminderSettings);
    if (reminderError) {
      setSaveMessage(`Attenzione: ${reminderError}`);
      setSnackbarVisible(true);
      return;
    }

    try {
      const result = await saveTherapyPlan({
        aic,
        farmacoNome,
        orari: reminderSettings.orari.slice(0, reminderSettings.timesPerDay),
        timesPerDay: reminderSettings.timesPerDay,
        dose,
        note,
        quantita: scanFormValues?.quantita.trim() ?? "",
        unitaQuantita: scanFormValues?.unitaQuantita ?? "pillole",
        dayPlan: reminderSettings.dayPlan,
        notificationsEnabled: reminderSettings.notificationsEnabled,
        notificationSoundId: reminderSettings.notificationSoundId,
      });

      if (result.calendarWarning) {
        setSaveMessage(
          `Piano salvato. Promemoria: ${result.reminders}. Calendario: ${result.calendarWarning}`,
        );
      } else {
        setSaveMessage(
          `Piano salvato. Promemoria: ${result.reminders}. Eventi nel calendario del telefono: ${result.calendarEvents}.`,
        );
      }
      setSnackbarVisible(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Errore salvataggio terapia.";
      setSaveMessage(`Attenzione: ${message}`);
      setSnackbarVisible(true);
    }
  };

  const activeDays =
    Object.values(reminderSettings.dayPlan).filter(Boolean).length;

  return (
    <AppScreen>
      <AppHeader
        title="Terapia Utente"
        subtitle="Programma la terapia e visualizza la settimana dal calendario reale del telefono."
      />

      <AppCard variant="elevated">
        <AppCardContent>
          <AppText variant="title">Farmaco</AppText>
          <AppInput
            label="Codice AIC"
            value={aic}
            onChangeText={setAic}
            accessibilityLabel="Codice AIC del farmaco"
          />
          <AppInput
            label="Nome farmaco"
            value={farmacoNome}
            onChangeText={setFarmacoNome}
            accessibilityLabel="Nome del farmaco"
          />
        </AppCardContent>
      </AppCard>

      {scanFormValues ? (
        <AppCard variant="elevated">
          <AppCardContent>
            <MedicationQuantitySection
              values={scanFormValues}
              onChange={setScanFormValues}
            />
          </AppCardContent>
        </AppCard>
      ) : null}

      <AppCard variant="elevated">
        <AppCardContent>
          <AppText variant="title">Orario e promemoria</AppText>
          <TherapyReminderSettings
            value={reminderSettings}
            onChange={setReminderSettings}
            dose={dose}
            onDoseChange={setDose}
          />
          <AppInputMultiline
            label="Note utili (facoltative)"
            value={note}
            onChangeText={setNote}
            rows={3}
            accessibilityLabel="Note aggiuntive sulla terapia"
          />
        </AppCardContent>
      </AppCard>

      <AppCard variant="elevated">
        <AppCardContent>
          <TherapyWeekCalendar
            dayPlan={reminderSettings.dayPlan}
            onToggleDay={(day) =>
              setReminderSettings((current) => ({
                ...current,
                dayPlan: { ...current.dayPlan, [day]: !current.dayPlan[day] },
              }))
            }
          />
          <AppText variant="caption" muted>
            Giorni terapia attivi: {activeDays}/7
          </AppText>
        </AppCardContent>
      </AppCard>

      <YStack width="100%" paddingTop="$2">
        <PrimaryButton
          icon="content-save"
          onPress={() => void savePlan()}
          fullWidth
          accessibilityLabel="Salva piano settimanale"
        >
          Salva piano settimanale
        </PrimaryButton>
      </YStack>

      <AppSnackbar
        visible={snackbarVisible && Boolean(saveMessage)}
        message={saveMessage}
        onDismiss={() => setSnackbarVisible(false)}
        variant={isError ? "error" : "default"}
      />
    </AppScreen>
  );
}
