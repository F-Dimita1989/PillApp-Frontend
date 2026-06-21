import { YStack } from "tamagui";

import { AppInput, AppInputMultiline } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import type { ScannedMedicationFormValues } from "@/lib/farmaci/form-values";
import { updateScannedMedicationField } from "@/lib/farmaci/form-values";

type ScannedMedicationFormProps = {
  values: ScannedMedicationFormValues;
  onChange: (values: ScannedMedicationFormValues) => void;
  disabled?: boolean;
  showHeading?: boolean;
};

export function ScannedMedicationForm({
  values,
  onChange,
  disabled = false,
  showHeading = true,
}: ScannedMedicationFormProps) {
  const setField = (field: keyof ScannedMedicationFormValues, value: string) => {
    onChange(updateScannedMedicationField(values, field, value));
  };

  return (
    <YStack width="100%" gap="$3">
      {showHeading ? (
        <AppText variant="label">Dati farmaco riconosciuti</AppText>
      ) : null}

      <AppInput
        label="Codice AIC"
        value={values.aic}
        onChangeText={(value) => setField("aic", value)}
        editable={!disabled}
        keyboardType="number-pad"
        accessibilityLabel="Codice AIC"
      />
      <AppInput
        label="Nome farmaco"
        value={values.nome}
        onChangeText={(value) => setField("nome", value)}
        editable={!disabled}
        accessibilityLabel="Nome farmaco"
      />
      <AppInput
        label="Marca / titolare"
        value={values.marca}
        onChangeText={(value) => setField("marca", value)}
        editable={!disabled}
        accessibilityLabel="Marca o titolare del farmaco"
      />
      <AppInput
        label="Principio attivo"
        value={values.principioAttivo}
        onChangeText={(value) => setField("principioAttivo", value)}
        editable={!disabled}
        accessibilityLabel="Principio attivo"
      />
      <AppInput
        label="Dosaggio"
        value={values.dosaggio}
        onChangeText={(value) => setField("dosaggio", value)}
        editable={!disabled}
        accessibilityLabel="Dosaggio indicato in confezione"
      />
      <AppInputMultiline
        label="Note (facoltative)"
        value={values.note}
        onChangeText={(value) => setField("note", value)}
        editable={!disabled}
        rows={3}
        accessibilityLabel="Note aggiuntive sul farmaco"
      />
    </YStack>
  );
}
