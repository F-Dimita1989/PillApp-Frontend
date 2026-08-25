import {
  CoachmarkAnchor,
  createTour,
  useCoachmark,
} from "@edwardloopez/react-native-coachmark";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollView as ScrollViewType,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import { AicScanTourTooltip } from "@/components/coachmark/aic-scan-tour-tooltip";
import { AicTourIntroModal } from "@/components/coachmark/aic-tour-intro-modal";
import { AicTourOverlay } from "@/components/coachmark/aic-tour-overlay";
import { AicScanExampleImage } from "@/components/farmaci/aic-scan-example-image";
import { MedicationQuantitySection } from "@/components/farmaci/medication-quantity-section";
import { ScannedMedicationForm } from "@/components/farmaci/scanned-medication-form";
import { ScreenSafeArea } from "@/components/screen-safe-area";
import {
  ProfileSetupAnimatedShell,
  type ProfileSetupTransitionDirection,
} from "@/components/setup/profile-setup-animated-shell";
import { ProfileSetupChoiceCard } from "@/components/setup/profile-setup-choice-card";
import { ProfileSetupHero } from "@/components/setup/profile-setup-hero";
import { ProfileSetupLayout } from "@/components/setup/profile-setup-layout";
import { ProfileSetupNameModal } from "@/components/setup/profile-setup-name-modal";
import { ProfileSetupStepContent } from "@/components/setup/profile-setup-step-content";
import { TherapyReminderSettings } from "@/components/therapy/therapy-reminder-settings";
import {
  AppButton,
  AppCard,
  AppCardContent,
  AppChip,
  AppText,
  BrandIconBadge,
  BrandIntroCard,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui";
import {
  AIC_SCAN_TOUR_KEY,
  AIC_TOUR_ANCHORS,
} from "@/constants/aic-scanner-tour";
import { type GuestSex } from "@/constants/profile";
import { getProfileSetupStepMeta } from "@/constants/profile-setup-steps";
import { THERAPY_FORM_PREVIEW } from "@/constants/therapy-form-preview";
import {
  saveSetupMedications,
  type SetupTherapyMedication,
} from "@/lib/app-data/save-setup-medications";
import {
  ensureVisibleInScroll,
  TOUR_TOOLTIP_BOTTOM_RESERVE,
} from "@/lib/coachmark/scroll-anchor-into-view";
import {
  buildScannedMedicationFormValues,
  therapyDoseFromFormValues,
  type ScannedMedicationFormValues,
} from "@/lib/farmaci/form-values";
import { pickAndScanMedicine } from "@/lib/farmaci/scan";
import { isValidGuestAge, saveGuestProfile } from "@/lib/profile/storage";
import { nearestTherapyDoseOption } from "@/lib/therapy/dose-options";
import {
  INITIAL_THERAPY_REMINDER_SETTINGS,
  validateReminderSettings,
  type TherapyReminderSettingsValue,
} from "@/lib/therapy/reminder-settings";
import {
  setupScrollTherapy,
  setupScrollTourFraming,
  setupScrollTourResult,
} from "@/theme/setup-layout";
import { pillappLayout, pillappSpace } from "@/theme/tokens";

type PostOnboardingFlowProps = {
  onComplete: () => void;
};

type SetupStep = "welcome" | "name" | "age" | "sex" | "therapy" | "done";

type MedicationConfigPhase = "scan" | "verify" | "schedule";

const STEPS: SetupStep[] = ["welcome", "name", "age", "sex", "therapy", "done"];

export function PostOnboardingFlow({ onComplete }: PostOnboardingFlowProps) {
  const insets = useSafeAreaInsets();
  const [stepIndex, setStepIndex] = useState(0);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [transitionDirection, setTransitionDirection] =
    useState<ProfileSetupTransitionDirection>("forward");
  const [guestName, setGuestName] = useState("");
  const [guestAge, setGuestAge] = useState("");
  const [guestSex, setGuestSex] = useState<GuestSex | null>(null);
  const [wantsTherapy, setWantsTherapy] = useState<boolean | null>(null);
  const [scanFormValues, setScanFormValues] =
    useState<ScannedMedicationFormValues | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [dose, setDose] = useState("1 compressa");
  const [reminderSettings, setReminderSettings] =
    useState<TherapyReminderSettingsValue>(INITIAL_THERAPY_REMINDER_SETTINGS);
  const [configuredMedications, setConfiguredMedications] = useState<
    SetupTherapyMedication[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [tourCompleted, setTourCompleted] = useState(false);
  const [tourSkipped, setTourSkipped] = useState(false);
  const [medicationPhase, setMedicationPhase] =
    useState<MedicationConfigPhase>("scan");

  const therapyScrollRef = useRef<ScrollViewType>(null);
  const framingBoxRef = useRef<View>(null);
  const resultCardRef = useRef<View>(null);
  const scrollYRef = useRef(0);
  const tourStartedRef = useRef(false);
  const tourCallbacksRef = useRef({
    onCompleted: () => {},
    onSkipped: () => {},
  });
  const {
    start,
    isActive,
    stop,
    activeStep,
    index: tourIndex,
  } = useCoachmark();

  const canScan = tourCompleted || tourSkipped;

  const step = STEPS[stepIndex];

  useEffect(() => {
    if (step !== "name") {
      setNameModalVisible(false);
    }
  }, [step]);
  const parsedAge = Number(guestAge.trim());
  const isAgeValid = isValidGuestAge(parsedAge);
  const farmacoNome = scanFormValues?.nome.trim() ?? "";
  const configuredCount = configuredMedications.length;

  tourCallbacksRef.current = {
    onCompleted: () => setTourCompleted(true),
    onSkipped: () => setTourSkipped(true),
  };

  const buildTherapyTour = useCallback(
    () =>
      createTour(
        AIC_SCAN_TOUR_KEY,
        [
          {
            id: AIC_TOUR_ANCHORS.intro,
            title: "Cos'è la scansione AIC",
            description:
              "Il codice AIC identifica il farmaco sulla confezione. PillApp lo legge dalla foto.",
            placement: "auto",
            shape: "rect",
            radius: 16,
            padding: 12,
            autoFocus: "ifNeeded",
            scrollBehavior: "smooth",
            scrollPadding: 80,
            scrollDelay: 350,
          },
          {
            id: AIC_TOUR_ANCHORS.scanButton,
            title: "Pulsante di scansione",
            description: "Userai questo pulsante per aprire la fotocamera.",
            placement: "auto",
            shape: "pill",
            padding: 10,
            autoFocus: "always",
            scrollBehavior: "smooth",
            scrollPadding: 140,
            scrollDelay: 400,
          },
          {
            id: AIC_TOUR_ANCHORS.framingBox,
            title: "Dove trovare il codice AIC",
            description:
              "Cerca «AIC N.» e le 9 cifre sulla confezione, come nell'immagine qui sotto.",
            placement: "auto",
            shape: "rect",
            radius: 16,
            padding: 8,
            scrollDelay: 450,
          },
          {
            id: AIC_TOUR_ANCHORS.resultCard,
            title: "Verifica il farmaco trovato",
            description:
              "Qui compariranno i dati dal database, la quantità in confezione e le impostazioni dei promemoria.",
            placement: "auto",
            shape: "rect",
            radius: 16,
            padding: 12,
          },
        ],
        {
          delay: 120,
          nextOnBackdropPress: false,
          renderTooltip: (props) => (
            <AicScanTourTooltip
              {...props}
              onTourCompleted={tourCallbacksRef.current.onCompleted}
              onTourSkipped={tourCallbacksRef.current.onSkipped}
            />
          ),
        },
      ),
    [],
  );

  const startTherapyTour = useCallback(
    (force = false) => {
      if (
        tourCompleted ||
        tourSkipped ||
        step !== "therapy" ||
        wantsTherapy !== true
      ) {
        return;
      }

      if (force) {
        tourStartedRef.current = false;
      }

      if (tourStartedRef.current) {
        return;
      }

      tourStartedRef.current = true;
      start(buildTherapyTour());
    },
    [buildTherapyTour, start, step, tourCompleted, tourSkipped, wantsTherapy],
  );

  useEffect(() => {
    if (step !== "therapy") {
      tourStartedRef.current = false;
    }
  }, [step]);

  useEffect(() => {
    if (step !== "therapy" && isActive) {
      void stop();
    }
  }, [isActive, step, stop]);

  useEffect(() => {
    if (!isActive || step !== "therapy") {
      return;
    }

    if (activeStep?.id === AIC_TOUR_ANCHORS.framingBox) {
      const timer = setTimeout(() => {
        void ensureVisibleInScroll(
          therapyScrollRef,
          framingBoxRef,
          () => scrollYRef.current,
          insets,
          TOUR_TOOLTIP_BOTTOM_RESERVE,
        );
      }, 150);
      return () => clearTimeout(timer);
    }

    if (activeStep?.id === AIC_TOUR_ANCHORS.resultCard) {
      const timer = setTimeout(() => {
        void ensureVisibleInScroll(
          therapyScrollRef,
          resultCardRef,
          () => scrollYRef.current,
          insets,
          TOUR_TOOLTIP_BOTTOM_RESERVE,
        );
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isActive, step, activeStep?.id, tourIndex, insets]);

  const handleTherapyScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    scrollYRef.current = event.nativeEvent.contentOffset.y;
  };

  const goNext = () => {
    setErrorMessage("");
    if (stepIndex < STEPS.length - 1) {
      setTransitionDirection("forward");
      setStepIndex((current) => current + 1);
    }
  };

  const goBack = () => {
    setErrorMessage("");
    if (stepIndex > 0) {
      setTransitionDirection("back");
      setStepIndex((current) => current - 1);
    }
  };

  const resetScan = () => {
    setScanFormValues(null);
    setScanError("");
    setDose("1 compressa");
    setReminderSettings(INITIAL_THERAPY_REMINDER_SETTINGS);
    setMedicationPhase("scan");
  };

  const validateVerifyStep = (): string | null => {
    if (!scanFormValues?.aic.trim() || !scanFormValues.nome.trim()) {
      return "Controlla nome e codice AIC del farmaco.";
    }

    const aic = scanFormValues.aic.trim();
    if (
      configuredMedications.some(
        (item) => item.scanFormValues.aic.trim() === aic,
      )
    ) {
      return "Questo farmaco è già nella lista.";
    }

    return null;
  };

  const validateCurrentMedication = (): string | null => {
    const verifyError = validateVerifyStep();
    if (verifyError) {
      return verifyError;
    }

    if (!dose.trim()) {
      return "Scegli il dosaggio per assunzione.";
    }

    return validateReminderSettings(reminderSettings);
  };

  const addCurrentMedicationToList = (): boolean => {
    const validationError = validateCurrentMedication();
    if (validationError || !scanFormValues) {
      setErrorMessage(
        validationError ?? "Scansiona la confezione del farmaco.",
      );
      return false;
    }

    setConfiguredMedications((current) => [
      ...current,
      { scanFormValues, dose, reminderSettings },
    ]);
    resetScan();
    setErrorMessage("");
    return true;
  };

  const handleVerifyNext = () => {
    const validationError = validateVerifyStep();
    if (validationError || !scanFormValues) {
      setErrorMessage(validationError ?? "Dati farmaco mancanti.");
      return;
    }

    setDose((current) =>
      nearestTherapyDoseOption(current, scanFormValues.unitaQuantita),
    );
    setErrorMessage("");
    setMedicationPhase("schedule");
  };

  const handleScheduleFinishPlan = () => {
    if (!addCurrentMedicationToList()) {
      return;
    }
    goNext();
  };

  const handleScheduleScanAnother = () => {
    addCurrentMedicationToList();
  };

  const handleTherapyMedBack = () => {
    setErrorMessage("");
    if (medicationPhase === "schedule") {
      setMedicationPhase("verify");
      return;
    }
    if (medicationPhase === "verify") {
      resetScan();
      return;
    }
    goBack();
  };

  const removeConfiguredMedication = (index: number) => {
    setConfiguredMedications((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const handleScan = async (source: "camera" | "gallery") => {
    setIsScanning(true);
    setScanError("");
    resetScan();

    try {
      const result = await pickAndScanMedicine(source);
      if (!result) {
        return;
      }

      const formValues = buildScannedMedicationFormValues(
        result.aic,
        result.data,
      );
      setScanFormValues(formValues);
      setDose(therapyDoseFromFormValues(formValues));
      setMedicationPhase("verify");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Scansione non riuscita.";
      setScanError(message);
    } finally {
      setIsScanning(false);
    }
  };

  const finishSetup = async () => {
    const normalizedName = guestName.trim();
    if (!normalizedName || !guestSex || !isAgeValid || isSaving) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const privacyAcknowledgedAt = new Date().toISOString();
      let therapyConfiguredAt: string | undefined;
      let therapySkipped = false;

      if (wantsTherapy) {
        if (configuredMedications.length === 0) {
          throw new Error("Scansiona almeno un farmaco per continuare.");
        }

        const { notificationWarning } = await saveSetupMedications(
          configuredMedications,
        );
        if (notificationWarning) {
          throw new Error(notificationWarning);
        }

        therapyConfiguredAt = new Date().toISOString();
      } else {
        therapySkipped = true;
      }

      await saveGuestProfile({
        name: normalizedName,
        age: parsedAge,
        sex: guestSex,
        privacyAcknowledgedAt,
        therapyConfiguredAt,
        therapySkipped,
      });

      onComplete();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Errore durante il salvataggio.";
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTherapyContinue = () => {
    if (wantsTherapy === null) {
      setErrorMessage("Scegli se vuoi configurare una terapia adesso.");
      return;
    }

    if (wantsTherapy && configuredMedications.length === 0) {
      setErrorMessage("Scansiona almeno un farmaco per continuare.");
      return;
    }

    setErrorMessage("");
    goNext();
  };

  const welcomeMeta = getProfileSetupStepMeta("welcome");
  const therapyHeroMeta = getProfileSetupStepMeta("therapy");
  const isTherapyStep = step === "therapy";
  const isProfileStep = step !== "therapy";

  const profileHeroMeta = isProfileStep
    ? step === "welcome"
      ? welcomeMeta
      : getProfileSetupStepMeta(step, guestName.trim())
    : null;

  const profileDoneSubtitle =
    step === "done"
      ? wantsTherapy
        ? configuredCount === 1
          ? `Ho salvato il promemoria per ${configuredMedications[0]?.scanFormValues.nome.trim() || farmacoNome}.`
          : `Ho salvato ${configuredCount} farmaci con i rispettivi promemoria.`
        : "Quando vorrai, potrai scansionare una confezione in Home e impostare i promemoria dalla tab Farmaci."
      : undefined;

  const profileHero = profileHeroMeta ? (
    <ProfileSetupHero
      meta={profileHeroMeta}
      showLogo={step === "welcome"}
      hideSubtitle={step === "welcome"}
      subtitle={profileDoneSubtitle}
    />
  ) : null;

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScreenSafeArea
        includeBottomInset
        edges={isTherapyStep && !isActive ? ["bottom"] : ["top", "bottom"]}
        style={{ flex: 1 }}
      >
        <ProfileSetupAnimatedShell
          stepKey={step}
          direction={transitionDirection}
        >
          {isTherapyStep ? (
            <YStack flex={1} width="100%">
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <ScrollView
                ref={therapyScrollRef}
                contentContainerStyle={[
                  setupScrollTherapy,
                  isActive &&
                    activeStep?.id === AIC_TOUR_ANCHORS.framingBox &&
                    setupScrollTourFraming(),
                  isActive &&
                    activeStep?.id === AIC_TOUR_ANCHORS.resultCard &&
                    setupScrollTourResult(),
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={handleTherapyScroll}
              >
                {!isActive ? (
                  <View
                    style={{
                      marginHorizontal: -pillappLayout.screenPaddingX,
                      marginTop: -pillappSpace[6],
                      alignSelf: "stretch",
                    }}
                  >
                    <ProfileSetupHero meta={therapyHeroMeta} showCopy={false} />
                  </View>
                ) : null}
                <CoachmarkAnchor
                  id={AIC_TOUR_ANCHORS.intro}
                  shape="rect"
                  radius={16}
                  padding={12}
                  scrollRef={therapyScrollRef}
                >
                  <YStack width="100%" gap="$2" alignItems="center">
                    <AppText variant="overline" color="secondary">
                      {therapyHeroMeta.eyebrow}
                    </AppText>
                    <AppText variant="headline" color="secondary" textAlign="center">
                      {therapyHeroMeta.title}
                    </AppText>
                    <AppText variant="body" muted textAlign="center">
                      {therapyHeroMeta.subtitle}
                    </AppText>
                  </YStack>
                </CoachmarkAnchor>
                {!isActive ? (
                <AppCard variant="brand">
                  <YStack width="100%" gap="$3">
                    <ProfileSetupChoiceCard
                      label="Sì, impostiamola"
                      description="Scansiona le confezioni e imposta i promemoria."
                      selected={wantsTherapy === true}
                      onPress={() => {
                        setWantsTherapy(true);
                        setErrorMessage("");
                      }}
                    />
                    <ProfileSetupChoiceCard
                      label="Per ora no"
                      description="Potrai farlo più tardi da Home o dalla tab Farmaci."
                      selected={wantsTherapy === false}
                      onPress={() => {
                        setWantsTherapy(false);
                        resetScan();
                        setConfiguredMedications([]);
                        setErrorMessage("");
                      }}
                    />
                    {wantsTherapy ? null : (
                      <YStack width="100%" gap="$3">
                        {errorMessage ? (
                          <AppText variant="caption" color="error">
                            {errorMessage}
                          </AppText>
                        ) : null}
                        <SecondaryButton onPress={goBack} fullWidth>
                          Indietro
                        </SecondaryButton>
                        <PrimaryButton
                          onPress={handleTherapyContinue}
                          fullWidth
                        >
                          Continua
                        </PrimaryButton>
                      </YStack>
                    )}
                  </YStack>
                </AppCard>
                ) : null}

                {wantsTherapy ? (
                  <AppCard variant="elevated">
                    <AppCardContent gap="$4">
                      <YStack width="100%" gap="$4">
                        {configuredMedications.length > 0 ? (
                          <YStack width="100%" gap="$2">
                            <AppText variant="title" color="secondary" textAlign="center">
                              Farmaci aggiunti ({configuredMedications.length})
                            </AppText>
                            <XStack
                              flexWrap="wrap"
                              gap="$2"
                              justifyContent="center"
                            >
                              {configuredMedications.map((item, index) => (
                                <AppChip
                                  key={`${item.scanFormValues.aic}-${index}`}
                                  label={item.scanFormValues.nome.trim()}
                                  icon="pill"
                                  onClose={() =>
                                    removeConfiguredMedication(index)
                                  }
                                  style={{ maxWidth: "100%" }}
                                />
                              ))}
                            </XStack>
                            <AppText variant="caption" muted textAlign="center">
                              Puoi aggiungerne altri dopo aver completato il
                              farmaco corrente.
                            </AppText>
                          </YStack>
                        ) : null}

                        {medicationPhase === "scan" ? (
                          <>
                            <XStack
                              width="100%"
                              alignItems="center"
                              justifyContent="center"
                              gap="$2"
                            >
                              <BrandIconBadge name="camera" size={40} iconSize={22} />
                              <AppText variant="title" color="secondary" textAlign="center">
                                Scansiona la confezione
                              </AppText>
                            </XStack>
                            <AppText variant="body" textAlign="center">
                              Scatta una foto nitida del codice AIC stampato
                              sulla scatola.
                            </AppText>

                            <CoachmarkAnchor
                              id={AIC_TOUR_ANCHORS.scanButton}
                              shape="pill"
                              padding={8}
                              scrollRef={therapyScrollRef}
                            >
                              <PrimaryButton
                                icon="camera"
                                loading={isScanning}
                                disabled={!canScan || isScanning}
                                onPress={() => void handleScan("camera")}
                                fullWidth
                                accessibilityRole="button"
                                accessibilityLabel="Scansiona codice AIC"
                                accessibilityHint={
                                  canScan
                                    ? "Apre la fotocamera per fotografare il codice AIC"
                                    : "Completa o salta la guida prima di scansionare"
                                }
                              >
                                {isScanning
                                  ? "Sto leggendo..."
                                  : "Scatta foto alla confezione"}
                              </PrimaryButton>
                            </CoachmarkAnchor>

                            <AppButton
                              variant="ghost"
                              icon="image"
                              disabled={!canScan || isScanning}
                              onPress={() => void handleScan("gallery")}
                              fullWidth
                            >
                              Oppure scegli una foto dalla galleria
                            </AppButton>

                            <CoachmarkAnchor
                              id={AIC_TOUR_ANCHORS.framingBox}
                              shape="rect"
                              radius={16}
                              padding={8}
                              scrollRef={therapyScrollRef}
                            >
                              <View ref={framingBoxRef} collapsable={false}>
                                <AppCard variant="brand">
                                  <YStack width="100%" gap="$3">
                                    <AppText
                                      variant="label"
                                      style={{ textAlign: "center" }}
                                    >
                                      Esempio — dove trovare il codice AIC
                                    </AppText>
                                    <AicScanExampleImage size="full" />
                                  </YStack>
                                </AppCard>
                              </View>
                            </CoachmarkAnchor>

                            {scanError ? (
                              <AppText variant="caption" color="error">
                                {scanError}
                              </AppText>
                            ) : null}

                            <CoachmarkAnchor
                              id={AIC_TOUR_ANCHORS.resultCard}
                              shape="rect"
                              radius={16}
                              padding={10}
                              scrollRef={therapyScrollRef}
                            >
                              <View ref={resultCardRef} collapsable={false}>
                                <AppCard>
                                  <ScannedMedicationForm
                                    key="scan-form-preview"
                                    values={THERAPY_FORM_PREVIEW}
                                    onChange={() => {}}
                                    disabled
                                  />
                                  <AppText
                                    variant="caption"
                                    muted
                                    style={{
                                      textAlign: "center",
                                      lineHeight: 20,
                                    }}
                                  >
                                    Anteprima — dopo la scansione potrai
                                    verificare i dati e impostare orari e
                                    promemoria.
                                  </AppText>
                                </AppCard>
                              </View>
                            </CoachmarkAnchor>
                          </>
                        ) : null}

                        {medicationPhase === "verify" && scanFormValues ? (
                          <CoachmarkAnchor
                            id={AIC_TOUR_ANCHORS.resultCard}
                            shape="rect"
                            radius={16}
                            padding={10}
                            scrollRef={therapyScrollRef}
                          >
                            <YStack width="100%" gap="$4">
                              <YStack gap="$3" width="100%">
                                <AppText variant="title" color="secondary" textAlign="center">
                                  Verifica i dati del farmaco
                                </AppText>
                                <AppText
                                  variant="body"
                                  muted
                                  textAlign="center"
                                >
                                  Controlla che nome, codice AIC e quantità
                                  siano corretti prima di impostare orari e
                                  promemoria.
                                </AppText>

                                <AppCard>
                                  <ScannedMedicationForm
                                    key={`scan-form-${scanFormValues.aic}`}
                                    values={scanFormValues}
                                    onChange={setScanFormValues}
                                    disabled={isScanning}
                                  />
                                </AppCard>

                                <AppCard>
                                  <MedicationQuantitySection
                                    values={scanFormValues}
                                    onChange={setScanFormValues}
                                    disabled={isScanning}
                                  />
                                </AppCard>

                                <YStack width="100%" gap="$3">
                                  <PrimaryButton
                                    onPress={handleVerifyNext}
                                    fullWidth
                                    accessibilityLabel="Passa a orari e promemoria"
                                  >
                                    Avanti
                                  </PrimaryButton>
                                  <SecondaryButton
                                    onPress={handleTherapyMedBack}
                                    fullWidth
                                  >
                                    Indietro
                                  </SecondaryButton>
                                </YStack>
                              </YStack>
                            </YStack>
                          </CoachmarkAnchor>
                        ) : null}

                        {medicationPhase === "schedule" && scanFormValues ? (
                          <YStack width="100%" gap="$4">
                            <YStack gap="$3" width="100%">
                              <BrandIntroCard
                                icon="bell-ring-outline"
                                title={scanFormValues.nome.trim()}
                                description="Ultimo passo: scegli dosaggio, orari e promemoria per questo farmaco."
                              />
                              <AppCard>
                                <TherapyReminderSettings
                                  value={reminderSettings}
                                  onChange={setReminderSettings}
                                  dose={dose}
                                  onDoseChange={setDose}
                                  unitaQuantita={scanFormValues.unitaQuantita}
                                />
                              </AppCard>

                              <YStack width="100%" gap="$3">
                                <PrimaryButton
                                  icon="check-circle-outline"
                                  onPress={handleScheduleFinishPlan}
                                  fullWidth
                                >
                                  Termina piano terapeutico
                                </PrimaryButton>
                                <SecondaryButton
                                  icon="plus"
                                  onPress={handleScheduleScanAnother}
                                  fullWidth
                                >
                                  Scansiona un altro farmaco
                                </SecondaryButton>
                                <AppButton
                                  variant="ghost"
                                  onPress={handleTherapyMedBack}
                                  fullWidth
                                >
                                  Indietro
                                </AppButton>
                              </YStack>
                            </YStack>
                          </YStack>
                        ) : null}
                      </YStack>

                    {errorMessage ? (
                      <AppText variant="caption" color="error">
                        {errorMessage}
                      </AppText>
                    ) : null}

                    {medicationPhase === "scan" ? (
                      <YStack width="100%" gap="$3">
                        <SecondaryButton
                          onPress={handleTherapyMedBack}
                          fullWidth
                        >
                          Indietro
                        </SecondaryButton>
                        {configuredMedications.length > 0 ? (
                          <PrimaryButton
                            onPress={handleTherapyContinue}
                            fullWidth
                          >
                            Continua
                          </PrimaryButton>
                        ) : null}
                      </YStack>
                    ) : null}
                    </AppCardContent>
                  </AppCard>
                ) : null}
              </ScrollView>
            </KeyboardAvoidingView>
            </YStack>
          ) : (
            <ProfileSetupLayout hero={profileHero} scrollable={false}>
              <ProfileSetupStepContent
                step={step}
                welcomeMeta={welcomeMeta}
                guestName={guestName}
                onGuestNameChange={setGuestName}
                guestAge={guestAge}
                onGuestAgeChange={setGuestAge}
                isAgeValid={isAgeValid}
                guestSex={guestSex}
                onGuestSexChange={setGuestSex}
                wantsTherapy={wantsTherapy}
                errorMessage={errorMessage}
                isSaving={isSaving}
                onContinue={goNext}
                onBack={goBack}
                onFinish={() => void finishSetup()}
                onOpenNameForm={() => setNameModalVisible(true)}
              />
            </ProfileSetupLayout>
          )}
        </ProfileSetupAnimatedShell>
      </ScreenSafeArea>
      <ProfileSetupNameModal
        visible={step === "name" && nameModalVisible}
        guestName={guestName}
        onGuestNameChange={setGuestName}
        onClose={() => setNameModalVisible(false)}
        onBack={goBack}
        onContinue={goNext}
      />
      <AicTourIntroModal
        visible={
          step === "therapy" && wantsTherapy === true && !canScan && !isActive
        }
        onStart={() => startTherapyTour(true)}
        onSkip={() => setTourSkipped(true)}
      />
      {step === "therapy" ? <AicTourOverlay /> : null}
    </YStack>
  );
}
