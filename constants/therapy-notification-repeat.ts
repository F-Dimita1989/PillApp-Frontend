/**
 * Legacy: la ripetizione a minuti è stata sostituita dai reminder di conferma
 * ogni ora dopo l'orario di assunzione. Il campo resta per i dati già salvati.
 */
export type TherapyNotificationRepeatId = "0" | "5" | "10";

export const DEFAULT_NOTIFICATION_REPEAT_ID: TherapyNotificationRepeatId = "5";
