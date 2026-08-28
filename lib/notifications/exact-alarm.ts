import { Platform } from "react-native";

import {
  canScheduleExactAlarms,
  requestExactAlarmPermission,
} from "@/modules/exact-alarm";

export { canScheduleExactAlarms };

/**
 * Android 12+: senza allarmi esatti il sistema può ritardare i promemoria di minuti.
 * Se `prompt` è true e il permesso manca, apre la schermata di sistema.
 */
export async function ensureExactAlarms(options?: {
  prompt?: boolean;
}): Promise<boolean> {
  if (Platform.OS !== "android") {
    return true;
  }

  if (await canScheduleExactAlarms()) {
    return true;
  }

  if (options?.prompt) {
    await requestExactAlarmPermission();
    return canScheduleExactAlarms();
  }

  return false;
}
