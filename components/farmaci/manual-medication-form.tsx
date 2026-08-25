import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { useMemo } from "react";
import { XStack, YStack } from "tamagui";

import { MedicationQuantitySection } from "@/components/farmaci/medication-quantity-section";
import { BrandIconBadge } from "@/components/ui/brand-icon-badge";
import {
  AppDivider,
  AppInput,
  AppInputMultiline,
  AppSegmentedControl,
  AppSelect,
  AppText,
} from "@/components/ui";
import {
  isValidOptionalAic,
  sanitizeAicInput,
  updateScannedMedicationField,
  type ScannedMedicationFormValues,
} from "@/lib/farmaci/form-values";
import {
  nearestTherapyDoseOption,
  therapyDoseOptionsForUnit,
} from "@/lib/therapy/dose-options";
import type { QuantitaUnit } from "@/types/domain";

const UNIT_OPTIONS = [
  { value: "pillole", label: "Compresse" },
  { value: "ml", label: "ml" },
  { value: "bustine", label: "Bustine" },
] as const;

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

function FormSection({
  icon,
  title,
  children,
}: {
  icon: IconName;
  title: string;
  children: ReactNode;
}) {
  return (
    <YStack width="100%" gap="$3">
      <XStack alignItems="center" gap="$2.5">
        <BrandIconBadge name={icon} size={36} iconSize={18} />
        <AppText variant="overline" color="secondary">
          {title}
        </AppText>
      </XStack>
      {children}
    </YStack>
  );
}

type ManualMedicationFormProps = {
  values: ScannedMedicationFormValues;
  onChange: (values: ScannedMedicationFormValues) => void;
  dose: string;
  onDoseChange: (dose: string) => void;
  nomeError?: string;
  aicError?: string;
};

export function ManualMedicationForm({
  values,
  onChange,
  dose,
  onDoseChange,
  nomeError,
  aicError,
}: ManualMedicationFormProps) {
  const doseOptions = useMemo(
    () => therapyDoseOptionsForUnit(values.unitaQuantita),
    [values.unitaQuantita],
  );

  const setField = (field: keyof ScannedMedicationFormValues, value: string) => {
    onChange(updateScannedMedicationField(values, field, value));
  };

  const setUnit = (unit: QuantitaUnit) => {
    onChange({ ...values, unitaQuantita: unit });
    onDoseChange(nearestTherapyDoseOption(dose, unit));
  };

  return (
    <YStack width="100%" gap="$4">
      <FormSection icon="pill" title="Dati principali">
        <AppInput
          label="Nome farmaco"
          value={values.nome}
          onChangeText={(value) => setField("nome", value)}
          placeholder="Es. Tachipirina"
          autoCapitalize="words"
          error={nomeError}
          accessibilityLabel="Nome farmaco"
        />
        <AppInput
          label="Codice AIC"
          value={values.aic}
          onChangeText={(value) => setField("aic", sanitizeAicInput(value))}
          placeholder="Facoltativo, 8 o 9 cifre"
          keyboardType="number-pad"
          hint={
            aicError
              ? undefined
              : "Se lo conosci, inseriscilo per ritrovare più facilmente il farmaco."
          }
          error={aicError}
          accessibilityLabel="Codice AIC facoltativo"
        />
      </FormSection>

      <AppDivider />

      <FormSection icon="flask-outline" title="Forma e quantità">
        <YStack width="100%" gap="$2">
          <AppText variant="label">Forma</AppText>
          <AppSegmentedControl
            value={values.unitaQuantita}
            options={[...UNIT_OPTIONS]}
            onValueChange={(value) => setUnit(value as QuantitaUnit)}
          />
        </YStack>
        <MedicationQuantitySection
          values={values}
          onChange={onChange}
          source="manual"
        />
        <AppSelect
          label="Dose per assunzione"
          value={nearestTherapyDoseOption(dose, values.unitaQuantita)}
          options={doseOptions}
          onValueChange={onDoseChange}
          accessibilityLabel="Dose per assunzione"
        />
        <AppInput
          label="Dosaggio in confezione"
          value={values.dosaggio}
          onChangeText={(value) => setField("dosaggio", value)}
          placeholder="Es. 500 mg"
          hint="Facoltativo — come scritto sulla confezione."
          accessibilityLabel="Dosaggio indicato in confezione"
        />
      </FormSection>

      <AppDivider />

      <FormSection icon="text-box-outline" title="Altri dettagli">
        <AppInput
          label="Marca / titolare"
          value={values.marca}
          onChangeText={(value) => setField("marca", value)}
          placeholder="Facoltativo"
          accessibilityLabel="Marca o titolare del farmaco"
        />
        <AppInput
          label="Principio attivo"
          value={values.principioAttivo}
          onChangeText={(value) => setField("principioAttivo", value)}
          placeholder="Facoltativo"
          accessibilityLabel="Principio attivo"
        />
        <AppInputMultiline
          label="Note"
          value={values.note}
          onChangeText={(value) => setField("note", value)}
          placeholder="Facoltative — es. da prendere dopo i pasti"
          rows={3}
          accessibilityLabel="Note aggiuntive sul farmaco"
        />
      </FormSection>
    </YStack>
  );
}

export function validateManualMedication(
  values: ScannedMedicationFormValues,
): { nome?: string; aic?: string } {
  const errors: { nome?: string; aic?: string } = {};

  if (!values.nome.trim()) {
    errors.nome = "Inserisci il nome del farmaco.";
  }
  if (!isValidOptionalAic(values.aic)) {
    errors.aic = "Il codice AIC deve avere 8 o 9 cifre.";
  }

  return errors;
}
