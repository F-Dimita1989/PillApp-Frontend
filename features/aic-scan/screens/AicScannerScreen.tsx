import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { YStack } from "tamagui";

import {
  ManualMedicationForm,
  validateManualMedication,
} from "@/components/farmaci/manual-medication-form";
import { ScannedMedicationForm } from "@/components/farmaci/scanned-medication-form";
import {
  AppCard,
  AppCardContent,
  AppInput,
  AppScreen,
  AppText,
  AppTopBar,
  BottomActionBar,
  BrandIconBadge,
  BrandIntroCard,
  ErrorState,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
  SuccessState,
} from "@/components/ui";
import { DEFAULT_NOTIFICATION_LEAD_ID } from "@/constants/therapy-notification-lead";
import { DEFAULT_NOTIFICATION_REPEAT_ID } from "@/constants/therapy-notification-repeat";
import { AppRoutes } from "@/features/navigation/routes";
import { useAppData } from "@/features/store/app-data-context";
import {
  EMPTY_SCANNED_MEDICATION_FORM,
  buildScannedMedicationFormValues,
  formatScannedMedicationNotes,
  mapUnitaToMedicationForm,
  therapyDoseFromFormValues,
  type ScannedMedicationFormValues,
} from "@/lib/farmaci/form-values";
import { pickAndScanMedicine } from "@/lib/farmaci/scan";
import { nearestTherapyDoseOption } from "@/lib/therapy/dose-options";
import { pillappColors } from "@/theme/tokens";
import type { Medication } from "@/types/domain";

type ScanPhase = "idle" | "loading" | "confirm" | "manual" | "error" | "success";

export function AicScannerScreen() {
  const router = useRouter();
  const { addMedication } = useAppData();

  const [phase, setPhase] = useState<ScanPhase>("idle");
  const [error, setError] = useState("");
  const [scanFormValues, setScanFormValues] =
    useState<ScannedMedicationFormValues | null>(null);
  const [dose, setDose] = useState("1 compressa");
  const [savedName, setSavedName] = useState("");
  const [manualErrors, setManualErrors] = useState<{ nome?: string; aic?: string }>(
    {},
  );

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
    setError("");
    setManualErrors({});
    setScanFormValues({ ...EMPTY_SCANNED_MEDICATION_FORM });
    setDose("1 compressa");
    setPhase("manual");
  };

  const saveMedication = (
    values: ScannedMedicationFormValues,
    source: Medication["source"],
    doseValue: string,
  ) => {
    const medication: Medication = {
      id: `med-${Date.now()}`,
      name: values.nome.trim(),
      aic: values.aic.trim() || undefined,
      form: mapUnitaToMedicationForm(values.unitaQuantita),
      dose: doseValue.trim() || "1 dose",
      notes: formatScannedMedicationNotes(values) || undefined,
    quantityRemaining: values.quantita.trim() || undefined,
    quantityUnit: values.unitaQuantita,
    schedule: {
      times: ["08:00"],
      daysActive: [true, true, true, true, true, true, true],
    },
    active: true,
    createdAt: new Date().toISOString(),
    source,
    notificationLeadId: DEFAULT_NOTIFICATION_LEAD_ID,
    notificationRepeatId: DEFAULT_NOTIFICATION_REPEAT_ID,
  };

    addMedication(medication);
    setSavedName(medication.name);
    setPhase("success");
    setTimeout(() => router.replace(AppRoutes.medications), 1200);
  };

  const confirmMedication = () => {
    if (!scanFormValues?.nome.trim()) {
      setError("Inserisci il nome del farmaco.");
      setPhase("error");
      return;
    }

    saveMedication(
      scanFormValues,
      scanFormValues.aic.trim() ? "aic_scan" : "manual",
      dose,
    );
  };

  const confirmManualMedication = () => {
    if (!scanFormValues) {
      return;
    }

    const nextErrors = validateManualMedication(scanFormValues);
    setManualErrors(nextErrors);
    if (nextErrors.nome || nextErrors.aic) {
      return;
    }

    saveMedication(
      scanFormValues,
      "manual",
      nearestTherapyDoseOption(dose, scanFormValues.unitaQuantita),
    );
  };

  const resetToIdle = () => {
    setScanFormValues(null);
    setManualErrors({});
    setError("");
    setPhase("idle");
  };

  const isManual = phase === "manual";
  const showScanArea = phase === "idle" || phase === "loading";

  return (
    <YStack flex={1} backgroundColor="$background" overflow="hidden">
      <YStack flex={1} minHeight={0}>
        <AppScreen
        scroll={phase !== "loading"}
        contentStyle={
          phase === "confirm" || phase === "manual" ? { paddingBottom: 120 } : undefined
        }
        hero={
          <AppTopBar
            icon={isManual ? "pencil-outline" : "barcode-scan"}
            eyebrow={isManual ? "Senza fotocamera" : "Funzione esclusiva"}
            title={isManual ? "Inserisci un farmaco" : "Scansione AIC"}
            subtitle={
              isManual
                ? "Basta il nome; AIC e altri campi sono facoltativi."
                : "Inquadra il codice a 9 cifre sulla confezione. PillApp riconosce il farmaco e lo aggiunge alla terapia."
            }
          />
        }
      >
        {showScanArea ? (
          <YStack width="100%" gap="$3">
            <BrandIntroCard
              icon="barcode-scan"
              title="Dove trovare il codice"
              description="Sulla confezione cerca «AIC N.» seguito da 9 cifre. Puoi usare la fotocamera, la galleria o inserire i dati a mano."
            />
            <SectionHeader title="Area di scansione" />
            <AppCard>
              <AppCardContent alignItems="center">
                <YStack
                  width="100%"
                  minHeight={220}
                  borderRadius="$3"
                  overflow="hidden"
                >
                  <LinearGradient
                    colors={[pillappColors.secondarySoft, pillappColors.primarySoft]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <YStack
                    width="100%"
                    minHeight={220}
                    borderRadius="$3"
                    borderWidth={2}
                    borderStyle="dashed"
                    borderColor="$secondary"
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
                          color={pillappColors.secondary}
                        />
                        <AppText variant="body" textAlign="center">
                          Lettura in corso…
                        </AppText>
                      </>
                    ) : (
                      <>
                        <BrandIconBadge
                          name="barcode-scan"
                          size={64}
                          iconSize={32}
                        />
                        <AppText variant="title" color="secondary">
                          Codice AIC
                        </AppText>
                        <AppText variant="body" muted textAlign="center">
                          Cerca «AIC N.» e le 9 cifre stampate sulla confezione
                        </AppText>
                      </>
                    )}
                  </YStack>
                </YStack>
              </AppCardContent>
            </AppCard>
          </YStack>
        ) : null}

        {phase === "confirm" && scanFormValues ? (
          <YStack width="100%" gap="$3">
            <BrandIntroCard
              icon="check-decagram"
              title="Controlla i dati"
              description="Verifica nome e codice AIC prima di aggiungere il farmaco alla terapia."
            />
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
          </YStack>
        ) : null}

        {phase === "manual" && scanFormValues ? (
          <YStack width="100%" gap="$3">
            <BrandIntroCard
              icon="pencil-outline"
              title="Dati del farmaco"
              description="Compila i campi sotto. Orari e promemoria si impostano dopo, dalla scheda del farmaco."
            />

            <AppCard>
              <AppCardContent>
                <ManualMedicationForm
                  values={scanFormValues}
                  onChange={(next) => {
                    setScanFormValues(next);
                    if (manualErrors.nome || manualErrors.aic) {
                      setManualErrors(validateManualMedication(next));
                    }
                  }}
                  dose={dose}
                  onDoseChange={setDose}
                  nomeError={manualErrors.nome}
                  aicError={manualErrors.aic}
                />
              </AppCardContent>
            </AppCard>
          </YStack>
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
      </YStack>

      {phase === "confirm" ? (
        <BottomActionBar
          primaryLabel="Aggiungi alla terapia"
          primaryIcon="pill"
          onPrimaryPress={confirmMedication}
          secondaryLabel="Annulla"
          onSecondaryPress={resetToIdle}
        />
      ) : null}

      {phase === "manual" ? (
        <BottomActionBar
          primaryLabel="Aggiungi alla terapia"
          primaryIcon="pill"
          onPrimaryPress={confirmManualMedication}
          secondaryLabel="Indietro"
          onSecondaryPress={resetToIdle}
        />
      ) : null}
    </YStack>
  );
}
