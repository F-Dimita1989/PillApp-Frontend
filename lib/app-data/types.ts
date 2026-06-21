import type {
  DoseEvent,
  JournalNote,
  MeasurementEntry,
  Medication,
  SymptomEntry,
  UserProfile,
} from "@/types/domain";

export type AppDataState = {
  profile: UserProfile;
  medications: Medication[];
  dosesToday: DoseEvent[];
  measurements: MeasurementEntry[];
  symptoms: SymptomEntry[];
  journalNotes: JournalNote[];
};
