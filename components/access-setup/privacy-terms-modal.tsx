import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { YStack } from "tamagui";

import { PrivacyTermsAcceptRow } from "@/components/access-setup/privacy-terms-accept-row";
import { AppButton, AppText, PrimaryButton } from "@/components/ui";
import {
  TERMS_AND_PRIVACY_INTRO,
  TERMS_AND_PRIVACY_SECTIONS,
  TERMS_AND_PRIVACY_TITLE,
  TERMS_AND_PRIVACY_UPDATED_AT,
} from "@/constants/terms-and-privacy";
import {
  pillappBrandGradient,
  pillappColors,
  pillappLayout,
  pillappShadows,
} from "@/theme/tokens";

type PrivacyTermsModalProps = {
  visible: boolean;
  accepted: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function PrivacyTermsModal({
  visible,
  accepted,
  onClose,
  onConfirm,
}: PrivacyTermsModalProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [draftAccepted, setDraftAccepted] = useState(accepted);

  useEffect(() => {
    if (visible) {
      setDraftAccepted(accepted);
    }
  }, [accepted, visible]);

  const handleConfirm = () => {
    if (!draftAccepted) {
      return;
    }
    onConfirm();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <YStack
        flex={1}
        justifyContent="center"
        backgroundColor="rgba(15, 23, 42, 0.58)"
        paddingTop={insets.top + 12}
        paddingBottom={insets.bottom + 12}
        paddingHorizontal={pillappLayout.screenPaddingX}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityLabel="Chiudi termini e condizioni"
          accessibilityRole="button"
          onPress={onClose}
        />

        <YStack
          width="100%"
          maxWidth={420}
          maxHeight={height * 0.88}
          alignSelf="center"
          backgroundColor="$surface"
          borderRadius="$4"
          overflow="hidden"
          borderWidth={1}
          borderColor="$borderStrong"
          zIndex={1}
          {...pillappShadows.lg}
          accessibilityRole="alert"
          accessibilityLabel={TERMS_AND_PRIVACY_TITLE}
        >
          <LinearGradient
            colors={[...pillappBrandGradient.colors]}
            locations={[...pillappBrandGradient.locations]}
            start={pillappBrandGradient.start}
            end={pillappBrandGradient.end}
            style={styles.brandBar}
          />

          <YStack
            paddingHorizontal="$5"
            paddingTop="$4"
            paddingBottom="$3"
            gap="$2"
            alignItems="center"
          >
            <LinearGradient
              colors={[...pillappBrandGradient.colors]}
              locations={[...pillappBrandGradient.locations]}
              start={pillappBrandGradient.start}
              end={pillappBrandGradient.end}
              style={styles.iconCircle}
            >
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={28}
                color={pillappColors.onPrimary}
              />
            </LinearGradient>

            <AppText variant="title" color="primary" textAlign="center">
              Termini e condizioni
            </AppText>
            <AppText variant="caption" muted textAlign="center">
              Informativa sulla privacy · aggiornato al {TERMS_AND_PRIVACY_UPDATED_AT}
            </AppText>
          </YStack>

          <ScrollView
            style={{ maxHeight: Math.round(height * 0.42) }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator
            bounces={false}
          >
            <AppText variant="label" color="primary" fontWeight="700" marginBottom="$2">
              {TERMS_AND_PRIVACY_TITLE}
            </AppText>
            <AppText variant="body" color="primary" lineHeight={22}>
              {TERMS_AND_PRIVACY_INTRO}
            </AppText>

            {TERMS_AND_PRIVACY_SECTIONS.map((section) => (
              <YStack key={section.title} gap="$1.5" marginTop="$4">
                <AppText variant="label" color="primary" fontWeight="700">
                  {section.title}
                </AppText>
                <AppText variant="caption" muted lineHeight={20}>
                  {section.body}
                </AppText>
              </YStack>
            ))}
          </ScrollView>

          <YStack
            paddingHorizontal="$5"
            paddingTop="$3"
            paddingBottom="$5"
            gap="$3"
            borderTopWidth={1}
            borderTopColor="$border"
            backgroundColor="$surface"
          >
            <PrivacyTermsAcceptRow
              checked={draftAccepted}
              onPress={() => setDraftAccepted((value) => !value)}
            />
            <PrimaryButton
              fullWidth
              disabled={!draftAccepted}
              onPress={handleConfirm}
              accessibilityLabel="Conferma accettazione dei termini"
            >
              Conferma
            </PrimaryButton>
            <AppButton variant="ghost" fullWidth onPress={onClose}>
              Chiudi
            </AppButton>
          </YStack>
        </YStack>
      </YStack>
    </Modal>
  );
}

const styles = StyleSheet.create({
  brandBar: {
    height: 6,
    width: "100%",
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
});
