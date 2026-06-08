import type { PageData as Page } from "react-native-onboarding-swiper";
import { Image, StyleSheet } from "react-native";

// Modifica testi, colori e require() delle immagini in questo file.
const onboardingImageStyle = {
  width: 220,
  height: 220,
  resizeMode: "contain" as const,
};

const pageTitleStyle = {
  fontSize: 28,
  fontWeight: "800" as const,
  textAlign: "center" as const,
  paddingHorizontal: 24,
  color: "#0F172A",
};

const pageSubtitleStyle = {
  fontSize: 17,
  lineHeight: 26,
  textAlign: "center" as const,
  paddingHorizontal: 28,
  color: "#334155",
};

export const pillAppOnboardingPages: Page[] = [
  {
    backgroundColor: "#ffffff",
    title: "Benvenuto in PillApp",
    subtitle:
      "L'app che ti aiuta a ricordare farmaci e orari, in modo semplice e sicuro.",
    image: (
      <Image
        source={require("@/assets/onboarding/welcome.png")}
        style={onboardingImageStyle}
      />
    ),
    titleStyles: pageTitleStyle,
    subTitleStyles: pageSubtitleStyle,
  },
  {
    backgroundColor: "#f2f6ff",
    title: "Registra i tuoi farmaci",
    subtitle: "Inserisci nome, dosaggio e tipo di ogni farmaco in pochi tap.",
    image: (
      <Image
        source={require("@/assets/onboarding/meds.png")}
        style={onboardingImageStyle}
      />
    ),
    titleStyles: pageTitleStyle,
    subTitleStyles: pageSubtitleStyle,
  },
  {
    backgroundColor: "#e8fff5",
    title: "Non dimenticare una dose",
    subtitle:
      "Imposta promemoria e ricevi notifiche quando è il momento di prendere il farmaco.",
    image: (
      <Image
        source={require("@/assets/onboarding/reminders.png")}
        style={onboardingImageStyle}
      />
    ),
    titleStyles: pageTitleStyle,
    subTitleStyles: pageSubtitleStyle,
  },
  {
    backgroundColor: "#fff7e8",
    title: "Tutto sotto controllo",
    subtitle:
      "Calendario assunzioni e stato delle terapie, sempre a portata di mano.",
    image: (
      <Image
        source={require("@/assets/onboarding/overview.png")}
        style={onboardingImageStyle}
      />
    ),
    titleStyles: pageTitleStyle,
    subTitleStyles: pageSubtitleStyle,
  },
];

export const onboardingSharedStyles = StyleSheet.create({
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    paddingHorizontal: 24,
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 26,
    textAlign: "center",
    paddingHorizontal: 28,
    color: "#334155",
  },
});
