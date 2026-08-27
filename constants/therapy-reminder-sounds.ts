export type TherapyReminderSoundId = "default" | "soft" | "alert";

export type TherapyReminderSoundOption = {
  id: TherapyReminderSoundId;
  label: string;
  description: string;
  channelId: string;
  fileName: string;
  vibrationPattern: number[];
};

/**
 * Nomi file: solo minuscole, numeri e underscore.
 * Android non accetta i trattini in res/raw (altrimenti usa il suono di sistema).
 * I channelId vanno bumpati se cambia il file: Android non aggiorna il suono di un canale esistente.
 */
export const THERAPY_REMINDER_SOUNDS: TherapyReminderSoundOption[] = [
  {
    id: "default",
    label: "Campanello PillApp",
    description: "Due note chiare, facili da riconoscere",
    channelId: "therapy-reminders-v4-default",
    fileName: "pillapp_default.wav",
    vibrationPattern: [0, 250, 250, 250],
  },
  {
    id: "soft",
    label: "Suono delicato",
    description: "Tono basso e vibrazione leggera",
    channelId: "therapy-reminders-v4-soft",
    fileName: "pillapp_soft.wav",
    vibrationPattern: [0, 120, 80, 120],
  },
  {
    id: "alert",
    label: "Suono di attenzione",
    description: "Più evidente per non dimenticare",
    channelId: "therapy-reminders-v4-alert",
    fileName: "pillapp_alert.wav",
    vibrationPattern: [0, 400, 200, 400, 200, 400],
  },
];

export const SILENT_REMINDER_CHANNEL_ID = "therapy-reminders-v4-silent";

export function getTherapyReminderSound(
  soundId: string,
): TherapyReminderSoundOption {
  return (
    THERAPY_REMINDER_SOUNDS.find((option) => option.id === soundId) ??
    THERAPY_REMINDER_SOUNDS[0]
  );
}
