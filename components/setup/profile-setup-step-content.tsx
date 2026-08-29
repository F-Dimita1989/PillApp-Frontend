import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { XStack, YStack, type YStackProps } from "tamagui";

import { ProfileSetupChoiceCard } from "@/components/setup/profile-setup-choice-card";
import {
  ProfileSetupButtonRow,
  ProfileSetupPrimaryButton,
  ProfileSetupSecondaryButton,
} from "@/components/setup/profile-setup-controls";
import { ProfileSetupGradientCard } from "@/components/setup/profile-setup-gradient-card";
import { ProfileSetupSelect } from "@/components/setup/profile-setup-select";
import { AppText } from "@/components/ui";
import {
  GUEST_AGE_OPTIONS,
  GUEST_SEX_OPTIONS,
  type GuestSex,
} from "@/constants/profile";
import {
  profileSetupWelcomePreview,
  type ProfileSetupStepId,
  type ProfileSetupStepMeta,
} from "@/constants/profile-setup-steps";
import { pillappColors, pillappRadius } from "@/theme/tokens";

const NAME_FIELD_HEIGHT = 52;

function ProfileSetupCard({
  children,
  gap = 16,
}: {
  children: ReactNode;
  gap?: YStackProps["gap"] | number;
}) {
  return (
    <ProfileSetupGradientCard>
      <YStack width="100%" gap={gap}>
        {children}
      </YStack>
    </ProfileSetupGradientCard>
  );
}

type ProfileSetupStepContentProps = {
  step: ProfileSetupStepId;
  welcomeMeta: ProfileSetupStepMeta;
  guestName: string;
  onGuestNameChange: (value: string) => void;
  guestAge: string;
  onGuestAgeChange: (value: string) => void;
  isAgeValid: boolean;
  guestSex: GuestSex | null;
  onGuestSexChange: (value: GuestSex) => void;
  wantsTherapy: boolean | null;
  errorMessage: string;
  isSaving: boolean;
  onContinue: () => void;
  onBack: () => void;
  onFinish: () => void;
  onOpenNameForm?: () => void;
};

export function ProfileSetupStepContent({
  step,
  welcomeMeta,
  guestName,
  onGuestNameChange,
  guestAge,
  onGuestAgeChange,
  isAgeValid,
  guestSex,
  onGuestSexChange,
  wantsTherapy,
  errorMessage,
  isSaving,
  onContinue,
  onBack,
  onFinish,
  onOpenNameForm,
}: ProfileSetupStepContentProps) {
  switch (step) {
    case "welcome":
      return (
        <ProfileSetupCard gap={8}>
          <AppText variant="title" color="inverse" textAlign="center">
            Ecco cosa faremo insieme
          </AppText>
          <AppText variant="caption" color="inverse" opacity={0.9} textAlign="center" lineHeight={18}>
            {welcomeMeta.subtitle}
          </AppText>
          <XStack flexWrap="wrap" gap="$2" justifyContent="space-between" width="100%">
            {profileSetupWelcomePreview.map((item) => (
              <XStack
                key={item.label}
                width="48%"
                gap="$1.5"
                alignItems="center"
                minWidth={136}
              >
                <YStack
                  width={32}
                  height={32}
                  borderRadius="$2"
                  alignItems="center"
                  justifyContent="center"
                  backgroundColor="rgba(255,255,255,0.18)"
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={18}
                    color={pillappColors.onPrimary}
                  />
                </YStack>
                <AppText variant="caption" color="inverse" fontWeight="600" flex={1} numberOfLines={2}>
                  {item.label}
                </AppText>
              </XStack>
            ))}
          </XStack>
          <ProfileSetupPrimaryButton onPress={onContinue} fullWidth>
            Iniziamo
          </ProfileSetupPrimaryButton>
        </ProfileSetupCard>
      );

    case "name":
      return (
        <ProfileSetupCard>
          <YStack width="100%" gap={8}>
            <Text style={styles.nameFieldLabel}>Nome o nickname</Text>
            <Pressable
              onPress={onOpenNameForm}
              accessibilityRole="button"
              accessibilityLabel="Apri modulo per inserire il nome"
            >
              <View style={styles.nameFieldPreview}>
                <Text
                  style={[
                    styles.nameFieldValue,
                    !guestName.trim() && styles.nameFieldPlaceholder,
                  ]}
                  numberOfLines={1}
                >
                  {guestName.trim() || "Es. Maria, Nonna Rosa..."}
                </Text>
              </View>
            </Pressable>
          </YStack>
          <ProfileSetupButtonRow>
            <ProfileSetupSecondaryButton onPress={onBack}>Indietro</ProfileSetupSecondaryButton>
            <ProfileSetupPrimaryButton disabled={!guestName.trim()} onPress={onContinue}>
              Continua
            </ProfileSetupPrimaryButton>
          </ProfileSetupButtonRow>
        </ProfileSetupCard>
      );

    case "age":
      return (
        <ProfileSetupCard>
          <ProfileSetupSelect
            label="Età"
            value={guestAge}
            options={GUEST_AGE_OPTIONS}
            onValueChange={onGuestAgeChange}
            placeholder="Seleziona l'età"
            accessibilityLabel="Seleziona età"
          />
          <ProfileSetupButtonRow>
            <ProfileSetupSecondaryButton onPress={onBack}>Indietro</ProfileSetupSecondaryButton>
            <ProfileSetupPrimaryButton disabled={!isAgeValid} onPress={onContinue}>
              Continua
            </ProfileSetupPrimaryButton>
          </ProfileSetupButtonRow>
        </ProfileSetupCard>
      );

    case "sex":
      return (
        <ProfileSetupCard gap={10}>
          {GUEST_SEX_OPTIONS.map((option) => (
            <ProfileSetupChoiceCard
              key={option.value}
              label={option.label}
              selected={guestSex === option.value}
              compact
              onPress={() => onGuestSexChange(option.value)}
            />
          ))}
          <ProfileSetupButtonRow>
            <ProfileSetupSecondaryButton onPress={onBack}>Indietro</ProfileSetupSecondaryButton>
            <ProfileSetupPrimaryButton disabled={!guestSex} onPress={onContinue}>
              Continua
            </ProfileSetupPrimaryButton>
          </ProfileSetupButtonRow>
        </ProfileSetupCard>
      );

    case "therapy":
      return null;

    case "done":
      return (
        <ProfileSetupCard>
          <AppText variant="body" color="inverse" textAlign="center">
            {wantsTherapy
              ? "Ricorda: tieni il telefono fermo durante la scansione del codice AIC e inquadra bene la confezione."
              : "Puoi iniziare subito a esplorare l'app. Quando vorrai, aggiungi i farmaci dalla tab Farmaci."}
          </AppText>
          {errorMessage ? (
            <AppText variant="caption" color="inverse" opacity={0.95} textAlign="center">
              {errorMessage}
            </AppText>
          ) : null}
          <YStack width="100%" gap="$3">
            <ProfileSetupSecondaryButton onPress={onBack} fullWidth>
              Indietro
            </ProfileSetupSecondaryButton>
            <ProfileSetupPrimaryButton disabled={isSaving} onPress={onFinish} fullWidth>
              {isSaving ? "Salvo..." : "Entra in PillApp"}
            </ProfileSetupPrimaryButton>
          </YStack>
        </ProfileSetupCard>
      );
  }
}

const styles = StyleSheet.create({
  nameFieldLabel: {
    color: pillappColors.onPrimary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  nameFieldPreview: {
    width: "100%",
    height: NAME_FIELD_HEIGHT,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderColor: "rgba(255,255,255,0.5)",
    borderWidth: 1.5,
    borderRadius: pillappRadius[3],
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  nameFieldValue: {
    color: pillappColors.textPrimary,
    fontSize: 16,
    lineHeight: 22,
  },
  nameFieldPlaceholder: {
    color: pillappColors.textMuted,
  },
});
