import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  EMPTY_APP_STATE,
  hydrateAppState,
  toPersistedData,
} from "@/lib/app-data/hydrate";
import type { AppDataState } from "@/lib/app-data/types";
import { savePersistedAppData, mergeDoseStatuses } from "@/lib/app-data/storage";
import { buildDosesForToday } from "@/lib/app-data/sync";
import {
  cancelAllMedicationReminders,
  syncMedicationReminders,
} from "@/lib/notifications/medication-reminders";
import type {
  DoseEvent,
  DoseStatus,
  JournalNote,
  MeasurementEntry,
  Medication,
  SymptomEntry,
  UserProfile,
} from "@/types/domain";

type AppDataAction =
  | { type: "HYDRATE"; state: AppDataState }
  | { type: "UPDATE_DOSE_STATUS"; doseId: string; status: DoseStatus; note?: string }
  | { type: "ADD_MEDICATION"; medication: Medication }
  | { type: "UPDATE_MEDICATION"; medication: Medication }
  | { type: "ADD_MEASUREMENT"; entry: MeasurementEntry }
  | { type: "ADD_SYMPTOM"; entry: SymptomEntry }
  | { type: "ADD_JOURNAL_NOTE"; entry: JournalNote }
  | { type: "UPDATE_PROFILE"; profile: Partial<UserProfile> };

function withRecalculatedDoses(
  state: AppDataState,
  medications: Medication[],
): AppDataState {
  const generated = buildDosesForToday(medications);
  return {
    ...state,
    medications,
    dosesToday: mergeDoseStatuses(generated, state.dosesToday),
  };
}

function appDataReducer(state: AppDataState, action: AppDataAction): AppDataState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;
    case "UPDATE_DOSE_STATUS":
      return {
        ...state,
        dosesToday: state.dosesToday.map((dose) =>
          dose.id === action.doseId
            ? {
                ...dose,
                status: action.status,
                note: action.note ?? dose.note,
                confirmedAt:
                  action.status === "taken" || action.status === "skipped"
                    ? new Date().toISOString()
                    : dose.confirmedAt,
              }
            : dose,
        ),
      };
    case "ADD_MEDICATION":
      return withRecalculatedDoses(state, [...state.medications, action.medication]);
    case "UPDATE_MEDICATION":
      return withRecalculatedDoses(
        state,
        state.medications.map((m) =>
          m.id === action.medication.id ? action.medication : m,
        ),
      );
    case "ADD_MEASUREMENT":
      return { ...state, measurements: [action.entry, ...state.measurements] };
    case "ADD_SYMPTOM":
      return { ...state, symptoms: [action.entry, ...state.symptoms] };
    case "ADD_JOURNAL_NOTE":
      return { ...state, journalNotes: [action.entry, ...state.journalNotes] };
    case "UPDATE_PROFILE":
      return { ...state, profile: { ...state.profile, ...action.profile } };
    default:
      return state;
  }
}

type AppDataContextValue = AppDataState & {
  isReady: boolean;
  markDoseTaken: (doseId: string) => void;
  markDoseSkipped: (doseId: string, note?: string) => void;
  snoozeDose: (doseId: string) => void;
  addMedication: (medication: Medication) => void;
  updateMedication: (medication: Medication) => void;
  addMeasurement: (entry: MeasurementEntry) => void;
  addSymptom: (entry: SymptomEntry) => void;
  addJournalNote: (entry: JournalNote) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  getMedicationById: (id: string) => Medication | undefined;
  adherenceToday: { taken: number; total: number; percentage: number };
  nextDose: DoseEvent | null;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

const DOSE_PRIORITY: Record<DoseStatus, number> = {
  overdue: 0,
  due_soon: 1,
  snoozed: 2,
  pending: 3,
  taken: 4,
  skipped: 5,
};

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appDataReducer, EMPTY_APP_STATE);
  const [isReady, setIsReady] = useState(false);
  const skipPersistRef = useRef(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const hydrated = await hydrateAppState();
        if (active) {
          dispatch({ type: "HYDRATE", state: hydrated });
        }
      } finally {
        if (active) {
          skipPersistRef.current = false;
          setIsReady(true);
        }
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (skipPersistRef.current || !isReady) return;
    void savePersistedAppData(toPersistedData(state));
  }, [state, isReady]);

  useEffect(() => {
    const sync = async () => {
      try {
        if (state.profile.notificationsEnabled) {
          await syncMedicationReminders(state.medications, true);
        } else {
          await cancelAllMedicationReminders();
        }
      } catch {
        /* permesso negato o errore scheduling — gestito dal Profilo */
      }
    };
    if (isReady) {
      void sync();
    }
  }, [state.medications, state.profile.notificationsEnabled, isReady]);

  const markDoseTaken = useCallback((doseId: string) => {
    dispatch({ type: "UPDATE_DOSE_STATUS", doseId, status: "taken" });
  }, []);

  const markDoseSkipped = useCallback((doseId: string, note?: string) => {
    dispatch({ type: "UPDATE_DOSE_STATUS", doseId, status: "skipped", note });
  }, []);

  const snoozeDose = useCallback((doseId: string) => {
    dispatch({ type: "UPDATE_DOSE_STATUS", doseId, status: "snoozed" });
  }, []);

  const addMedication = useCallback((medication: Medication) => {
    dispatch({ type: "ADD_MEDICATION", medication });
  }, []);

  const updateMedication = useCallback((medication: Medication) => {
    dispatch({ type: "UPDATE_MEDICATION", medication });
  }, []);

  const addMeasurement = useCallback((entry: MeasurementEntry) => {
    dispatch({ type: "ADD_MEASUREMENT", entry });
  }, []);

  const addSymptom = useCallback((entry: SymptomEntry) => {
    dispatch({ type: "ADD_SYMPTOM", entry });
  }, []);

  const addJournalNote = useCallback((entry: JournalNote) => {
    dispatch({ type: "ADD_JOURNAL_NOTE", entry });
  }, []);

  const updateProfile = useCallback((profile: Partial<UserProfile>) => {
    dispatch({ type: "UPDATE_PROFILE", profile });
  }, []);

  const getMedicationById = useCallback(
    (id: string) => state.medications.find((m) => m.id === id),
    [state.medications],
  );

  const adherenceToday = useMemo(() => {
    const total = state.dosesToday.length;
    const taken = state.dosesToday.filter((d) => d.status === "taken").length;
    return {
      taken,
      total,
      percentage: total ? Math.round((taken / total) * 100) : 0,
    };
  }, [state.dosesToday]);

  const nextDose = useMemo(() => {
    const active = state.dosesToday.filter(
      (d) => d.status !== "taken" && d.status !== "skipped",
    );
    if (!active.length) return null;
    return [...active].sort((a, b) => {
      const p = DOSE_PRIORITY[a.status] - DOSE_PRIORITY[b.status];
      if (p !== 0) return p;
      return a.scheduledTime.localeCompare(b.scheduledTime);
    })[0];
  }, [state.dosesToday]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      ...state,
      isReady,
      markDoseTaken,
      markDoseSkipped,
      snoozeDose,
      addMedication,
      updateMedication,
      addMeasurement,
      addSymptom,
      addJournalNote,
      updateProfile,
      getMedicationById,
      adherenceToday,
      nextDose,
    }),
    [
      state,
      isReady,
      markDoseTaken,
      markDoseSkipped,
      snoozeDose,
      addMedication,
      updateMedication,
      addMeasurement,
      addSymptom,
      addJournalNote,
      updateProfile,
      getMedicationById,
      adherenceToday,
      nextDose,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error("useAppData deve essere usato dentro AppDataProvider");
  }
  return ctx;
}
