import * as Notifications from "expo-notifications";

/** Nessun trattino: su iOS i caratteri : e - rompono le categorie. */
export const DOSE_REMINDER_CATEGORY_ID = "doseReminder";

export const CONFIRM_DOSE_ACTION_ID = "confirmDose";

export async function registerDoseReminderCategory(): Promise<void> {
  await Notifications.setNotificationCategoryAsync(DOSE_REMINDER_CATEGORY_ID, [
    {
      identifier: CONFIRM_DOSE_ACTION_ID,
      buttonTitle: "Conferma assunzione",
      options: {
        opensAppToForeground: true,
      },
    },
  ]);
}
