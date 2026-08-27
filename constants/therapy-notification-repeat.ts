export type TherapyNotificationRepeatId = "0" | "5" | "10";

export type TherapyNotificationRepeatOption = {
  id: TherapyNotificationRepeatId;
  label: string;
  minutes: number;
};

export const THERAPY_NOTIFICATION_REPEAT_OPTIONS: TherapyNotificationRepeatOption[] =
  [
    { id: "0", label: "Nessuna ripetizione", minutes: 0 },
    { id: "5", label: "Ogni 5 minuti", minutes: 5 },
    { id: "10", label: "Ogni 10 minuti", minutes: 10 },
  ];

export const DEFAULT_NOTIFICATION_REPEAT_ID: TherapyNotificationRepeatId = "5";

export function getTherapyNotificationRepeatMinutes(
  id: string | undefined,
): number {
  const match = THERAPY_NOTIFICATION_REPEAT_OPTIONS.find((option) => option.id === id);
  return match?.minutes ?? 5;
}
