import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator } from "react-native";
import { YStack } from "tamagui";

import { ScannedMedicationForm } from "@/components/farmaci/scanned-medication-form";
import {
  AppCard,
  AppCardContent,
  AppInput,
  AppScreen,
  AppText,
  BottomActionBar,
  ErrorState,
  IntroHeroArc,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
  SuccessState,
} from "@/components/ui";
import { AppRoutes } from "@/features/navigation/routes";
import { useAppData } from "@/features/store/app-data-context";
import {
  buildScannedMedicationFormValues,
  formatScannedMedicationNotes,
  mapUnitaToMedicationForm,
  therapyDoseFromFormValues,
  type ScannedMedicationFormValues,
} from "@/lib/farmaci/form-values";
import { pickAndScanMedicine } from "@/lib/farmaci/scan";
import { pillappColors } from "@/theme/tokens";
import type { Medication } from "@/types/domain";

type ScanPhase = "idle" | "loading" | "confirm" | "error" | "success";

export function AicScannerScreen() {
  const router = useRouter();
  const { addMedication } = useAppData();

  const [phase, setPhase] = useState<ScanPhase>("idle");
  const [error, setError] = useState("");
  const [scanFormValues, setScanFormValues] =
    useState<ScannedMedicationFormValues | null>(null);
  const [dose, setDose] = useState("1 compressa");
  const [savedName, setSavedName] = useState("");

  const runScan = useCallback(async (source: "camera" | "gallery") => {
    setPhase("loading");
    setError("");
    try {
      const result = await pickAndScanMedicine(source);
      if (!result) {
        setPhase("idle");
        return;
      }

      const formValues = buildScannedMedicationFormValues(
        result.aic,
        result.data,
      );
      setScanFormValues(formValues);
      setDose(therapyDoseFromFormValues(formValues));
      setPhase("confirm");
    } catch (err) {
      setPhase("error");
      setError(err instanceof Error ? err.message : "Scansione non riuscita.");
    }
  }, []);

  const startManualEntry = () => {
    setScanFormValues({
      aic: "",
      nome: "",
      marca: "",
      principioAttivo: "",
      quantita: "",
      unitaQuantita: "pillole",
      dosaggio: "",
      note: "",
    });
    setPhase("confirm");
  };

  const confirmMedication = () => {
    if (!scanFormValues?.nome.trim()) {
      setError("Inserisci il nome del farmaco.");
      setPhase("error");
      return;
    }

    const medication: Medication = {
      id: `med-${Date.now()}`,
      name: scanFormValues.nome.trim(),
      aic: scanFormValues.aic.trim() || undefined,
      form: mapUnitaToMedicationForm(scanFormValues.unitaQuantita),
      dose: dose.trim() || "1 dose",
      notes: formatScannedMedicationNotes(scanFormValues) || undefined,
      quantityRemaining: scanFormValues.quantita.trim() || undefined,
      quantityUnit: scanFormValues.unitaQuantita,
      schedule: {
        times: ["08:00"],
        daysActive: [true, true, true, true, true, true, true],
      },
      active: true,
      createdAt: new Date().toISOString(),
      source: scanFormValues.aic.trim() ? "aic_scan" : "manual",
    };

    addMedication(medication);
    setSavedName(medication.name);
    setPhase("success");
    setTimeout(() => router.replace(AppRoutes.medications), 1200);
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <IntroHeroArc
        eyebrow="Funzione esclusiva"
        title="Scansione AIC"
        subtitle="Inquadra il codice a 9 cifre sulla confezione. PillApp riconosce il farmaco e lo aggiunge alla terapia."
        emblem={
          <MaterialCommunityIcons
            name="barcode-scan"
            size={40}
            color={pillappColors.primary}
          />
        }
        showLogo={false}
      />

      <AppScreen
        scroll={phase !== "loading"}
        contentStyle={phase === "confirm" ? { paddingBottom: 120 } : undefined}
      >
        <YStack width="100%" gap="$3">
          <SectionHeader title="Area di scansione" />
          <AppCard variant="outlined">
            <AppCardContent alignItems="center">
              <YStack
                width="100%"
                minHeight={220}
                borderRadius="$3"
                borderWidth={2}
                borderStyle="dashed"
                borderColor="$primary"
                backgroundColor="$primarySoft"
                alignItems="center"
                justifyContent="center"
                padding="$5"
                gap="$3"
                accessibilityLabel="Area di scansione codice AIC"
              >
                {phase === "loading" ? (
                  <>
                    <ActivityIndicator
                      size="large"
                      color={pillappColors.primary}
                    />
                    <AppText variant="body" textAlign="center">
                      Lettura in corso…
                    </AppText>
                  </>
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="barcode-scan"
                      size={48}
                      color={pillappColors.primary}
                    />
                    <AppText variant="title" color="primary">
                      Codice AIC
                    </AppText>
                    <AppText variant="body" muted textAlign="center">
                      Cerca «AIC N.» e le 9 cifre stampate sulla confezione
                    </AppText>
                  </>
                )}
              </YStack>
            </AppCardContent>
          </AppCard>
        </YStack>

        {phase === "confirm" && scanFormValues ? (
          <AppCard>
            <AppCardContent>
              <SectionHeader
                title="Conferma dati"
                description="Verifica le informazioni prima di aggiungere il farmaco."
              />
              <ScannedMedicationForm
                key={`scan-form-${scanFormValues.aic}`}
                values={scanFormValues}
                onChange={setScanFormValues}
                showHeading={false}
              />
              <AppInput
                label="Dose giornaliera"
                value={dose}
                onChangeText={setDose}
              />
              <AppText variant="caption" muted>
                Potrai modificare orari e promemoria dalla scheda del farmaco.
              </AppText>
            </AppCardContent>
          </AppCard>
        ) : null}

        {phase === "error" ? (
          <ErrorState
            description={error}
            actionLabel="Inserisci manualmente"
            onAction={startManualEntry}
          />
        ) : null}

        {phase === "success" ? (
          <SuccessState
            title="Farmaco aggiunto"
            description={`${savedName} è stato aggiunto alla tua terapia.`}
          />
        ) : null}

        {phase === "idle" ? (
          <YStack width="100%" gap="$3">
            <PrimaryButton
              icon="camera"
              fullWidth
              onPress={() => void runScan("camera")}
            >
              Apri fotocamera
            </PrimaryButton>
            <SecondaryButton
              icon="image"
              fullWidth
              onPress={() => void runScan("gallery")}
            >
              Scegli da galleria
            </SecondaryButton>
            <SecondaryButton
              icon="pencil-outline"
              fullWidth
              onPress={startManualEntry}
            >
              Inserisci manualmente
            </SecondaryButton>
          </YStack>
        ) : null}
      </AppScreen>

      {phase === "confirm" ? (
        <BottomActionBar
          primaryLabel="Aggiungi alla terapia"
          primaryIcon="pill"
          onPrimaryPress={confirmMedication}
          secondaryLabel="Annulla"
          onSecondaryPress={() => {
            setScanFormValues(null);
            setPhase("idle");
          }}
        />
      ) : null}
    </YStack>
  );
}
