import type { OnboardingSlide } from "@/constants/onboarding-slides";
import { pillappColors } from "@/theme/tokens";

export const ACCESS_SETUP_SLIDE_COUNT = 2;

/** Cerchio hero leggermente più piccolo per lasciare spazio al testo senza scroll. */
export const accessSetupEmblemSize = 184;

export const accessSetupSlides: OnboardingSlide[] = [
  {
    id: "privacy",
    title: "La tua privacy, spiegata semplice",
    subtitle: "Tranquillità e rispetto dei tuoi dati personali.",
    icon: "shield-check-outline",
    iconColor: pillappColors.secondary,
    cardBackground: pillappColors.secondarySoft,
    image: require("@/assets/onboarding/privacy-policy.png"),
    imageCoverScale: 1.22,
  },
  {
    id: "permissions",
    title: "Accessi necessari",
    subtitle: "Consenti questi permessi per usare PillApp al meglio.",
    icon: "cellphone-check",
    iconColor: pillappColors.primary,
    cardBackground: pillappColors.primarySoft,
  },
];
