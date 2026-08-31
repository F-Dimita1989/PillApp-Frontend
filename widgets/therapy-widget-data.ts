import { loadPersistedAppData, mergeDoseStatuses } from "@/lib/app-data/storage";
import { buildDosesForToday } from "@/lib/app-data/sync";
import type { DoseEvent } from "@/types/domain";

export type TherapyWidgetData = {
  doses: DoseEvent[];
  takenCount: number;
  hasActiveMedications: boolean;
};

const EMPTY_DATA: TherapyWidgetData = {
  doses: [],
  takenCount: 0,
  hasActiveMedications: false,
};

/**
 * Il widget gira in un task headless senza il provider React: legge lo storage
 * e ricalcola le dosi del giorno con la stessa logica della Home.
 */
export async function loadTherapyWidgetData(): Promise<TherapyWidgetData> {
  try {
    const persisted = await loadPersistedAppData();
    if (!persisted) return EMPTY_DATA;

    const doses = mergeDoseStatuses(
      buildDosesForToday(persisted.medications),
      persisted.dosesToday,
    );

    return {
      doses,
      takenCount: doses.filter((dose) => dose.status === "taken").length,
      hasActiveMedications: persisted.medications.some((med) => med.active),
    };
  } catch {
    return EMPTY_DATA;
  }
}
