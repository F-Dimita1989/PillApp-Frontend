import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import type { ImageSourcePropType } from "react-native";

import { pillappColors } from "@/theme/tokens";

export type OnboardingSlideIcon = ComponentProps<
  typeof MaterialCommunityIcons
>["name"];

export type OnboardingSlide = {
  id: string;
  title: string;
  subtitle: string;
  icon: OnboardingSlideIcon;
  iconColor: string;
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
    iconColor: pillappColors.primary,
    showLogo: true,
  },
  {
    id: "welcome-trust",
    title: "Partiamo con calma",
    subtitle:
      "Niente registrazione né password: le tue informazioni restano sul telefono. Ti guideremo passo passo, al tuo ritmo.",
    icon: "shield-check-outline",
    iconColor: pillappColors.secondary,
    image: require("@/assets/onboarding/privacy_policyCut.png"),
    imageCoverScale: 1,
  },
  {
    id: "reminders",
    title: "I farmaci giusti, al momento giusto",
    subtitle:
      "PillApp ti aiuta a ricordare cosa prendere e quando, con un’agenda chiara e tranquilla.",
    icon: "bell-ring-outline",
    iconColor: pillappColors.primary,
    image: require("@/assets/onboarding/notifiche_parcoCut.png"),
    imageCoverScale: 1,
  },
  {
    id: "therapy",
    title: "La tua terapia, sempre sotto controllo",
    subtitle:
      "Promemoria, lista farmaci e aderenza di oggi: tutto in un unico posto, facile da consultare.",
    icon: "pill",
    iconColor: pillappColors.secondary,
    image: require("@/assets/onboarding/medicoCut.png"),
    imageCoverScale: 1,
  },
  {
    id: "aic-scan",
    title: "Aggiungi farmaci con il codice AIC",
    subtitle:
      "Scansiona il codice sulla confezione: PillApp riconosce il medicinale e ti aiuta a configurarlo più in fretta.",
    icon: "barcode-scan",
    iconColor: pillappColors.primary,
    image: require("@/assets/onboarding/lente_aicCut.png"),
    imageCoverScale: 1,
  },
  {
    id: "journal",
    title: "Diario salute e benessere",
    subtitle:
      "Registra pressione, glicemia, peso e come ti senti. Un diario semplice per te e per il tuo medico.",
    icon: "notebook-heart-outline",
    iconColor: pillappColors.successDark,
    image: require("@/assets/onboarding/diarioCut.png"),
    imageCoverScale: 1,
  },
];

export const ONBOARDING_SLIDE_COUNT = onboardingSlides.length;
