import { ActivityIndicator } from "react-native";
import { YStack } from "tamagui";

import { AppText, useCardSurface } from "@/components/ui";
import type { MedicineScanProgress } from "@/lib/farmaci/scan";
import { pillappColors } from "@/theme/tokens";

const SCAN_PROGRESS_COPY: Record<
  MedicineScanProgress,
  { title: string; description: string }
> = {
  ocr: {
    title: "Lettura del codice…",
    description: "Sto riconoscendo il codice AIC dalla foto.",
  },
  lookup: {
    title: "Cerco il farmaco…",
    description: "Sto recuperando nome e dati della confezione dal catalogo.",
  },
};

type ScanProgressStatusProps = {
  step: MedicineScanProgress;
};

export function ScanProgressStatus({ step }: ScanProgressStatusProps) {
  const surface = useCardSurface();
  const onBrand = surface === "brand";
  const copy = SCAN_PROGRESS_COPY[step];

  return (
    <YStack
      width="100%"
      minHeight={180}
      alignItems="center"
      justifyContent="center"
      gap="$3"
      padding="$4"
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${copy.title} ${copy.description}`}
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator
        size="large"
        color={onBrand ? pillappColors.onPrimary : pillappColors.secondary}
      />
      <AppText variant="title" textAlign="center" speakOnPress={false}>
        {copy.title}
      </AppText>
      <AppText variant="body" muted textAlign="center" speakOnPress={false}>
        {copy.description}
      </AppText>
    </YStack>
  );
}
