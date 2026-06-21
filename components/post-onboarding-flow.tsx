import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
    CoachmarkAnchor,
    CoachmarkOverlay,
    createTour,
    useCoachmark,
} from "@edwardloopez/react-native-coachmark";
import { Image as ExpoImage } from "expo-image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
    type ScrollView as ScrollViewType,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { YStack } from "tamagui";

import { AicScanTourTooltip } from "@/components/coachmark/aic-scan-tour-tooltip";
import { AicScanExampleImage } from "@/components/farmaci/aic-scan-example-image";
import { MedicationQuantitySection } from "@/components/farmaci/medication-quantity-section";
import { ScannedMedicationForm } from "@/components/farmaci/scanned-medication-form";
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
    PrimaryButton,
    SecondaryButton,
} from "@/components/ui";
import {
    AIC_SCAN_TOUR_KEY,
    AIC_TOUR_ANCHORS,
} from "@/constants/aic-scanner-tour";
import {
    THERAPY_DOSE_PREVIEW,
    THERAPY_FORM_PREVIEW,
    THERAPY_REMINDER_PREVIEW,
} from "@/constants/therapy-form-preview";
import {
    GUEST_SEX_OPTIONS,
    MAX_GUEST_AGE,
    MIN_GUEST_AGE,
    type GuestSex,
} from "@/constants/profile";
import { layout, spacing } from "@/constants/spacing";
import { pillappColors } from "@/theme/tokens";
import { ensureVisibleInScroll } from "@/lib/coachmark/scroll-anchor-into-view";
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
  const [scanImageUri, setScanImageUri] = useState<string | null>(null);
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

  const therapyScrollRef = useRef<ScrollViewType>(null);
  const framingBoxRef = useRef<View>(null);
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
            autoFocus: "always",
            scrollBehavior: "smooth",
            scrollPadding: 160,
            scrollDelay: 400,
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
    if (
      step !== "therapy" ||
      wantsTherapy !== true ||
      tourCompleted ||
      tourSkipped
    ) {
      return;
    }

    const timer = setTimeout(() => {
      startTherapyTour();
    }, 650);

    return () => {
      clearTimeout(timer);
    };
  }, [startTherapyTour, step, tourCompleted, tourSkipped, wantsTherapy]);

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
    if (
      !isActive ||
      step !== "therapy" ||
      activeStep?.id !== AIC_TOUR_ANCHORS.framingBox
    ) {
      return;
    }

    const scrollFramingBox = () => {
      void ensureVisibleInScroll(
        therapyScrollRef,
        framingBoxRef,
        () => scrollYRef.current,
        insets,
        300,
      );
    };

    const firstScroll = setTimeout(scrollFramingBox, 100);
    const secondScroll = setTimeout(scrollFramingBox, 550);

    return () => {
      clearTimeout(firstScroll);
      clearTimeout(secondScroll);
    };
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
    setScanImageUri(null);
    setScanError("");
    setDose("1 compressa");
    setReminderSettings(INITIAL_THERAPY_REMINDER_SETTINGS);
  };

  const validateCurrentMedication = (): string | null => {
    if (!scanFormValues?.aic.trim() || !scanFormValues.nome.trim()) {
      return "Scansiona la confezione del farmaco per continuare.";
    }

    const reminderError = validateReminderSettings(reminderSettings);
    if (reminderError) {
      return reminderError;
    }

    const aic = scanFormValues.aic.trim();
    if (configuredMedications.some((item) => item.scanFormValues.aic.trim() === aic)) {
      return "Questo farmaco è già nella lista.";
    }

    return null;
  };

  const addCurrentMedicationToList = () => {
    const validationError = validateCurrentMedication();
    if (validationError || !scanFormValues) {
      setErrorMessage(validationError ?? "Scansiona la confezione del farmaco.");
      return;
    }

    setConfiguredMedications((current) => [
      ...current,
      { scanFormValues, dose, reminderSettings },
    ]);
    resetScan();
    setErrorMessage("");
  };

  const removeConfiguredMedication = (index: number) => {
    setConfiguredMedications((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const buildFinalMedicationList = (): SetupTherapyMedication[] => {
    const items = [...configuredMedications];

    if (scanFormValues?.aic.trim() && scanFormValues.nome.trim()) {
      const aic = scanFormValues.aic.trim();
      if (!items.some((item) => item.scanFormValues.aic.trim() === aic)) {
        items.push({ scanFormValues, dose, reminderSettings });
      }
    }

    return items;
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
      setScanImageUri(result.imageUri);
      setScanFormValues(formValues);
      setDose(therapyDoseFromFormValues(formValues));
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

    if (wantsTherapy) {
      const medicationsToSave = buildFinalMedicationList();
      if (medicationsToSave.length === 0) {
        setErrorMessage("Scansiona almeno un farmaco per continuare.");
        return;
      }

      if (scanFormValues) {
        const validationError = validateCurrentMedication();
        if (validationError) {
          setErrorMessage(validationError);
          return;
        }
      }

      setConfiguredMedications(medicationsToSave);
      resetScan();
    }

    setErrorMessage("");
    goNext();
  };

  const greetingName = guestName.trim() || "amico";

  return (
    <View style={styles.surface}>
      <ScreenSafeArea includeBottomInset style={styles.screen}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            ref={therapyScrollRef}
            contentContainerStyle={[
              styles.container,
              step === "therapy"
                ? styles.therapyScrollContent
                : styles.shortStepContent,
              isActive &&
                activeStep?.id === AIC_TOUR_ANCHORS.framingBox &&
                styles.therapyTourFramingScroll,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={handleTherapyScroll}
          >
            <Image
              source={require("@/assets/images/pillapp-logo.png")}
              style={styles.logo}
            />

            <AppProgress
              progress={(stepIndex + 1) / STEPS.length}
              height={6}
              borderRadius={3}
              marginBottom={4}
            />

            {step === "welcome" ? (
              <>
                <AppText variant="headline" style={styles.title}>
                  Ciao, benvenuto in PillApp!
                </AppText>
                <AppText variant="body" muted style={styles.subtitle}>
                  Ti guiderò passo passo. Useremo la modalità ospite: niente
                  account, niente password — le informazioni restano solo sul
                  tuo telefono.
                </AppText>
                <AppCard variant="elevated" style={styles.card}>
                  <AppCardContent style={styles.cardContent}>
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
                <AppText variant="headline" style={styles.title}>
                  Come posso chiamarti?
                </AppText>
                <AppText variant="body" muted style={styles.subtitle}>
                  Puoi usare il tuo nome oppure un nickname che ti fa sentire a
                  tuo agio.
                </AppText>
                <AppCard variant="elevated" style={styles.card}>
                  <AppCardContent style={styles.cardContent}>
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
                <AppText variant="headline" style={styles.title}>
                  Quanti anni hai, {guestName.trim()}?
                </AppText>
                <AppText variant="body" muted style={styles.subtitle}>
                  Ci aiuta a proporti un&apos;esperienza più chiara e adatta a
                  te.
                </AppText>
                <AppCard variant="elevated" style={styles.card}>
                  <AppCardContent style={styles.cardContent}>
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
                <AppText variant="headline" style={styles.title}>
                  Come ti identifichi?
                </AppText>
                <AppText variant="body" muted style={styles.subtitle}>
                  Serve solo per personalizzare i messaggi. Puoi anche non
                  rispondere, se preferisci.
                </AppText>
                <AppCard variant="elevated" style={styles.card}>
                  <AppCardContent style={styles.cardContent}>
                    {GUEST_SEX_OPTIONS.map((option) => {
                      const isSelected = guestSex === option.value;
                      return (
                        <Pressable
                          key={option.value}
                          style={[
                            styles.choiceButton,
                            {
                              borderColor: isSelected
                                ? pillappColors.primary
                                : pillappColors.border,
                              backgroundColor: isSelected
                                ? pillappColors.primarySoft
                                : pillappColors.surfaceMuted,
                            },
                          ]}
                          onPress={() => setGuestSex(option.value)}
                        >
                          <AppText
                            variant="title"
                            color={isSelected ? "primary" : undefined}
                          >
                            {option.label}
                          </AppText>
                          <AppText variant="caption" style={{ opacity: 0.85 }}>
                            {option.description}
                          </AppText>
                        </Pressable>
                      );
                    })}
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
                <AppText variant="headline" style={styles.title}>
                  La tua privacy, spiegata semplice
                </AppText>
                <AppText variant="body" muted style={styles.subtitle}>
                  PillApp è pensata per chi vuole tranquillità e rispetto dei
                  dati personali.
                </AppText>
                <AppCard variant="elevated" style={styles.card}>
                  <AppCardContent style={styles.cardContent}>
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
                  <View style={styles.therapyIntro}>
                    <AppText variant="title" style={styles.therapyHeadline}>
                      Configuriamo la tua terapia
                    </AppText>
                    <AppText variant="body" muted style={styles.therapySubtitle}>
                      Hai farmaci da prendere con regolarità? Scansiona le
                      confezioni una alla volta: puoi aggiungerne più di uno.
                    </AppText>
                  </View>
                </CoachmarkAnchor>
                <AppCard variant="elevated" style={styles.card}>
                  <AppCardContent style={styles.cardContent}>
                    <View style={styles.therapyChoiceRow}>
                      <AppChip
                        label="Sì, impostiamola"
                        selected={wantsTherapy === true}
                        onPress={() => {
                          setWantsTherapy(true);
                          setErrorMessage("");
                        }}
                        style={styles.therapyChip}
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
                        style={styles.therapyChip}
                      />
                    </View>

                    {wantsTherapy ? (
                      <View style={styles.therapyForm}>
                        {!canScan && !isActive ? (
                          <YStack
                            style={[
                              styles.tourHint,
                              {
                                backgroundColor: pillappColors.primarySoft,
                              },
                            ]}
                          >
                            <View style={styles.tourHintHeader}>
                              <MaterialCommunityIcons
                                name="school-outline"
                                size={28}
                                color={pillappColors.primary}
                              />
                              <View style={styles.tourHintTextBlock}>
                                <AppText variant="title" color="primary">
                                  Breve guida alla scansione
                                </AppText>
                                <AppText
                                  variant="body"
                                  color="primary"
                                  style={{ opacity: 0.92, lineHeight: 24 }}
                                >
                                  Segui i 4 passi oppure premi «Salta guida» per
                                  abilitare subito la fotocamera.
                                </AppText>
                              </View>
                            </View>
                            {!isActive ? (
                              <PrimaryButton
                                icon="play-circle-outline"
                                onPress={() => startTherapyTour(true)}
                                fullWidth
                              >
                                Inizia guida
                              </PrimaryButton>
                            ) : null}
                          </YStack>
                        ) : null}

                        <AppDivider style={styles.sectionDivider} />

                        {configuredMedications.length > 0 ? (
                          <View style={styles.configuredMedsBlock}>
                            <AppText variant="title" style={styles.sectionTitle}>
                              Farmaci aggiunti ({configuredMedications.length})
                            </AppText>
                            <View style={styles.configuredMedsList}>
                              {configuredMedications.map((item, index) => (
                                <AppChip
                                  key={`${item.scanFormValues.aic}-${index}`}
                                  label={item.scanFormValues.nome.trim()}
                                  icon="pill"
                                  onClose={() => removeConfiguredMedication(index)}
                                  style={styles.configuredMedChip}
                                />
                              ))}
                            </View>
                            <AppText variant="caption" muted>
                              Puoi aggiungerne altri scansionando la confezione qui sotto.
                            </AppText>
                          </View>
                        ) : null}

                        <View style={styles.sectionHeader}>
                          <MaterialCommunityIcons
                            name="camera"
                            size={24}
                            color={pillappColors.primary}
                          />
                          <AppText variant="title" style={styles.sectionTitle}>
                            Scansiona la confezione
                          </AppText>
                        </View>
                        <AppText variant="body" style={styles.sectionBody}>
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
                          <View
                            ref={framingBoxRef}
                            collapsable={false}
                            style={[
                              styles.framingBox,
                              {
                                borderColor: pillappColors.primary,
                                backgroundColor: pillappColors.surface,
                              },
                            ]}
                          >
                            {scanImageUri ? (
                              <ExpoImage
                                source={{ uri: scanImageUri }}
                                style={styles.scanPreview}
                                contentFit="cover"
                              />
                            ) : (
                              <View style={styles.framingExample}>
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
                              </View>
                            )}
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
                          <View style={styles.scanResultBlock}>
                            <YStack
                              style={[
                                styles.scanResult,
                                { borderLeftColor: pillappColors.primary },
                              ]}
                            >
                              <ScannedMedicationForm
                                key={
                                  scanFormValues
                                    ? `scan-form-${scanFormValues.aic}`
                                    : "scan-form-preview"
                                }
                                values={scanFormValues ?? THERAPY_FORM_PREVIEW}
                                onChange={
                                  scanFormValues ? setScanFormValues : () => {}
                                }
                                disabled={isScanning || !scanFormValues}
                              />
                              {scanFormValues ? (
                                <SecondaryButton
                                  icon="plus"
                                  onPress={addCurrentMedicationToList}
                                  disabled={isScanning}
                                  fullWidth
                                >
                                  Aggiungi altro farmaco
                                </SecondaryButton>
                              ) : configuredCount > 0 ? (
                                <AppText
                                  variant="caption"
                                  muted
                                  style={{ textAlign: "center", lineHeight: 20 }}
                                >
                                  Scansiona il prossimo farmaco oppure premi Continua se
                                  hai finito.
                                </AppText>
                              ) : (
                                <AppText
                                  variant="caption"
                                  muted
                                  style={{ textAlign: "center", lineHeight: 20 }}
                                >
                                  Anteprima con dati di esempio — dopo la
                                  scansione i campi verranno compilati dal
                                  database.
                                </AppText>
                              )}
                            </YStack>

                            <MedicationQuantitySection
                              values={scanFormValues ?? THERAPY_FORM_PREVIEW}
                              onChange={
                                scanFormValues ? setScanFormValues : () => {}
                              }
                              disabled={isScanning || !scanFormValues}
                            />

                            <AppDivider style={styles.sectionDivider} />

                            <TherapyReminderSettings
                              value={
                                scanFormValues
                                  ? reminderSettings
                                  : THERAPY_REMINDER_PREVIEW
                              }
                              onChange={setReminderSettings}
                              dose={scanFormValues ? dose : THERAPY_DOSE_PREVIEW}
                              onDoseChange={setDose}
                              readOnly={!scanFormValues}
                            />
                          </View>
                        </CoachmarkAnchor>
                      </View>
                    ) : null}

                    {errorMessage ? (
                      <AppText variant="caption" color="error">
                        {errorMessage}
                      </AppText>
                    ) : null}

                    <YStack width="100%" gap="$3">
                      <SecondaryButton onPress={goBack} fullWidth>
                        Indietro
                      </SecondaryButton>
                      <PrimaryButton onPress={handleTherapyContinue} fullWidth>
                        Continua
                      </PrimaryButton>
                    </YStack>
                  </AppCardContent>
                </AppCard>
              </>
            ) : null}

            {step === "done" ? (
              <>
                <AppText variant="headline" style={styles.title}>
                  Tutto pronto, {greetingName}!
                </AppText>
                <AppText variant="body" muted style={styles.subtitle}>
                  {wantsTherapy
                    ? configuredCount === 1
                      ? `Ho salvato il promemoria per ${configuredMedications[0]?.scanFormValues.nome.trim() || farmacoNome}.`
                      : `Ho salvato ${configuredCount} farmaci con i rispettivi promemoria.`
                    : "Quando vorrai, potrai scansionare una confezione in Home e impostare i promemoria dalla scheda Terapia."}
                </AppText>
                <AppCard variant="elevated" style={styles.card}>
                  <AppCardContent style={styles.cardContent}>
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
      {step === "therapy" ? <CoachmarkOverlay /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    backgroundColor: pillappColors.background,
  },
  screen: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  shortStepContent: {
    justifyContent: "center",
  },
  therapyScrollContent: {
    justifyContent: "flex-start",
    paddingBottom: spacing.xxl + spacing.lg,
  },
  therapyTourFramingScroll: {
    paddingBottom: spacing.xxl * 2 + spacing.lg,
  },
  logo: {
    width: 216,
    height: 216,
    alignSelf: "center",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  title: {
    textAlign: "center",
    fontWeight: "700",
    lineHeight: 30,
    flexShrink: 1,
    paddingHorizontal: spacing.xs,
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 24,
    flexShrink: 1,
    paddingHorizontal: spacing.xs,
  },
  card: {
    borderRadius: 16,
  },
  cardContent: {
    gap: 16,
  },
  choiceButton: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    gap: 4,
    alignItems: "center",
  },
  therapyChoiceRow: {
    flexDirection: "column",
    gap: spacing.sm,
    width: "100%",
  },
  therapyChip: {
    alignSelf: "stretch",
    width: "100%",
  },
  therapyForm: {
    gap: spacing.md,
    width: "100%",
  },
  configuredMedsBlock: {
    gap: spacing.sm,
    width: "100%",
  },
  configuredMedsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  configuredMedChip: {
    maxWidth: "100%",
  },
  therapyIntro: {
    gap: spacing.sm,
    width: "100%",
    alignItems: "center",
    alignSelf: "stretch",
    paddingHorizontal: spacing.xxs,
  },
  therapyHeadline: {
    width: "100%",
    textAlign: "center",
    fontWeight: "700",
    lineHeight: 28,
    flexShrink: 1,
  },
  therapySubtitle: {
    width: "100%",
    textAlign: "center",
    lineHeight: 22,
    opacity: 0.92,
    flexShrink: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    width: "100%",
  },
  sectionTitle: {
    fontWeight: "700",
    flexShrink: 1,
    textAlign: "center",
  },
  sectionBody: {
    lineHeight: 24,
    opacity: 0.9,
    textAlign: "center",
    width: "100%",
  },
  sectionDivider: {
    marginVertical: 4,
  },
  tourHint: {
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  tourHintHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  tourHintTextBlock: {
    flex: 1,
    gap: 6,
  },
  restartTourButton: {
    alignSelf: "stretch",
    borderRadius: 14,
  },
  scanPrimaryButton: {
    borderRadius: 14,
    alignSelf: "stretch",
  },
  largeButtonContent: {
    minHeight: 52,
    paddingVertical: 8,
  },
  framingBox: {
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "stretch",
    justifyContent: "center",
    padding: spacing.sm,
    gap: spacing.sm,
  },
  framingExample: {
    gap: spacing.sm,
    alignItems: "stretch",
    width: "100%",
  },
  scanPreview: {
    width: "100%",
    height: 160,
    borderRadius: 12,
  },
  scanResult: {
    gap: 8,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
  },
  scanResultBlock: {
    gap: spacing.md,
    width: "100%",
  },
  dayRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    justifyContent: "center",
  },
});
