import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { YStack } from "tamagui";

import { AppButton, AppText, PrimaryButton } from "@/components/ui";
import { tourExitTiming, tourIntroTiming } from "@/lib/motion/tour-transition";
import { pillappBrandGradient, pillappColors, pillappShadows } from "@/theme/tokens";

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
  const [mounted, setMounted] = useState(visible);
  const mountedRef = useRef(visible);
  const backdropOpacity = useSharedValue(0);
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(18);

  useEffect(() => {
    if (visible) {
      mountedRef.current = true;
      setMounted(true);
      backdropOpacity.value = 0;
      cardOpacity.value = 0;
      cardTranslateY.value = 18;
      backdropOpacity.value = withTiming(1, tourIntroTiming);
      cardOpacity.value = withTiming(1, tourIntroTiming);
      cardTranslateY.value = withTiming(0, tourIntroTiming);
      return;
    }

    if (!mountedRef.current) {
      return;
    }

    backdropOpacity.value = withTiming(0, tourExitTiming);
    cardOpacity.value = withTiming(0, tourExitTiming);
    cardTranslateY.value = withTiming(12, tourExitTiming, (finished) => {
      if (finished) {
        mountedRef.current = false;
        runOnJS(setMounted)(false);
      }
    });
  }, [backdropOpacity, cardOpacity, cardTranslateY, visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

  if (!mounted) {
    return null;
  }

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onSkip}
    >
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityLabel="Sfondo guida scansione"
          accessibilityRole="none"
        />
        <Animated.View style={[styles.cardWrap, cardStyle]}>
          <YStack
            width="100%"
            backgroundColor="$surface"
            borderRadius="$4"
            overflow="hidden"
            borderWidth={1}
            borderColor="$borderStrong"
            accessibilityRole="alert"
            accessibilityLabel="Breve guida alla scansione AIC. Premi Inizia guida per i 4 passi oppure Salta guida."
          >
            <LinearGradient
              colors={[...pillappBrandGradient.colors]}
              locations={[...pillappBrandGradient.locations]}
              start={pillappBrandGradient.start}
              end={pillappBrandGradient.end}
              style={styles.brandBar}
            />

            <YStack padding="$6" gap="$3" alignItems="center">
              <LinearGradient
                colors={[...pillappBrandGradient.colors]}
                locations={[...pillappBrandGradient.locations]}
                start={pillappBrandGradient.start}
                end={pillappBrandGradient.end}
                style={styles.iconCircle}
              >
                <MaterialCommunityIcons
                  name="school-outline"
                  size={32}
                  color={pillappColors.onPrimary}
                />
              </LinearGradient>

              <AppText variant="title" color="primary" textAlign="center">
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
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    paddingHorizontal: 16,
  },
  cardWrap: {
    width: "100%",
    maxWidth: 400,
    zIndex: 1,
    borderRadius: 20,
    ...pillappShadows.lg,
  },
  brandBar: {
    height: 6,
    width: "100%",
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
