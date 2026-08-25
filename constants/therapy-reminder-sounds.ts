export type TherapyReminderSoundId = "default" | "soft" | "alert";

export type TherapyReminderSoundOption = {
  id: TherapyReminderSoundId;
  label: string;
  description: string;
  channelId: string;
  fileName: string;
  vibrationPattern: number[];
};

export const THERAPY_REMINDER_SOUNDS: TherapyReminderSoundOption[] = [
  {
    id: "default",
    label: "Campanello PillApp",
    description: "Due note chiare, facili da riconoscere",
    channelId: "therapy-reminders-v2-default",
    fileName: "pillapp-default.wav",
    vibrationPattern: [0, 250, 250, 250],
  },
  {
    id: "soft",
    label: "Suono delicato",
    description: "Tono basso e vibrazione leggera",
    channelId: "therapy-reminders-v2-soft",
    fileName: "pillapp-soft.wav",
    vibrationPattern: [0, 120, 80, 120],
  },
  {
    id: "alert",
    label: "Suono di attenzione",
    description: "Più evidente per non dimenticare",
    channelId: "therapy-reminders-v2-alert",
    fileName: "pillapp-alert.wav",
    vibrationPattern: [0, 400, 200, 400, 200, 400],
  },
];

export const SILENT_REMINDER_CHANNEL_ID = "therapy-reminders-v2-silent";

export function getTherapyReminderSound(
  soundId: string,
): TherapyReminderSoundOption {
  return (
    THERAPY_REMINDER_SOUNDS.find((option) => option.id === soundId) ??
    THERAPY_REMINDER_SOUNDS[0]
  );
}
