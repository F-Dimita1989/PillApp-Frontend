import { XStack, YStack } from "tamagui";

import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { useCardSurface } from "@/components/ui/card-surface";
import {
  getQuantitaFieldHint,
  getQuantitaUnitLabel,
  updateScannedMedicationField,
  type ScannedMedicationFormValues,
} from "@/lib/farmaci/form-values";

type MedicationQuantitySectionProps = {
  values: ScannedMedicationFormValues;
  onChange: (values: ScannedMedicationFormValues) => void;
  disabled?: boolean;
  source?: "scan" | "manual";
};

export function MedicationQuantitySection({
  values,
  onChange,
  disabled = false,
  source = "scan",
}: MedicationQuantitySectionProps) {
  const onBrand = useCardSurface() === "brand";
  const unitLabel = getQuantitaUnitLabel(values.unitaQuantita);
  const fieldLabel =
    values.unitaQuantita === "ml"
      ? "Quantità in ml"
      : values.unitaQuantita === "bustine"
        ? "Numero di bustine"
        : "Numero di compresse";

  return (
    <YStack
      width="100%"
      gap="$3"
      backgroundColor={onBrand ? "transparent" : "$surfaceMuted"}
      borderRadius="$3"
      padding={onBrand ? 0 : "$4"}
    >
      <AppText variant="overline" color={onBrand ? "inverse" : "secondary"}>
        Quantità in confezione
      </AppText>
      <AppText variant="body" muted>
        {values.quantita.trim()
          ? source === "manual"
            ? `In confezione: ${values.quantita.trim()} ${unitLabel}. Puoi aggiornare il valore man mano che usi il farmaco.`
            : `In confezione: ${values.quantita.trim()} ${unitLabel} (dal database). Puoi aggiornare il valore man mano che usi il farmaco.`
          : `Indica quante ${unitLabel} ci sono in confezione per tenere traccia di cosa ti resta.`}
      </AppText>

      <YStack width="100%" gap="$2">
        <AppText variant="label">{fieldLabel}</AppText>
        <XStack width="100%" alignItems="stretch" gap="$3">
          <YStack flex={1} minWidth={0}>
            <AppInput
              value={values.quantita}
              onChangeText={(text) =>
                onChange(
                  updateScannedMedicationField(
                    values,
                    "quantita",
                    text.replace(/[^\d.,]/g, ""),
                  ),
                )
              }
              editable={!disabled}
              keyboardType="decimal-pad"
              accessibilityLabel={`Quantità in ${unitLabel}`}
            />
          </YStack>
          <YStack
            height={52}
            minWidth={96}
            paddingHorizontal="$3"
            alignItems="center"
            justifyContent="center"
            borderRadius="$3"
            backgroundColor={onBrand ? "rgba(255,255,255,0.18)" : "$secondarySoft"}
          >
            <AppText variant="label" color={onBrand ? "inverse" : "secondary"}>
              {unitLabel}
            </AppText>
          </YStack>
        </XStack>
      </YStack>

      <AppText variant="caption" muted>
        {getQuantitaFieldHint(values.unitaQuantita)}
      </AppText>
    </YStack>
  );
}
