import { Image } from "expo-image";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { YStack } from "tamagui";

import { AppText } from "@/components/ui/app-text";
import { spacing } from "@/constants/spacing";
import {
  drugImageRequestFromScanValues,
  fetchDrugPackageImage,
} from "@/lib/farmaci/drug-image-api";
import type { ScannedMedicationFormValues } from "@/lib/farmaci/form-values";
import { pillappColors } from "@/theme/tokens";

const PLACEHOLDER_SOURCE = require("@/assets/images/aic-scan-example.png");

type DrugPackageImageProps = {
  values: ScannedMedicationFormValues;
  token?: string;
  /** full = card post-scansione; compact = spazi ridotti */
  size?: "full" | "compact";
};

type DisplayState = "loading" | "success" | "unavailable";

export function DrugPackageImage({
  values,
  token,
  size = "full",
}: DrugPackageImageProps) {
  const [displayState, setDisplayState] = useState<DisplayState>("loading");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const request = useMemo(
    () => drugImageRequestFromScanValues(values),
    [values],
  );

  const requestKey = useMemo(
    () =>
      [
        request.aic,
        request.name,
        request.dosage,
        request.pharmaceuticalForm,
        request.packageQuantity,
        request.marketingAuthorizationHolder,
      ].join("|"),
    [request],
  );

  useEffect(() => {
    if (!request.aic || !request.name) {
      setDisplayState("unavailable");
      setImageUrl(null);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    const load = async () => {
      setDisplayState("loading");
      setImageUrl(null);

      try {
        const result = await fetchDrugPackageImage(request, {
          signal: controller.signal,
          token,
        });

        if (cancelled) {
          return;
        }

        if (result.success && result.imageUrl) {
          setImageUrl(result.imageUrl);
          setDisplayState("success");
          return;
        }

        setDisplayState("unavailable");
      } catch {
        if (!cancelled) {
          setDisplayState("unavailable");
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [request, requestKey, token]);

  const frameHeight = size === "compact" ? 160 : 220;

  return (
    <YStack width="100%" gap="$2" alignItems="center">
      <AppText variant="label" color="primary">
        Immagine confezione
      </AppText>

      <View
        style={[
          styles.frame,
          { minHeight: frameHeight },
          size === "compact" && styles.frameCompact,
        ]}
        accessibilityRole="image"
        accessibilityLabel={
          displayState === "success"
            ? `Confezione di ${request.name}`
            : "Immagine confezione non disponibile"
        }
      >
        {displayState === "loading" ? (
          <YStack alignItems="center" justifyContent="center" gap="$2" flex={1}>
            <ActivityIndicator size="large" color={pillappColors.primary} />
            <AppText variant="caption" muted textAlign="center">
              Ricerca immagine confezione…
            </AppText>
          </YStack>
        ) : null}

        {displayState === "success" && imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.remoteImage}
            contentFit="contain"
            transition={200}
          />
        ) : null}

        {displayState === "unavailable" ? (
          <YStack alignItems="center" justifyContent="center" gap="$2" flex={1}>
            <Image
              source={PLACEHOLDER_SOURCE}
              style={styles.placeholderImage}
              contentFit="contain"
            />
            <AppText variant="caption" muted textAlign="center">
              Nessuna immagine affidabile trovata per questo farmaco.
            </AppText>
          </YStack>
        ) : null}
      </View>
    </YStack>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: pillappColors.border,
    backgroundColor: pillappColors.surfaceMuted,
    padding: spacing.md,
    overflow: "hidden",
  },
  frameCompact: {
    padding: spacing.sm,
  },
  remoteImage: {
    width: "100%",
    height: 200,
  },
  placeholderImage: {
    width: "100%",
    height: 140,
  },
});
