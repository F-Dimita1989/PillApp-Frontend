import { useEffect, useRef, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { YStack } from "tamagui";

import {
  ProfileSetupButtonRow,
  ProfileSetupPrimaryButton,
  ProfileSetupSecondaryButton,
} from "@/components/setup/profile-setup-controls";
import { ProfileSetupInputModal } from "@/components/setup/profile-setup-input-modal";
import { ProfileSetupGradientCard } from "@/components/setup/profile-setup-gradient-card";
import { pillappColors, pillappRadius } from "@/theme/tokens";

const FIELD_HEIGHT = 52;

type ProfileSetupNameModalProps = {
  visible: boolean;
  guestName: string;
  onGuestNameChange: (value: string) => void;
  onClose: () => void;
  onBack: () => void;
  onContinue: () => void;
};

export function ProfileSetupNameModal({
  visible,
  guestName,
  onGuestNameChange,
  onClose,
  onBack,
  onContinue,
}: ProfileSetupNameModalProps) {
  const inputRef = useRef<TextInput>(null);
  const [fieldReady, setFieldReady] = useState(false);

  useEffect(() => {
    if (!visible) {
      setFieldReady(false);
      return;
    }

    // Fallback se onShow del Modal non parte (alcuni device Android).
    const timer = setTimeout(() => setFieldReady(true), 350);
    return () => clearTimeout(timer);
  }, [visible]);

  useEffect(() => {
    if (!fieldReady) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [fieldReady]);

  const handleContinue = () => {
    onClose();
    onContinue();
  };

  const handleBack = () => {
    onClose();
    onBack();
  };

  return (
    <ProfileSetupInputModal
      visible={visible}
      onRequestClose={onClose}
      onShow={() => setFieldReady(true)}
    >
      <ProfileSetupGradientCard>
        <YStack width="100%" gap={16}>
          <YStack width="100%" gap={8}>
            <Text style={styles.label}>Nome o nickname</Text>
            {fieldReady ? (
              <TextInput
                ref={inputRef}
                value={guestName}
                onChangeText={onGuestNameChange}
                placeholder="Es. Maria, Nonna Rosa..."
                placeholderTextColor={pillappColors.textMuted}
                autoCapitalize="words"
                autoCorrect={false}
                autoFocus
                showSoftInputOnFocus
                keyboardType="default"
                returnKeyType="done"
                onSubmitEditing={() => {
                  if (guestName.trim()) {
                    handleContinue();
                  }
                }}
                style={styles.input}
                accessibilityLabel="Nome o nickname"
              />
            ) : (
              <View style={styles.input} />
            )}
          </YStack>
          <ProfileSetupButtonRow>
            <ProfileSetupSecondaryButton onPress={handleBack}>
              Indietro
            </ProfileSetupSecondaryButton>
            <ProfileSetupPrimaryButton
              disabled={!guestName.trim()}
              onPress={handleContinue}
            >
              Continua
            </ProfileSetupPrimaryButton>
          </ProfileSetupButtonRow>
        </YStack>
      </ProfileSetupGradientCard>
    </ProfileSetupInputModal>
  );
}

const styles = StyleSheet.create({
  label: {
    color: pillappColors.onPrimary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  input: {
    width: "100%",
    height: FIELD_HEIGHT,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderColor: "rgba(255,255,255,0.5)",
    borderWidth: 1.5,
    borderRadius: pillappRadius[3],
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 14 : 12,
    paddingBottom: Platform.OS === "android" ? 14 : 12,
    color: pillappColors.textPrimary,
    fontSize: 16,
    lineHeight: 22,
  },
});
