import { buildDosesForToday, therapyDayPlanToDaysActive } from "@/lib/app-data/sync";
import {
  DEFAULT_PROFILE_PREFS,
  savePersistedAppData,
} from "@/lib/app-data/storage";
import {
  formatScannedMedicationNotes,
  mapUnitaToMedicationForm,
  type ScannedMedicationFormValues,
} from "@/lib/farmaci/form-values";
import { syncMedicationReminders } from "@/lib/notifications/medication-reminders";
import {
  normalizeOrariForTimesPerDay,
  type TherapyReminderSettingsValue,
} from "@/lib/therapy/reminder-settings";
import type { Medication } from "@/types/domain";

export type SetupTherapyMedication = {
  scanFormValues: ScannedMedicationFormValues;
  dose: string;
  reminderSettings: TherapyReminderSettingsValue;
};

function toMedication(item: SetupTherapyMedication, index: number): Medication {
  const { scanFormValues, dose, reminderSettings } = item;
  const orari = normalizeOrariForTimesPerDay(
    reminderSettings.timesPerDay,
    reminderSettings.orari,
  );

  return {
    id: `med-${scanFormValues.aic.trim() || `setup-${index}`}`,
    name: scanFormValues.nome.trim(),
    aic: scanFormValues.aic.trim() || undefined,
    form: mapUnitaToMedicationForm(scanFormValues.unitaQuantita),
    dose: dose.trim() || "1 dose",
    schedule: {
      times: orari.slice(0, reminderSettings.timesPerDay),
      daysActive: therapyDayPlanToDaysActive(reminderSettings.dayPlan),
    },
    notes: formatScannedMedicationNotes(scanFormValues) || undefined,
    quantityRemaining: scanFormValues.quantita.trim() || undefined,
    quantityUnit: scanFormValues.unitaQuantita,
    active: true,
    createdAt: new Date().toISOString(),
    source: scanFormValues.aic.trim() ? "aic_scan" : "manual",
  };
}

export async function saveSetupMedications(
  items: SetupTherapyMedication[],
): Promise<{ reminders: number; notificationWarning?: string }> {
  const medications = items.map(toMedication);
  const dosesToday = buildDosesForToday(medications);

  await savePersistedAppData({
    medications,
    dosesToday,
    measurements: [],
    symptoms: [],
    journalNotes: [],
    profilePrefs: DEFAULT_PROFILE_PREFS,
  });

  try {
    const reminders = await syncMedicationReminders(medications, true);
    return { reminders };
  } catch (notificationError) {
    return {
      reminders: 0,
      notificationWarning:
        notificationError instanceof Error
          ? notificationError.message
          : "Impossibile programmare i promemoria.",
    };
  }
}
