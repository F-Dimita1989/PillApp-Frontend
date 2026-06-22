import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import type { ImageSourcePropType } from "react-native";

import { PillAppColors } from "@/constants/colors";

export type OnboardingSlideIcon = ComponentProps<
  typeof MaterialCommunityIcons
>["name"];

export type OnboardingSlide = {
  id: string;
  title: string;
  subtitle: string;
  icon: OnboardingSlideIcon;
  iconColor: string;
  cardBackground: string;
  badge?: string;
  showLogo?: boolean;
  image?: ImageSourcePropType;
  /** Zoom per riempire il cerchio quando image è impostata (default 1) */
  imageCoverScale?: number;
};

/** Contenuti intro PillApp — testi originali, tono semplice e rassicurante. */
export const onboardingSlides: OnboardingSlide[] = [
  {
    id: "welcome",
    title: "Ciao, che piacere averti qui",
    subtitle:
      "PillApp è il tuo compagno quotidiano per la terapia: semplice, chiaro e pensato per accompagnarti con serenità.",
    icon: "hand-wave",
    iconColor: PillAppColors.primary,
    cardBackground: PillAppColors.primaryContainer,
    showLogo: true,
  },
  {
    id: "welcome-trust",
    title: "Partiamo con calma",
    subtitle:
      "Niente registrazione né password: le tue informazioni restano sul telefono. Ti guideremo passo passo, al tuo ritmo.",
    icon: "shield-check-outline",
    iconColor: PillAppColors.secondary,
    cardBackground: PillAppColors.secondaryContainer,
    image: require("@/assets/onboarding/privacy-policy.png"),
    imageCoverScale: 1.28,
  },
  {
    id: "reminders",
    title: "I farmaci giusti, al momento giusto",
    subtitle:
      "PillApp ti aiuta a ricordare cosa prendere e quando, con un’agenda chiara e tranquilla.",
    icon: "bell-ring-outline",
    iconColor: PillAppColors.primary,
    cardBackground: PillAppColors.primaryContainer,
    image: require("@/assets/onboarding/push-notifications.png"),
    imageCoverScale: 1.28,
  },
  {
    id: "therapy",
    title: "La tua terapia, sempre sotto controllo",
    subtitle:
      "Promemoria, lista farmaci e aderenza di oggi: tutto in un unico posto, facile da consultare.",
    icon: "pill",
    iconColor: PillAppColors.secondary,
    cardBackground: PillAppColors.secondaryContainer,
    image: require("@/assets/onboarding/medical-prescription.png"),
    imageCoverScale: 1.28,
  },
  {
    id: "aic-scan",
    title: "Aggiungi farmaci con il codice AIC",
    subtitle:
      "Scansiona il codice sulla confezione: PillApp riconosce il medicinale e ti aiuta a configurarlo più in fretta.",
    icon: "barcode-scan",
    iconColor: PillAppColors.primary,
    cardBackground: PillAppColors.primaryContainer,
    badge: "Esclusivo PillApp",
    image: require("@/assets/onboarding/aic-search.png"),
    imageCoverScale: 1.28,
  },
  {
    id: "journal",
    title: "Diario salute e benessere",
    subtitle:
      "Registra pressione, glicemia, peso e come ti senti. Un diario semplice per te e per il tuo medico.",
    icon: "notebook-heart-outline",
    iconColor: PillAppColors.onTertiaryContainer,
    cardBackground: PillAppColors.tertiaryContainer,
    image: require("@/assets/onboarding/diary.png"),
    imageCoverScale: 1.28,
  },
];

export const ONBOARDING_SLIDE_COUNT = onboardingSlides.length;
