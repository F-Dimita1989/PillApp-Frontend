import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
    CoachmarkAnchor,
    createTour,
    useCoachmark,
} from "@edwardloopez/react-native-coachmark";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Image,
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

import { AicTourIntroModal } from "@/components/coachmark/aic-tour-intro-modal";
import { AicTourOverlay } from "@/components/coachmark/aic-tour-overlay";
import { AicScanTourTooltip } from "@/components/coachmark/aic-scan-tour-tooltip";
import { AicScanExampleImage } from "@/components/farmaci/aic-scan-example-image";
import { MedicationQuantitySection } from "@/components/farmaci/medication-quantity-section";
import { ScannedMedicationForm } from "@/components/farmaci/scanned-medication-form";
import { SetupStepHeader } from "@/components/setup/setup-step-header";
import { TherapyReminderSettings } from "@/components/therapy/therapy-reminder-settings";
import { ScreenSafeArea } from "@/components/screen-safe-area";
import {
    AppButton,
    AppButtonRow,
    AppCard,
    AppCardContent,
    AppChip,
    AppDivider,
    AppInput,
    AppProgress,
    AppText,
    ChoiceCard,
    IntroHeroArc,
    PrimaryButton,
    SecondaryButton,
} from "@/components/ui";
import {
    AIC_SCAN_TOUR_KEY,
    AIC_TOUR_ANCHORS,
} from "@/constants/aic-scanner-tour";
import {
    THERAPY_FORM_PREVIEW,
} from "@/constants/therapy-form-preview";
import {
    GUEST_SEX_OPTIONS,
    MAX_GUEST_AGE,
    MIN_GUEST_AGE,
    type GuestSex,
} from "@/constants/profile";
import { pillappColors, pillappLayout } from "@/theme/tokens";
import {
  setupScrollShort,
  setupScrollTherapy,
  setupScrollTourFraming,
  setupScrollTourResult,
} from "@/theme/setup-layout";
import {
  ensureVisibleInScroll,
  TOUR_TOOLTIP_BOTTOM_RESERVE,
} from "@/lib/coachmark/scroll-anchor-into-view";
import { nearestTherapyDoseOption } from "@/lib/therapy/dose-options";
import {
    buildScannedMedicationFormValues,
    therapyDoseFromFormValues,
    type ScannedMedicationFormValues,
} from "@/lib/farmaci/form-values";
import { pickAndScanMedicine } from "@/lib/farmaci/scan";
import {
    saveSetupMedications,
    type SetupTherapyMedication,
} from "@/lib/app-data/save-setup-medications";
import { isValidGuestAge, saveGuestProfile } from "@/lib/profile/storage";
import {
    INITIAL_THERAPY_REMINDER_SETTINGS,
    validateReminderSettings,
    type TherapyReminderSettingsValue,
} from "@/lib/therapy/reminder-settings";

type PostOnboardingFlowProps = {
  onComplete: () => void;
};

type SetupStep =
  | "welcome"
  | "name"
  | "age"
  | "sex"
  | "privacy"
  | "therapy"
  | "done";

type MedicationConfigPhase = "scan" | "verify" | "schedule";

const STEPS: SetupStep[] = [
  "welcome",
  "name",
  "age",
  "sex",
  "privacy",
  "therapy",
  "done",
];

export function PostOnboardingFlow({ onComplete }: PostOnboardingFlowProps) {
  const insets = useSafeAreaInsets();
  const [stepIndex, setStepIndex] = useState(0);
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
  const { start, isActive, stop, activeStep, index: tourIndex } = useCoachmark();

  const canScan = tourCompleted || tourSkipped;

  const step = STEPS[stepIndex];
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
          delay: 300,
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

  const handleTherapyScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollYRef.current = event.nativeEvent.contentOffset.y;
  };

  const goNext = () => {
    setErrorMessage("");
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((current) => current + 1);
    }
  };

  const goBack = () => {
    setErrorMessage("");
    if (stepIndex > 0) {
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
    if (configuredMedications.some((item) => item.scanFormValues.aic.trim() === aic)) {
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
      setErrorMessage(validationError ?? "Scansiona la confezione del farmaco.");
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

        const { notificationWarning } =
          await saveSetupMedications(configuredMedications);
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

  const greetingName = guestName.trim() || "amico";

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScreenSafeArea includeBottomInset style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            ref={therapyScrollRef}
            contentContainerStyle={[
              step === "therapy" ? setupScrollTherapy : setupScrollShort,
              step === "welcome" && { paddingTop: 0, justifyContent: "flex-start" },
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
            {step === "welcome" ? (
              <IntroHeroArc
                title="Ciao, benvenuto in PillApp!"
                subtitle="Ti guiderò passo passo. Useremo la modalità ospite: niente account, niente password — le informazioni restano solo sul tuo telefono."
                parentPaddingX={pillappLayout.screenPaddingX}
              />
            ) : (
              <Image
                source={require("@/assets/images/pillapp-logo.png")}
                style={{ width: 200, height: 200, alignSelf: "center" }}
              />
            )}

            <AppProgress
              progress={(stepIndex + 1) / STEPS.length}
              height={6}
              borderRadius={3}
              marginBottom={4}
            />

            {step === "welcome" ? (
              <>
                <AppCard variant="elevated">
                  <AppCardContent gap="$4">
                    <AppText variant="body">
                      In pochi minuti ti chiederò nome o nickname, età e sesso,
                      poi scansioneremo insieme la confezione del farmaco per
                      impostare la terapia.
                    </AppText>
                    <PrimaryButton onPress={goNext}>Iniziamo</PrimaryButton>
                  </AppCardContent>
                </AppCard>
              </>
            ) : null}

            {step === "name" ? (
              <>
                <SetupStepHeader
                  title="Come posso chiamarti?"
                  subtitle="Puoi usare il tuo nome oppure un nickname che ti fa sentire a tuo agio."
                />
                <AppCard variant="elevated">
                  <AppCardContent gap="$4">
                    <AppInput
                      label="Nome o nickname"
                      value={guestName}
                      onChangeText={setGuestName}
                      placeholder="Es. Maria o SuperNonna"
                      autoCapitalize="words"
                      autoFocus
                    />
                    <AppButtonRow>
                      <SecondaryButton onPress={goBack}>Indietro</SecondaryButton>
                      <PrimaryButton
                        disabled={!guestName.trim()}
                        onPress={goNext}
                      >
                        Continua
                      </PrimaryButton>
                    </AppButtonRow>
                  </AppCardContent>
                </AppCard>
              </>
            ) : null}

            {step === "age" ? (
              <>
                <SetupStepHeader
                  title={`Quanti anni hai, ${guestName.trim()}?`}
                  subtitle="Ci aiuta a proporti un'esperienza più chiara e adatta a te."
                />
                <AppCard variant="elevated">
                  <AppCardContent gap="$4">
                    <AppInput
                      label="Età"
                      value={guestAge}
                      onChangeText={(value) =>
                        setGuestAge(value.replace(/\D/g, "").slice(0, 3))
                      }
                      placeholder="Es. 72"
                      keyboardType="number-pad"
                      autoFocus
                    />
                    {!guestAge.trim() || isAgeValid ? null : (
                      <AppText
                        variant="caption"
                        color="error"
                      >
                        Inserisci un&apos;età tra {MIN_GUEST_AGE} e{" "}
                        {MAX_GUEST_AGE} anni.
                      </AppText>
                    )}
                    <AppButtonRow>
                      <SecondaryButton onPress={goBack}>Indietro</SecondaryButton>
                      <PrimaryButton
                        disabled={!isAgeValid}
                        onPress={goNext}
                      >
                        Continua
                      </PrimaryButton>
                    </AppButtonRow>
                  </AppCardContent>
                </AppCard>
              </>
            ) : null}

            {step === "sex" ? (
              <>
                <SetupStepHeader
                  title="Come ti identifichi?"
                  subtitle="Serve solo per personalizzare i messaggi. Puoi anche non rispondere, se preferisci."
                />
                <AppCard variant="elevated">
                  <AppCardContent gap="$4">
                    {GUEST_SEX_OPTIONS.map((option) => (
                      <ChoiceCard
                        key={option.value}
                        label={option.label}
                        description={option.description}
                        selected={guestSex === option.value}
                        onPress={() => setGuestSex(option.value)}
                      />
                    ))}
                    <AppButtonRow>
                      <SecondaryButton onPress={goBack}>Indietro</SecondaryButton>
                      <PrimaryButton
                        disabled={!guestSex}
                        onPress={goNext}
                      >
                        Continua
                      </PrimaryButton>
                    </AppButtonRow>
                  </AppCardContent>
                </AppCard>
              </>
            ) : null}

            {step === "privacy" ? (
              <>
                <SetupStepHeader
                  title="La tua privacy, spiegata semplice"
                  subtitle="PillApp è pensata per chi vuole tranquillità e rispetto dei dati personali."
                />
                <AppCard variant="elevated">
                  <AppCardContent gap="$4">
                    <AppText variant="body">
                      • Nessuna registrazione con email o password{"\n"}• Nome,
                      età e sesso restano solo sul telefono{"\n"}• Nessun
                      profilo utente salvato su server esterni{"\n"}• Le
                      scansioni servono solo a mostrarti le informazioni utili
                      in app
                    </AppText>
                    <AppButtonRow>
                      <SecondaryButton onPress={goBack}>Indietro</SecondaryButton>
                      <PrimaryButton onPress={goNext}>Ho capito</PrimaryButton>
                    </AppButtonRow>
                  </AppCardContent>
                </AppCard>
              </>
            ) : null}

            {step === "therapy" ? (
              <>
                <CoachmarkAnchor
                  id={AIC_TOUR_ANCHORS.intro}
                  shape="rect"
                  radius={16}
                  padding={12}
                  scrollRef={therapyScrollRef}
                >
                  <YStack width="100%" gap="$2" alignItems="center">
                    <AppText variant="title" textAlign="center">
                      Configuriamo la tua terapia
                    </AppText>
                    <AppText variant="body" muted textAlign="center">
                      Hai farmaci da prendere con regolarità? Scansiona le
                      confezioni una alla volta: puoi aggiungerne più di uno.
                    </AppText>
                  </YStack>
                </CoachmarkAnchor>
                <AppCard variant="elevated">
                  <AppCardContent gap="$4">
                    <YStack width="100%" gap="$2">
                      <AppChip
                        label="Sì, impostiamola"
                        selected={wantsTherapy === true}
                        onPress={() => {
                          setWantsTherapy(true);
                          setErrorMessage("");
                        }}
                        style={{ alignSelf: "stretch", width: "100%" }}
                      />
                      <AppChip
                        label="Per ora no"
                        selected={wantsTherapy === false}
                        onPress={() => {
                          setWantsTherapy(false);
                          resetScan();
                          setConfiguredMedications([]);
                          setErrorMessage("");
                        }}
                        style={{ alignSelf: "stretch", width: "100%" }}
                      />
                    </YStack>

                    {wantsTherapy ? (
                      <YStack width="100%" gap="$4">
                        <AppDivider marginVertical="$1" />

                        {configuredMedications.length > 0 ? (
                          <YStack width="100%" gap="$2">
                            <AppText variant="title" textAlign="center">
                              Farmaci aggiunti ({configuredMedications.length})
                            </AppText>
                            <XStack flexWrap="wrap" gap="$2" justifyContent="center">
                              {configuredMedications.map((item, index) => (
                                <AppChip
                                  key={`${item.scanFormValues.aic}-${index}`}
                                  label={item.scanFormValues.nome.trim()}
                                  icon="pill"
                                  onClose={() => removeConfiguredMedication(index)}
                                  style={{ maxWidth: "100%" }}
                                />
                              ))}
                            </XStack>
                            <AppText variant="caption" muted textAlign="center">
                              Puoi aggiungerne altri dopo aver completato il farmaco
                              corrente.
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
                              <MaterialCommunityIcons
                                name="camera"
                                size={24}
                                color={pillappColors.primary}
                              />
                              <AppText variant="title" textAlign="center">
                                Scansiona la confezione
                              </AppText>
                            </XStack>
                            <AppText variant="body" textAlign="center">
                              Scatta una foto nitida del codice AIC stampato sulla
                              scatola.
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
                                <YStack
                                  width="100%"
                                  borderRadius="$3"
                                  borderWidth={2}
                                  borderStyle="dashed"
                                  borderColor="$primary"
                                  backgroundColor="$surface"
                                  alignItems="stretch"
                                  justifyContent="center"
                                  padding="$3"
                                  gap="$3"
                                >
                                  <YStack gap="$3" width="100%">
                                  <AppText
                                    variant="label"
                                    color="primary"
                                    style={{ textAlign: "center" }}
                                  >
                                    Esempio — dove trovare il codice AIC
                                  </AppText>
                                  <AicScanExampleImage size="full" />
                                  <AppText
                                    variant="caption"
                                    muted
                                    style={{ textAlign: "center", lineHeight: 18 }}
                                  >
                                    Dopo la foto, qui comparirà l&apos;anteprima scattata
                                  </AppText>
                                </YStack>
                              </YStack>
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
                                <YStack width="100%" gap="$4">
                                <YStack
                                  width="100%"
                                  gap="$2"
                                  padding="$4"
                                  borderRadius="$3"
                                  borderLeftWidth={4}
                                  borderLeftColor="$primary"
                                  backgroundColor="$surfaceMuted"
                                >
                                  <ScannedMedicationForm
                                    key="scan-form-preview"
                                    values={THERAPY_FORM_PREVIEW}
                                    onChange={() => {}}
                                    disabled
                                  />
                                  <AppText
                                    variant="caption"
                                    muted
                                    style={{ textAlign: "center", lineHeight: 20 }}
                                  >
                                    Anteprima — dopo la scansione potrai verificare i
                                    dati e impostare orari e promemoria.
                                  </AppText>
                                </YStack>
                                </YStack>
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
                                <AppText variant="title" textAlign="center">
                                  Verifica i dati del farmaco
                                </AppText>
                                <AppText variant="body" muted textAlign="center">
                                  Controlla che nome, codice AIC e quantità siano corretti
                                  prima di impostare orari e promemoria.
                                </AppText>

                                <YStack
                                  width="100%"
                                  gap="$2"
                                  padding="$4"
                                  borderRadius="$3"
                                  borderLeftWidth={4}
                                  borderLeftColor="$primary"
                                  backgroundColor="$surfaceMuted"
                                >
                                  <ScannedMedicationForm
                                    key={`scan-form-${scanFormValues.aic}`}
                                    values={scanFormValues}
                                    onChange={setScanFormValues}
                                    disabled={isScanning}
                                  />
                                </YStack>

                                <MedicationQuantitySection
                                  values={scanFormValues}
                                  onChange={setScanFormValues}
                                  disabled={isScanning}
                                />

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
                              <AppText variant="title" textAlign="center">
                                {scanFormValues.nome.trim()}
                              </AppText>
                              <AppText variant="caption" muted textAlign="center">
                                Ultimo passo: scegli dosaggio, orari e promemoria per questo
                                farmaco.
                              </AppText>

                              <TherapyReminderSettings
                                value={reminderSettings}
                                onChange={setReminderSettings}
                                dose={dose}
                                onDoseChange={setDose}
                                unitaQuantita={scanFormValues.unitaQuantita}
                              />

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
                    ) : null}

                    {errorMessage ? (
                      <AppText variant="caption" color="error">
                        {errorMessage}
                      </AppText>
                    ) : null}

                    {wantsTherapy && medicationPhase === "scan" ? (
                      <YStack width="100%" gap="$3">
                        <SecondaryButton onPress={handleTherapyMedBack} fullWidth>
                          Indietro
                        </SecondaryButton>
                        {configuredMedications.length > 0 ? (
                          <PrimaryButton onPress={handleTherapyContinue} fullWidth>
                            Continua
                          </PrimaryButton>
                        ) : null}
                      </YStack>
                    ) : !wantsTherapy ? (
                      <YStack width="100%" gap="$3">
                        <SecondaryButton onPress={goBack} fullWidth>
                          Indietro
                        </SecondaryButton>
                        <PrimaryButton onPress={handleTherapyContinue} fullWidth>
                          Continua
                        </PrimaryButton>
                      </YStack>
                    ) : null}
                  </AppCardContent>
                </AppCard>
              </>
            ) : null}

            {step === "done" ? (
              <>
                <SetupStepHeader
                  title={`Tutto pronto, ${greetingName}!`}
                  subtitle={
                    wantsTherapy
                      ? configuredCount === 1
                        ? `Ho salvato il promemoria per ${configuredMedications[0]?.scanFormValues.nome.trim() || farmacoNome}.`
                        : `Ho salvato ${configuredCount} farmaci con i rispettivi promemoria.`
                      : "Quando vorrai, potrai scansionare una confezione in Home e impostare i promemoria dalla tab Farmaci."
                  }
                />
                <AppCard variant="elevated">
                  <AppCardContent gap="$4">
                    <AppText variant="body">
                      Ricorda: tieni il telefono fermo durante la scansione del
                      codice AIC e inquadra bene la confezione.
                    </AppText>
                    {errorMessage ? (
                      <AppText variant="caption" color="error">
                        {errorMessage}
                      </AppText>
                    ) : null}
                    <YStack width="100%" gap="$3">
                      <SecondaryButton onPress={goBack} fullWidth>
                        Indietro
                      </SecondaryButton>
                      <PrimaryButton
                        disabled={isSaving}
                        onPress={() => void finishSetup()}
                        fullWidth
                      >
                        {isSaving ? "Salvo..." : "Entra in PillApp"}
                      </PrimaryButton>
                    </YStack>
                  </AppCardContent>
                </AppCard>
              </>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </ScreenSafeArea>
      <AicTourIntroModal
        visible={
          step === "therapy" &&
          wantsTherapy === true &&
          !canScan &&
          !isActive
        }
        onStart={() => startTherapyTour(true)}
        onSkip={() => setTourSkipped(true)}
      />
      {step === "therapy" ? <AicTourOverlay /> : null}
    </YStack>
  );
}
