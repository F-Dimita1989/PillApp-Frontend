import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Modal, Pressable } from "react-native";
import { YStack } from "tamagui";

import { AppButton, AppText, PrimaryButton } from "@/components/ui";
import { pillappColors, pillappShadows } from "@/theme/tokens";

type AicTourIntroModalProps = {
  visible: boolean;
  onStart: () => void;
  onSkip: () => void;
};

export function AicTourIntroModal({
  visible,
  onStart,
  onSkip,
}: AicTourIntroModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onSkip}
    >
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor="rgba(15, 23, 42, 0.55)"
        paddingHorizontal="$4"
      >
        <Pressable
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          accessibilityLabel="Sfondo guida scansione"
          accessibilityRole="none"
        />
        <YStack
          width="100%"
          maxWidth={400}
          backgroundColor="$surface"
          borderRadius="$4"
          padding="$6"
          borderWidth={1}
          borderColor="$border"
          gap="$3"
          alignItems="center"
          {...pillappShadows.lg}
          accessibilityRole="alert"
          accessibilityLabel="Breve guida alla scansione AIC. Premi Inizia guida per i 4 passi oppure Salta guida."
        >
          <YStack
            width={56}
            height={56}
            borderRadius="$pill"
            backgroundColor="$primarySoft"
            alignItems="center"
            justifyContent="center"
          >
            <MaterialCommunityIcons
              name="school-outline"
              size={32}
              color={pillappColors.primary}
            />
          </YStack>

          <AppText variant="title" textAlign="center">
            Breve guida alla scansione
          </AppText>

          <AppText variant="body" muted textAlign="center">
            In 4 passi ti mostriamo dove trovare il codice AIC e come scansionare
            la confezione. Puoi anche saltare la guida e usare subito la fotocamera.
          </AppText>

          <YStack gap="$2" width="100%" marginTop="$1">
            <PrimaryButton
              icon="play-circle-outline"
              onPress={onStart}
              fullWidth
              accessibilityLabel="Inizia la guida alla scansione"
            >
              Inizia guida
            </PrimaryButton>
            <AppButton
              variant="ghost"
              onPress={onSkip}
              fullWidth
              accessibilityLabel="Salta la guida e abilita la scansione"
            >
              Salta guida
            </AppButton>
          </YStack>
        </YStack>
      </YStack>
    </Modal>
  );
}
