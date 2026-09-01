import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { YStack } from "tamagui";

import { AicScanExampleImage } from "@/components/farmaci/aic-scan-example-image";
import { MedicationQuantitySection } from "@/components/farmaci/medication-quantity-section";
import {
    ManualMedicationForm,
    validateManualMedication,
} from "@/components/farmaci/manual-medication-form";
import { ScannedMedicationForm } from "@/components/farmaci/scanned-medication-form";
import { TherapyReminderSettings } from "@/components/therapy/therapy-reminder-settings";
import {
    AppCard,
    AppCardContent,
    AppScreen,
    AppText,
    AppTopBar,
    BottomActionBar,
    BrandIntroCard,
    ErrorState,
    PrimaryButton,
    SecondaryButton,
    SectionHeader,
    SuccessState,
} from "@/components/ui";
import { AppRoutes } from "@/features/navigation/routes";
import { useAppData } from "@/features/store/app-data-context";
import { therapyDayPlanToDaysActive } from "@/lib/app-data/sync";
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
import {
    INITIAL_THERAPY_REMINDER_SETTINGS,
    normalizeOrariForTimesPerDay,
    validateReminderSettings,
    type TherapyReminderSettingsValue,
} from "@/lib/therapy/reminder-settings";
import { pillappColors, pillappRadius } from "@/theme/tokens";
import type { Medication, UserProfile } from "@/types/domain";

const SCAN_HERO_IMAGE = require("@/assets/onboarding/scansione-aic.jpg");

type ScanPhase =
  | "idle"
  | "loading"
  | "confirm"
  | "manual"
  | "schedule"
  | "error"
  | "success";

function reminderFromProfile(profile: UserProfile): TherapyReminderSettingsValue {
  return {
    ...INITIAL_THERAPY_REMINDER_SETTINGS,
    notificationsEnabled: profile.notificationsEnabled,
    notificationSoundId: profile.notificationSoundId,
  };
}

export function AicScannerScreen() {
  const router = useRouter();
  const { addMedication, updateProfile, profile } = useAppData();

  const [phase, setPhase] = useState<ScanPhase>("idle");
  const [entryMode, setEntryMode] = useState<"scan" | "manual">("scan");
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [scanFormValues, setScanFormValues] =
    useState<ScannedMedicationFormValues | null>(null);
  const [dose, setDose] = useState("1 compressa");
  const [reminderSettings, setReminderSettings] = useState<TherapyReminderSettingsValue>(
    () => reminderFromProfile(profile),
  );
  const [savedName, setSavedName] = useState("");
  const [manualErrors, setManualErrors] = useState<{
    nome?: string;
    aic?: string;
  }>({});

  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const resetToIdle = useCallback(() => {
    setScanFormValues(null);
    setManualErrors({});
    setError("");
    setFormError("");
    setDose("1 compressa");
    setReminderSettings(reminderFromProfile(profile));
    setEntryMode("scan");
    setPhase("idle");
  }, [profile]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (phaseRef.current === "success") {
          resetToIdle();
        }
      };
    }, [resetToIdle]),
  );

  const runScan = useCallback(
    async (source: "camera" | "gallery") => {
      setPhase("loading");
      setError("");
      setFormError("");
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
        setReminderSettings(reminderFromProfile(profile));
        setEntryMode("scan");
        setPhase("confirm");
      } catch (err) {
        setPhase("error");
        setError(err instanceof Error ? err.message : "Scansione non riuscita.");
      }
    },
    [profile],
  );

  const startManualEntry = () => {
    setError("");
    setFormError("");
    setManualErrors({});
    setScanFormValues({ ...EMPTY_SCANNED_MEDICATION_FORM });
    setDose("1 compressa");
    setReminderSettings(reminderFromProfile(profile));
    setEntryMode("manual");
    setPhase("manual");
  };

  const goToSchedule = () => {
    if (!scanFormValues) {
      return;
    }

    if (entryMode === "manual") {
      const nextErrors = validateManualMedication(scanFormValues);
      setManualErrors(nextErrors);
      if (nextErrors.nome || nextErrors.aic) {
        return;
      }
    } else if (!scanFormValues.nome.trim()) {
      setError("Inserisci il nome del farmaco.");
      setPhase("error");
      return;
    }

    setFormError("");
    setDose(nearestTherapyDoseOption(dose, scanFormValues.unitaQuantita));
    setPhase("schedule");
  };

  const saveMedication = () => {
    if (!scanFormValues) {
      return;
    }

    const validationError = validateReminderSettings(reminderSettings);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const orari = normalizeOrariForTimesPerDay(
      reminderSettings.timesPerDay,
      reminderSettings.orari,
    );
    const doseValue = nearestTherapyDoseOption(
      dose,
      scanFormValues.unitaQuantita,
    );
    const medication: Medication = {
      id: `med-${Date.now()}`,
      name: scanFormValues.nome.trim(),
      aic: scanFormValues.aic.trim() || undefined,
      form: mapUnitaToMedicationForm(scanFormValues.unitaQuantita),
      dose: doseValue.trim() || "1 dose",
      notes: formatScannedMedicationNotes(scanFormValues) || undefined,
      quantityRemaining: scanFormValues.quantita.trim() || undefined,
      quantityUnit: scanFormValues.unitaQuantita,
      schedule: {
        times: orari.slice(0, reminderSettings.timesPerDay),
        daysActive: therapyDayPlanToDaysActive(reminderSettings.dayPlan),
      },
      active: true,
      createdAt: new Date().toISOString(),
      source: entryMode === "manual" ? "manual" : "aic_scan",
      notificationLeadId: reminderSettings.notificationLeadId,
      notificationRepeatId: reminderSettings.notificationRepeatId,
    };

    addMedication(medication);

    if (reminderSettings.notificationSoundId !== profile.notificationSoundId) {
      updateProfile({ notificationSoundId: reminderSettings.notificationSoundId });
    }
    if (reminderSettings.notificationsEnabled !== profile.notificationsEnabled) {
      updateProfile({ notificationsEnabled: reminderSettings.notificationsEnabled });
    }

    setSavedName(medication.name);
    setPhase("success");
  };

  const goToMedications = () => {
    resetToIdle();
    router.navigate(AppRoutes.medications);
  };

  const backFromSchedule = () => {
    setFormError("");
    setPhase(entryMode === "manual" ? "manual" : "confirm");
  };

  const isManual = phase === "manual";
  const isSchedule = phase === "schedule";
  const showScanArea = phase === "idle" || phase === "loading";
  const showBottomBar = phase === "confirm" || phase === "schedule";

  return (
    <YStack flex={1} backgroundColor="transparent" overflow="hidden">
      <YStack flex={1} minHeight={0}>
        <AppScreen
          scroll={phase !== "loading"}
          contentStyle={showBottomBar ? { paddingBottom: 120 } : undefined}
          hero={
            <AppTopBar
              image={
                isSchedule
                  ? require("@/assets/onboarding/configuriamo-terapia.png")
                  : isManual
                    ? require("@/assets/onboarding/matita.png")
                    : require("@/assets/onboarding/lente.png")
              }
              imageCoverScale={0.76}
              eyebrow={
                isSchedule
                  ? "Terapia"
                  : isManual
                    ? "Senza fotocamera"
                    : "Funzione esclusiva"
              }
              title={
                isSchedule
                  ? "Orari e promemoria"
                  : isManual
                    ? "Inserisci un farmaco"
                    : "Scansione AIC"
              }
              subtitle={
                isSchedule
                  ? "Scegli dosaggio, orari e avvisi. Poi aggiungi il farmaco alla terapia."
                  : isManual
                    ? "Scrivi il nome: ti suggerisco i farmaci del catalogo e compilo il resto."
                    : "Inquadra il codice a 9 cifre sulla confezione. PillApp riconosce il farmaco e lo aggiunge alla terapia."
              }
            />
          }
        >
          {showScanArea ? (
            <YStack width="100%" gap="$3">
              <Image
                source={SCAN_HERO_IMAGE}
                style={styles.heroImage}
                contentFit="cover"
                accessibilityRole="image"
                accessibilityLabel="Illustrazione: riconoscimento del farmaco dalla confezione"
              />
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
                    minHeight={phase === "loading" ? 220 : undefined}
                    borderRadius="$3"
                    overflow="hidden"
                  >
                    <LinearGradient
                      colors={[
                        pillappColors.secondarySoft,
                        pillappColors.primarySoft,
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <YStack
                      width="100%"
                      minHeight={phase === "loading" ? 220 : undefined}
                      borderRadius="$3"
                      borderWidth={2}
                      borderStyle="dashed"
                      borderColor="$secondary"
                      alignItems="center"
                      justifyContent="center"
                      padding="$4"
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
                          <YStack width="100%">
                            <AicScanExampleImage size="full" />
                          </YStack>
                          <AppText variant="title" color="secondary">
                            Codice AIC
                          </AppText>
                          <AppText variant="body" muted textAlign="center">
                            Cerca «AIC N.» e le 9 cifre stampate sulla
                            confezione
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
                description="Verifica nome, codice AIC e quantità. Al passo successivo imposti orari e promemoria."
              />
              <AppCard>
                <AppCardContent>
                  <SectionHeader
                    title="Conferma dati"
                    description="Verifica le informazioni prima di impostare la terapia."
                  />
                  <ScannedMedicationForm
                    key={`scan-form-${scanFormValues.aic}`}
                    values={scanFormValues}
                    onChange={setScanFormValues}
                    showHeading={false}
                  />
                </AppCardContent>
              </AppCard>
              <AppCard>
                <AppCardContent>
                  <MedicationQuantitySection
                    values={scanFormValues}
                    onChange={setScanFormValues}
                    source="scan"
                  />
                </AppCardContent>
              </AppCard>
            </YStack>
          ) : null}

          {phase === "manual" && scanFormValues ? (
            <YStack width="100%" gap="$3">
              <BrandIntroCard
                icon="pencil-outline"
                title="Dati del farmaco"
                description="Compila i campi sotto. Al passo successivo imposti orari e promemoria."
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
                    footer={
                      <>
                        <PrimaryButton
                          icon="arrow-right"
                          fullWidth
                          onPress={goToSchedule}
                        >
                          Avanti
                        </PrimaryButton>
                        <SecondaryButton fullWidth onPress={resetToIdle}>
                          Indietro
                        </SecondaryButton>
                      </>
                    }
                  />
                </AppCardContent>
              </AppCard>
            </YStack>
          ) : null}

          {phase === "schedule" && scanFormValues ? (
            <YStack width="100%" gap="$3">
              <BrandIntroCard
                icon="bell-ring-outline"
                title={scanFormValues.nome.trim() || "Nuovo farmaco"}
                description="Scegli dosaggio, orari e avvisi per questo farmaco."
              />
              <AppCard>
                <AppCardContent>
                  <TherapyReminderSettings
                    value={reminderSettings}
                    onChange={setReminderSettings}
                    dose={dose}
                    onDoseChange={setDose}
                    unitaQuantita={scanFormValues.unitaQuantita}
                  />
                </AppCardContent>
              </AppCard>
              {formError ? (
                <AppText variant="caption" color="error">
                  {formError}
                </AppText>
              ) : null}
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
            <YStack width="100%" gap="$3">
              <SuccessState
                title="Farmaco aggiunto"
                description={`${savedName} è stato aggiunto alla tua terapia, con gli orari che hai impostato.`}
              />
              <PrimaryButton
                icon="barcode-scan"
                fullWidth
                onPress={resetToIdle}
              >
                Scansiona un altro farmaco
              </PrimaryButton>
              <SecondaryButton icon="pill" fullWidth onPress={goToMedications}>
                Vai ai farmaci
              </SecondaryButton>
            </YStack>
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
          primaryLabel="Avanti"
          primaryIcon="arrow-right"
          onPrimaryPress={goToSchedule}
          secondaryLabel="Annulla"
          onSecondaryPress={resetToIdle}
        />
      ) : null}

      {phase === "schedule" ? (
        <BottomActionBar
          primaryLabel="Aggiungi alla terapia"
          primaryIcon="pill"
          onPrimaryPress={saveMedication}
          secondaryLabel="Indietro"
          onSecondaryPress={backFromSchedule}
        />
      ) : null}
    </YStack>
  );
}

const styles = StyleSheet.create({
  heroImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: pillappRadius[3],
    overflow: "hidden",
  },
});
