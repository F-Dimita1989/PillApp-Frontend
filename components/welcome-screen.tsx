import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { YStack } from "tamagui";

import { AppText } from "@/components/ui/app-text";
import { useAccessibility } from "@/lib/accessibility/context";
import { scaleFontSize } from "@/lib/accessibility/prefs";
import { pillappFontFamily } from "@/theme/tamagui-fonts";
import { pillappColors, pillappLayout, pillappShadows } from "@/theme/tokens";

/** Prova: gradiente brand diluito, per far leggere il wordmark blu/teal. */
const welcomeLightGradient = {
  colors: [
    pillappColors.secondarySoft,
    "#F4FBFA",
    pillappColors.primarySoft,
    pillappColors.background,
  ] as const,
  locations: [0, 0.35, 0.7, 1] as const,
  start: { x: 0, y: 0 } as const,
  end: { x: 1, y: 1 } as const,
};

const WELCOME_HEADLINE = "Benvenuto in PillApp";
const WELCOME_HEADLINE_WIDTH = 328;

/** Stesso blu → teal del wordmark PillApp. */
function WelcomeHeadline() {
  const { fontScale, largeText } = useAccessibility();
  const fontSize = largeText ? scaleFontSize(24, fontScale) : 24;
  const height = largeText ? scaleFontSize(32, fontScale) : 32;

  return (
    <Svg
      width={WELCOME_HEADLINE_WIDTH}
      height={height}
      accessible
      accessibilityRole="text"
      accessibilityLabel={WELCOME_HEADLINE}
    >
      <Defs>
        <SvgLinearGradient id="welcomeHeadlineFill" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0" stopColor={pillappColors.primary} />
          <Stop offset="1" stopColor={pillappColors.secondary} />
        </SvgLinearGradient>
      </Defs>
      <SvgText
        fill="url(#welcomeHeadlineFill)"
        fontSize={fontSize}
        fontFamily={pillappFontFamily.bold}
        fontWeight="700"
        x={WELCOME_HEADLINE_WIDTH / 2}
        y={fontSize * 0.92}
        textAnchor="middle"
      >
        {WELCOME_HEADLINE}
      </SvgText>
    </Svg>
  );
}

type WelcomeScreenProps = {
  onContinue: () => void;
  onSkipToHome: () => void;
};

const LOGO_SIZE = 168;
const WORDMARK_WIDTH = 268;
const WORDMARK_HEIGHT = Math.round(WORDMARK_WIDTH * (181 / 397));

const LOGO_DELAY_MS = 700;
const LOGO_DURATION_MS = 2600;
const TEXT_DELAY_MS = 2000;
const TEXT_DURATION_MS = 2400;
const PRIMARY_BUTTON_DELAY_MS = 3400;
const SECONDARY_BUTTON_DELAY_MS = 3900;
const BUTTON_DURATION_MS = 2200;

export function WelcomeScreen({ onContinue, onSkipToHome }: WelcomeScreenProps) {
  const insets = useSafeAreaInsets();
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.9);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(18);
  const primaryButtonOpacity = useSharedValue(0);
  const primaryButtonTranslateY = useSharedValue(16);
  const secondaryButtonOpacity = useSharedValue(0);
  const secondaryButtonTranslateY = useSharedValue(16);

  useEffect(() => {
    const logoTiming = {
      duration: LOGO_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    };
    const textTiming = {
      duration: TEXT_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    };
    const buttonTiming = {
      duration: BUTTON_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    };

    logoOpacity.value = withDelay(LOGO_DELAY_MS, withTiming(1, logoTiming));
    logoScale.value = withDelay(LOGO_DELAY_MS, withTiming(1, logoTiming));
    textOpacity.value = withDelay(TEXT_DELAY_MS, withTiming(1, textTiming));
    textTranslateY.value = withDelay(TEXT_DELAY_MS, withTiming(0, textTiming));
    primaryButtonOpacity.value = withDelay(
      PRIMARY_BUTTON_DELAY_MS,
      withTiming(1, buttonTiming),
    );
    primaryButtonTranslateY.value = withDelay(
      PRIMARY_BUTTON_DELAY_MS,
      withTiming(0, buttonTiming),
    );
    secondaryButtonOpacity.value = withDelay(
      SECONDARY_BUTTON_DELAY_MS,
      withTiming(1, buttonTiming),
    );
    secondaryButtonTranslateY.value = withDelay(
      SECONDARY_BUTTON_DELAY_MS,
      withTiming(0, buttonTiming),
    );
  }, [
    logoOpacity,
    logoScale,
    primaryButtonOpacity,
    primaryButtonTranslateY,
    secondaryButtonOpacity,
    secondaryButtonTranslateY,
    textOpacity,
    textTranslateY,
  ]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const primaryButtonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: primaryButtonOpacity.value,
    transform: [{ translateY: primaryButtonTranslateY.value }],
  }));

  const secondaryButtonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: secondaryButtonOpacity.value,
    transform: [{ translateY: secondaryButtonTranslateY.value }],
  }));

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={[...welcomeLightGradient.colors]}
        locations={[...welcomeLightGradient.locations]}
        start={welcomeLightGradient.start}
        end={welcomeLightGradient.end}
        style={StyleSheet.absoluteFill}
      />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom + 16,
          },
        ]}
      >
        <View style={styles.heroArea}>
          <View style={styles.heroBlock}>
            <Animated.View style={logoAnimatedStyle}>
              <View style={styles.logoStack}>
                <Image
                  source={require("@/assets/images/pillapp-wordmark.png")}
                  style={{ width: WORDMARK_WIDTH, height: WORDMARK_HEIGHT }}
                  resizeMode="contain"
                  accessibilityLabel="Logo PillApp"
                />
                <Image
                  source={require("@/assets/images/pillapp-logo-welcome.png")}
                  style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
                  resizeMode="contain"
                  accessible={false}
                  importantForAccessibility="no"
                />
              </View>
            </Animated.View>

            <Animated.View style={textAnimatedStyle}>
              <YStack
                paddingHorizontal={pillappLayout.screenPaddingX}
                gap="$3"
                alignItems="center"
                maxWidth={360}
              >
                <WelcomeHeadline />
                <AppText variant="body" muted textAlign="center">
                  L&apos;app che ti aiuta a ricordare farmaci e orari, in modo semplice e
                  sicuro.
                </AppText>
              </YStack>
            </Animated.View>
          </View>
        </View>

        <YStack
          width="100%"
          paddingHorizontal={pillappLayout.screenPaddingX}
          gap="$3"
        >
          <Animated.View style={primaryButtonAnimatedStyle}>
            <Pressable
              onPress={onContinue}
              accessibilityRole="button"
              accessibilityLabel="Iniziamo"
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <AppText variant="body" color="inverse" fontWeight="700" speakOnPress={false}>
                Iniziamo
              </AppText>
            </Pressable>
          </Animated.View>

          <Animated.View style={secondaryButtonAnimatedStyle}>
            <Pressable
              onPress={onSkipToHome}
              accessibilityRole="button"
              accessibilityLabel="Salta e vai alla home"
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <AppText variant="body" color="primary" fontWeight="600" textAlign="center" speakOnPress={false}>
                Salta e vai alla home
              </AppText>
            </Pressable>
          </Animated.View>
        </YStack>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  heroArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroBlock: {
    alignItems: "center",
    gap: 28,
  },
  logoStack: {
    alignItems: "center",
    gap: 12,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: pillappColors.primary,
    ...pillappShadows.sm,
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: pillappColors.primary,
    backgroundColor: "transparent",
  },
  buttonPressed: {
    opacity: 0.9,
  },
});
