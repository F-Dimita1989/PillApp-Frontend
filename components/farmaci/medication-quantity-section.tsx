import { XStack, YStack } from "tamagui";

import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
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
};

export function MedicationQuantitySection({
  values,
  onChange,
  disabled = false,
}: MedicationQuantitySectionProps) {
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
      backgroundColor="$surfaceMuted"
      borderRadius="$3"
      padding="$4"
    >
      <AppText variant="title">Quantità</AppText>
      <AppText variant="body" muted>
        {values.quantita.trim()
          ? `In confezione: ${values.quantita.trim()} ${unitLabel} (dal database). Puoi aggiornare il valore man mano che usi il farmaco.`
          : `Indica quante ${unitLabel} ci sono in confezione per tenere traccia di cosa ti resta.`}
      </AppText>

      <XStack width="100%" alignItems="center" gap="$3">
        <YStack flex={1}>
          <AppInput
            label={fieldLabel}
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
          backgroundColor="$primarySoft"
          borderRadius="$2"
          paddingHorizontal="$3"
          paddingVertical="$4"
          minWidth={72}
          alignItems="center"
          justifyContent="center"
        >
          <AppText variant="label" color="primary">
            {unitLabel}
          </AppText>
        </YStack>
      </XStack>

      <AppText variant="caption" muted>
        {getQuantitaFieldHint(values.unitaQuantita)}
      </AppText>
    </YStack>
  );
}
