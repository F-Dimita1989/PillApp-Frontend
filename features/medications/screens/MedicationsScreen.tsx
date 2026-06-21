import { useRouter } from "expo-router";
import { YStack } from "tamagui";

import {
  AppHeader,
  AppScreen,
  EmptyState,
  MedicationCard,
  PrimaryButton,
  SectionHeader,
} from "@/components/ui";
import { useAppData } from "@/features/store/app-data-context";
import { AppRoutes } from "@/features/navigation/routes";
import { MEDICATION_FORM_LABELS } from "@/types/domain";

export function MedicationsScreen() {
  const router = useRouter();
  const { medications, dosesToday } = useAppData();

  const activeMeds = medications.filter((m) => m.active);

  const getNextTime = (medId: string) => {
    const pending = dosesToday
      .filter((d) => d.medicationId === medId && d.status !== "taken" && d.status !== "skipped")
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    return pending[0]?.scheduledTime;
  };

  return (
    <AppScreen contentStyle={{ paddingBottom: 24 }}>
      <AppHeader
        title="I miei farmaci"
        subtitle="Gestisci terapia, dosi e promemoria. Puoi aggiungere farmaci scansionando il codice AIC."
      />

      <SectionHeader
        title={`Farmaci attivi (${activeMeds.length})`}
        description="Tocca un farmaco per vedere orari, note e storico."
      />

      {activeMeds.length === 0 ? (
        <EmptyState
          title="Nessun farmaco registrato"
          description="Scansiona il codice AIC sulla confezione oppure inserisci i dati manualmente."
          actionLabel="Scansiona codice AIC"
          onAction={() => router.push(AppRoutes.scan)}
        />
      ) : (
        <YStack width="100%" gap="$3">
          {activeMeds.map((med) => (
            <MedicationCard
              key={med.id}
              name={med.name}
              dose={med.dose}
              formLabel={MEDICATION_FORM_LABELS[med.form]}
              nextTime={getNextTime(med.id)}
              aic={med.aic}
              onPress={() => router.push(AppRoutes.medicationDetails(med.id))}
            />
          ))}
        </YStack>
      )}

      <PrimaryButton icon="barcode-scan" fullWidth onPress={() => router.push(AppRoutes.scan)}>
        Aggiungi farmaco
      </PrimaryButton>
    </AppScreen>
  );
}
