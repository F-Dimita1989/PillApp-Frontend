import type { ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export type ProfileSetupStepId =
  | "welcome"
  | "name"
  | "age"
  | "sex"
  | "therapy"
  | "done";

type ProfileSetupStepIcon = ComponentProps<typeof MaterialCommunityIcons>["name"];

export type ProfileSetupStepMeta = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  icon: ProfileSetupStepIcon;
};

export const PROFILE_SETUP_TOTAL_STEPS = 6;

export function profileSetupStepEyebrow(stepNumber: number): string {
  return `Passo ${stepNumber} di ${PROFILE_SETUP_TOTAL_STEPS}`;
}

export const profileSetupWelcomePreview = [
  { icon: "account-outline" as ProfileSetupStepIcon, label: "Nome o nickname" },
  { icon: "cake-variant-outline" as ProfileSetupStepIcon, label: "La tua età" },
  {
    icon: "account-heart-outline" as ProfileSetupStepIcon,
    label: "Come ti identifichi",
  },
  { icon: "pill" as ProfileSetupStepIcon, label: "La tua terapia" },
] as const;

function resolveMeta(
  meta: {
    eyebrow?: string;
    title: string | ((name: string) => string);
    subtitle: string | ((name: string) => string);
    icon: ProfileSetupStepIcon;
  },
  guestName = "",
): ProfileSetupStepMeta {
  const name = guestName.trim();
  return {
    eyebrow: meta.eyebrow,
    icon: meta.icon,
    title: typeof meta.title === "function" ? meta.title(name) : meta.title,
    subtitle:
      typeof meta.subtitle === "function" ? meta.subtitle(name) : meta.subtitle,
  };
}

export function getProfileSetupStepMeta(
  stepId: ProfileSetupStepId,
  guestName = "",
): ProfileSetupStepMeta {
  switch (stepId) {
    case "welcome":
      return resolveMeta({
        eyebrow: profileSetupStepEyebrow(1),
        title: "Iniziamo!",
        subtitle:
          "Profilo ospite in pochi passi. Niente registrazione: tutto resta sul telefono.",
        icon: "hand-wave",
      });
    case "name":
      return resolveMeta({
        eyebrow: profileSetupStepEyebrow(2),
        title: "Come posso chiamarti?",
        subtitle:
          "Usa il nome che preferisci: quello vero o un nickname, come ti senti più a tuo agio.",
        icon: "account-edit-outline",
      });
    case "age":
      return resolveMeta(
        {
          eyebrow: profileSetupStepEyebrow(3),
          title: (name) =>
            name ? `${name}, quanti anni hai?` : "Quanti anni hai?",
          subtitle:
            "Ci aiuta a proporti testi e pulsanti più chiari. L'informazione non esce mai dal telefono.",
          icon: "cake-variant-outline",
        },
        guestName,
      );
    case "sex":
      return resolveMeta({
        eyebrow: profileSetupStepEyebrow(4),
        title: "Come ti identifichi?",
        subtitle:
          "Serve solo per adattare qualche messaggio. Se preferisci non rispondere, scegli l'ultima opzione.",
        icon: "account-heart-outline",
      });
    case "therapy":
      return resolveMeta({
        eyebrow: profileSetupStepEyebrow(5),
        title: "Configuriamo la tua terapia",
        subtitle:
          "Hai farmaci da prendere con regolarità? Scansiona le confezioni una alla volta: puoi aggiungerne più di uno.",
        icon: "pill",
      });
    case "done":
      return resolveMeta(
        {
          eyebrow: profileSetupStepEyebrow(6),
          title: (name) => `Tutto pronto, ${name || "amico"}!`,
          subtitle:
            "Il tuo profilo è completo. Un ultimo controllo e poi entriamo in PillApp.",
          icon: "check-circle-outline",
        },
        guestName,
      );
  }
}
