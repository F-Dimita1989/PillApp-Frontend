import type { ScannedMedicationFormValues } from "@/lib/farmaci/form-values";
import type { TherapyReminderSettingsValue } from "@/lib/therapy/reminder-settings";
import { INITIAL_THERAPY_DAY_PLAN } from "@/lib/therapy/types";

/** Esempio Tachipirina — stessa struttura del form post-scansione. */
export const THERAPY_FORM_PREVIEW: ScannedMedicationFormValues = {
  aic: "012745168",
  nome: "Tachipirina 500 mg compresse",
  marca: "Angelini Pharma S.p.A.",
  principioAttivo: "Paracetamolo",
  quantita: "30",
  unitaQuantita: "pillole",
  dosaggio: "500 mg",
  note: "",
};

export const THERAPY_REMINDER_PREVIEW: TherapyReminderSettingsValue = {
  timesPerDay: 2,
  orari: ["08:00", "20:00"],
  dayPlan: INITIAL_THERAPY_DAY_PLAN,
  notificationsEnabled: true,
  notificationSoundId: "default",
};

export const THERAPY_DOSE_PREVIEW = "1 compressa";
