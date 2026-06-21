import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { YStack } from "tamagui";

import { AppButton, AppText, PrimaryButton } from "@/components/ui";
import { layout, spacing } from "@/constants/spacing";
import { pillappColors } from "@/theme/tokens";

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
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityLabel="Sfondo guida scansione"
          accessibilityRole="none"
        />
        <View
          style={styles.card}
          accessibilityRole="alert"
          accessibilityLabel="Breve guida alla scansione AIC. Premi Inizia guida per i 4 passi oppure Salta guida."
        >
          <YStack alignItems="center" gap="$3">
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons
                name="school-outline"
                size={32}
                color={pillappColors.primary}
              />
            </View>

            <AppText variant="title" style={styles.title}>
              Breve guida alla scansione
            </AppText>

            <AppText variant="body" muted style={styles.body}>
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
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: pillappColors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: pillappColors.border,
    shadowColor: pillappColors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: pillappColors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    fontWeight: "700",
  },
  body: {
    textAlign: "center",
    lineHeight: 24,
  },
});
