import { useCallback, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import { AccessSetupFlow } from "@/components/access-setup/access-setup-flow";
import { OnboardingScreen } from "@/components/onboarding-screen";
import { WelcomeScreen } from "@/components/welcome-screen";
import { skipOnboardingToHome } from "@/lib/onboarding/storage";
import { pillappColors } from "@/theme/tokens";

type OnboardingFlowProps = {
  onComplete: () => void;
  onSkipProfileSetup: () => void;
  startAtAccessSetup?: boolean;
};

type WelcomeExitTarget = "intro" | "access";

const EXIT_DURATION_MS = 550;
const ENTER_DURATION_MS = 650;
const CROSSFADE_DELAY_MS = 160;

const exitTiming = {
  duration: EXIT_DURATION_MS,
  easing: Easing.inOut(Easing.cubic),
};

const enterTiming = {
  duration: ENTER_DURATION_MS,
  easing: Easing.out(Easing.cubic),
};

export function OnboardingFlow({
  onComplete,
  onSkipProfileSetup,
  startAtAccessSetup = false,
}: OnboardingFlowProps) {
  const [showWelcome, setShowWelcome] = useState(!startAtAccessSetup);
  const [showIntro, setShowIntro] = useState(false);
  const [showAccess, setShowAccess] = useState(startAtAccessSetup);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isTransitioningRef = useRef(false);

  const welcomeOpacity = useSharedValue(startAtAccessSetup ? 0 : 1);
  const welcomeScale = useSharedValue(1);
  const introOpacity = useSharedValue(0);
  const introTranslateY = useSharedValue(22);
  const introScale = useSharedValue(1);
  const accessOpacity = useSharedValue(startAtAccessSetup ? 1 : 0);
  const accessTranslateY = useSharedValue(startAtAccessSetup ? 0 : 22);
  const exitOverlayOpacity = useSharedValue(0);

  const setIdle = useCallback(() => {
    isTransitioningRef.current = false;
    setIsTransitioning(false);
  }, []);

  const enterIntro = useCallback(() => {
    introOpacity.value = withDelay(CROSSFADE_DELAY_MS, withTiming(1, enterTiming));
    introTranslateY.value = withDelay(CROSSFADE_DELAY_MS, withTiming(0, enterTiming));
  }, [introOpacity, introTranslateY]);

  const enterAccess = useCallback(() => {
    accessOpacity.value = withDelay(CROSSFADE_DELAY_MS, withTiming(1, enterTiming));
    accessTranslateY.value = withDelay(CROSSFADE_DELAY_MS, withTiming(0, enterTiming));
  }, [accessOpacity, accessTranslateY]);

  const revealAccessAfterSkip = useCallback(() => {
    setShowWelcome(false);
    setShowAccess(true);
    accessOpacity.value = 0;
    accessTranslateY.value = 22;
    enterAccess();
    exitOverlayOpacity.value = withTiming(0, enterTiming, (finished) => {
      if (finished) {
        runOnJS(setIdle)();
      }
    });
  }, [accessOpacity, accessTranslateY, enterAccess, exitOverlayOpacity, setIdle]);

  const prepareSkipToAccess = useCallback(() => {
    void skipOnboardingToHome().then(() => {
      onSkipProfileSetup();
      revealAccessAfterSkip();
    });
  }, [onSkipProfileSetup, revealAccessAfterSkip]);

  const hideWelcome = useCallback(() => {
    setShowWelcome(false);
    setIdle();
  }, [setIdle]);

  const hideIntro = useCallback(() => {
    setShowIntro(false);
    setIdle();
  }, [setIdle]);

  const animateWelcomeExit = useCallback(
    (target: WelcomeExitTarget) => {
      if (isTransitioningRef.current) {
        return;
      }

      isTransitioningRef.current = true;
      setIsTransitioning(true);

      if (target === "intro") {
        setShowIntro(true);
        introOpacity.value = 0;
        introTranslateY.value = 22;
        introScale.value = 1;
        enterIntro();
      } else {
        exitOverlayOpacity.value = withTiming(1, exitTiming);
      }

      welcomeOpacity.value = withTiming(0, exitTiming, (finished) => {
        if (!finished) {
          return;
        }

        if (target === "intro") {
          runOnJS(hideWelcome)();
          return;
        }

        runOnJS(prepareSkipToAccess)();
      });
      welcomeScale.value = withTiming(0.97, exitTiming);
    },
    [
      enterIntro,
      exitOverlayOpacity,
      hideWelcome,
      introOpacity,
      introScale,
      introTranslateY,
      prepareSkipToAccess,
      welcomeOpacity,
      welcomeScale,
    ],
  );

  const animateIntroExitToAccess = useCallback(() => {
    if (isTransitioningRef.current) {
      return;
    }

    isTransitioningRef.current = true;
    setIsTransitioning(true);
    setShowAccess(true);
    accessOpacity.value = 0;
    accessTranslateY.value = 22;
    enterAccess();

    introOpacity.value = withTiming(0, exitTiming, (finished) => {
      if (finished) {
        runOnJS(hideIntro)();
      }
    });
    introScale.value = withTiming(0.97, exitTiming);
  }, [
    accessOpacity,
    accessTranslateY,
    enterAccess,
    hideIntro,
    introOpacity,
    introScale,
  ]);

  const handleWelcomeContinue = useCallback(() => {
    animateWelcomeExit("intro");
  }, [animateWelcomeExit]);

  const handleWelcomeSkip = useCallback(() => {
    animateWelcomeExit("access");
  }, [animateWelcomeExit]);

  const welcomeStyle = useAnimatedStyle(() => ({
    opacity: welcomeOpacity.value,
    transform: [{ scale: welcomeScale.value }],
  }));

  const introStyle = useAnimatedStyle(() => ({
    opacity: introOpacity.value,
    transform: [{ translateY: introTranslateY.value }, { scale: introScale.value }],
  }));

  const accessStyle = useAnimatedStyle(() => ({
    opacity: accessOpacity.value,
    transform: [{ translateY: accessTranslateY.value }],
  }));

  const exitOverlayStyle = useAnimatedStyle(() => ({
    opacity: exitOverlayOpacity.value,
  }));

  return (
    <View style={styles.host}>
      {showAccess ? (
        <Animated.View
          style={[styles.layer, styles.accessLayer, accessStyle]}
          pointerEvents={isTransitioning ? "none" : "auto"}
        >
          <AccessSetupFlow onComplete={onComplete} />
        </Animated.View>
      ) : null}

      {showIntro ? (
        <Animated.View
          style={[styles.layer, styles.introLayer, introStyle]}
          pointerEvents={isTransitioning ? "none" : "auto"}
        >
          <OnboardingScreen onComplete={animateIntroExitToAccess} />
        </Animated.View>
      ) : null}

      {showWelcome ? (
        <Animated.View
          style={[styles.layer, styles.welcomeLayer, welcomeStyle]}
          pointerEvents={isTransitioning ? "none" : "auto"}
        >
          <WelcomeScreen
            onContinue={handleWelcomeContinue}
            onSkipToHome={handleWelcomeSkip}
          />
        </Animated.View>
      ) : null}

      <Animated.View pointerEvents="none" style={[styles.exitOverlay, exitOverlayStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
  },
  accessLayer: {
    zIndex: 1,
  },
  introLayer: {
    zIndex: 2,
  },
  welcomeLayer: {
    zIndex: 3,
  },
  exitOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 4,
    backgroundColor: pillappColors.background,
  },
});
