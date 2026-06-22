import { PillAppColors } from "@/constants/colors";
import type { OnboardingSlide } from "@/constants/onboarding-slides";

export const ACCESS_SETUP_SLIDE_COUNT = 2;

/** Cerchio hero leggermente più piccolo per lasciare spazio al testo senza scroll. */
export const accessSetupEmblemSize = 184;

export const accessSetupSlides: OnboardingSlide[] = [
  {
    id: "permissions",
    title: "Accessi necessari",
    subtitle: "Consenti questi permessi per usare PillApp al meglio.",
    icon: "cellphone-check",
    iconColor: PillAppColors.primary,
    cardBackground: PillAppColors.primaryContainer,
  },
  {
    id: "privacy",
    title: "La tua privacy, spiegata semplice",
    subtitle: "Tranquillità e rispetto dei tuoi dati personali.",
    icon: "shield-check-outline",
    iconColor: PillAppColors.secondary,
    cardBackground: PillAppColors.secondaryContainer,
    image: require("@/assets/onboarding/privacy-policy.png"),
    imageCoverScale: 1.22,
  },
];
