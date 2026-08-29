import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { YStack } from "tamagui";

import {
  AppScreen,
  AppTopBar,
  BrandIntroCard,
  EmptyState,
  MedicationCard,
  PrimaryButton,
  SearchInput,
  SectionHeader,
} from "@/components/ui";
import { useAppData } from "@/features/store/app-data-context";
import { AppRoutes } from "@/features/navigation/routes";
import { pillappColors } from "@/theme/tokens";
import { MEDICATION_FORM_LABELS } from "@/types/domain";

export function MedicationsScreen() {
  const router = useRouter();
  const { medications, dosesToday } = useAppData();
  const [query, setQuery] = useState("");

  const activeMeds = medications.filter((m) => m.active);

  const filteredMeds = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return activeMeds;
    return activeMeds.filter(
      (m) =>
        m.name.toLowerCase().includes(normalized) ||
        m.aic?.toLowerCase().includes(normalized),
    );
  }, [activeMeds, query]);

  const getNextTime = (medId: string) => {
    const pending = dosesToday
      .filter((d) => d.medicationId === medId && d.status !== "taken" && d.status !== "skipped")
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    return pending[0]?.scheduledTime;
  };

  return (
    <AppScreen
      contentStyle={{ paddingBottom: 24 }}
      hero={
        <AppTopBar
          image={require("@/assets/onboarding/blister.png")}
          imageCoverScale={0.76}
          title="I miei farmaci"
          subtitle="Terapia attiva, dosi e promemoria in un unico elenco."
        />
      }
    >

      <BrandIntroCard
        icon="pill"
        title="La tua terapia"
        description="Tocca un farmaco per vedere tutta la terapia, modificare dosaggio e orari o eliminarlo."
      />

      {activeMeds.length > 0 ? (
        <SearchInput
          value={query}
          onChangeText={setQuery}
          placeholder="Cerca per nome o codice AIC…"
        />
      ) : null}

      <SectionHeader
        title={`Farmaci attivi (${activeMeds.length})`}
        description="Tocca un farmaco per dettagli, modifica e rimozione dalla terapia."
      />

      {activeMeds.length === 0 ? (
        <EmptyState
          title="Nessun farmaco registrato"
          description="Scansiona il codice AIC sulla confezione per aggiungere il primo farmaco alla tua terapia."
          actionLabel="Scansiona codice AIC"
          onAction={() => router.push(AppRoutes.scan)}
          icon={
            <MaterialCommunityIcons name="pill" size={32} color={pillappColors.onPrimary} />
          }
        />
      ) : filteredMeds.length === 0 ? (
        <EmptyState
          title="Nessun risultato"
          description={`Nessun farmaco corrisponde a «${query.trim()}».`}
        />
      ) : (
        <YStack width="100%" gap="$3">
          {filteredMeds.map((med) => (
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
