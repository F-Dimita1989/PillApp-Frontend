import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ScreenSafeArea } from "@/components/screen-safe-area";
import { Colors } from "@/constants/theme";
import { saveGuestProfile } from "@/lib/profile/storage";

type PostOnboardingFlowProps = {
  onComplete: () => void;
};

type SetupStep = "name" | "privacy" | "start";

const STEPS: SetupStep[] = ["name", "privacy", "start"];

export function PostOnboardingFlow({ onComplete }: PostOnboardingFlowProps) {
  const colors = Colors.light;
  const [stepIndex, setStepIndex] = useState(0);
  const [guestName, setGuestName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const step = STEPS[stepIndex];

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((current) => current + 1);
    }
  };

  const finishSetup = async () => {
    const normalizedName = guestName.trim();
    if (!normalizedName || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      await saveGuestProfile(normalizedName);
      onComplete();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <LinearGradient
      colors={["#EAF8FF", "#D7F0FF", "#C7E8FF"]}
      style={styles.gradientBackground}
    >
      <ScreenSafeArea includeBottomInset style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={require("@/assets/images/pillapp-splash.png")}
            style={styles.logo}
          />

          <View style={styles.stepper}>
            {STEPS.map((item, index) => (
              <View
                key={item}
                style={[
                  styles.stepDot,
                  index <= stepIndex ? styles.stepDotActive : null,
                ]}
              />
            ))}
          </View>

          {step === "name" ? (
            <>
              <Text style={[styles.title, { color: colors.text }]}>
                Come ti chiami?
              </Text>
              <Text style={[styles.subtitle, { color: colors.text }]}>
                Inserisci il tuo nome o un nickname per personalizzare PillApp.
              </Text>
              <View style={styles.card}>
                <TextInput
                  value={guestName}
                  onChangeText={setGuestName}
                  placeholder="Es. Mario o SuperNonna"
                  placeholderTextColor="#667085"
                  autoCapitalize="words"
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderColor: "#98A2B3",
                      backgroundColor: "#F8FAFC",
                    },
                  ]}
                />
                <Pressable
                  style={[
                    styles.primaryButton,
                    {
                      backgroundColor: colors.tint,
                      opacity: guestName.trim() ? 1 : 0.5,
                    },
                  ]}
                  disabled={!guestName.trim()}
                  onPress={goNext}
                >
                  <Text style={styles.primaryButtonText}>Continua</Text>
                </Pressable>
              </View>
            </>
          ) : null}

          {step === "privacy" ? (
            <>
              <Text style={[styles.title, { color: colors.text }]}>
                La tua privacy
              </Text>
              <Text style={[styles.subtitle, { color: colors.text }]}>
                PillApp è pensata per essere semplice e rispettosa dei tuoi dati.
              </Text>
              <View style={styles.card}>
                <Text style={[styles.privacyText, { color: colors.text }]}>
                  Non richiediamo registrazione con email o password. Il nickname
                  resta solo sul tuo telefono.
                </Text>
                <Text style={[styles.privacyText, { color: colors.text }]}>
                  Non inviamo i tuoi dati personali a server esterni per creare un
                  profilo utente: nessun account cloud viene creato da PillApp.
                </Text>
                <Text style={[styles.privacyText, { color: colors.text }]}>
                  Le scansioni e i piani terapeutici vengono usati per mostrarti le
                  informazioni utili direttamente in app, senza rivendere i
                  tuoi dati a terze parti.
                </Text>
                <Pressable
                  style={[styles.primaryButton, { backgroundColor: colors.tint }]}
                  onPress={goNext}
                >
                  <Text style={styles.primaryButtonText}>Ho capito</Text>
                </Pressable>
              </View>
            </>
          ) : null}

          {step === "start" ? (
            <>
              <Text style={[styles.title, { color: colors.text }]}>
                Tutto pronto, {guestName.trim()}!
              </Text>
              <Text style={[styles.subtitle, { color: colors.text }]}>
                Puoi iniziare a scansionare i farmaci e organizzare la tua terapia
                settimanale.
              </Text>
              <View style={styles.card}>
                <Text style={[styles.privacyText, { color: colors.text }]}>
                  Ricorda: tieni il telefono fermo durante la scansione del codice
                  AIC e inquadra bene la confezione.
                </Text>
                <Pressable
                  style={[
                    styles.primaryButton,
                    {
                      backgroundColor: colors.tint,
                      opacity: isSaving ? 0.7 : 1,
                    },
                  ]}
                  disabled={isSaving}
                  onPress={() => void finishSetup()}
                >
                  <Text style={styles.primaryButtonText}>Iniziamo</Text>
                </Pressable>
              </View>
            </>
          ) : null}
        </ScrollView>
      </ScreenSafeArea>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 28,
    justifyContent: "center",
    gap: 12,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
  },
  stepper: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 4,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#B8D4E8",
  },
  stepDotActive: {
    backgroundColor: "#0a7ea4",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: "center",
    opacity: 0.9,
  },
  card: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 14,
    padding: 14,
    gap: 12,
    backgroundColor: "#FFFFFF",
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 18,
  },
  privacyText: {
    fontSize: 16,
    lineHeight: 24,
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
});
