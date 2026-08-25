import { useCallback, useRef, useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { AccessSetupFlow } from "@/components/access-setup/access-setup-flow";
import { OnboardingScreen } from "@/components/onboarding-screen";
import { WelcomeScreen } from "@/components/welcome-screen";
import { skipOnboardingToHome } from "@/lib/onboarding/storage";
import {
  screenSwipeTiming,
  swipeEnterX,
  swipeExitX,
} from "@/lib/motion/screen-transition";
import { pillappColors } from "@/theme/tokens";

type OnboardingFlowProps = {
  onComplete: () => void;
  onSkipProfileSetup: () => void;
  startAtAccessSetup?: boolean;
};

type WelcomeExitTarget = "intro" | "access";

export function OnboardingFlow({
  onComplete,
  onSkipProfileSetup,
  startAtAccessSetup = false,
}: OnboardingFlowProps) {
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.max(windowWidth, 1);

  const [showWelcome, setShowWelcome] = useState(!startAtAccessSetup);
  const [showIntro, setShowIntro] = useState(false);
  const [showAccess, setShowAccess] = useState(startAtAccessSetup);
  const [frontLayer, setFrontLayer] = useState<"welcome" | "intro" | "access">(
    startAtAccessSetup ? "access" : "welcome",
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isTransitioningRef = useRef(false);

  const welcomeX = useSharedValue(0);
  const introX = useSharedValue(startAtAccessSetup ? 0 : width);
  const accessX = useSharedValue(startAtAccessSetup ? 0 : width);

  const setIdle = useCallback(() => {
    isTransitioningRef.current = false;
    setIsTransitioning(false);
  }, []);

  const hideWelcome = useCallback(() => {
    setShowWelcome(false);
    setIdle();
  }, [setIdle]);

  const hideIntro = useCallback(() => {
    setShowIntro(false);
    setIdle();
  }, [setIdle]);

  const finishSkipToAccess = useCallback(() => {
    void skipOnboardingToHome().then(() => {
      onSkipProfileSetup();
      setShowWelcome(false);
      setIdle();
    });
  }, [onSkipProfileSetup, setIdle]);

  const animateWelcomeExit = useCallback(
    (target: WelcomeExitTarget) => {
      if (isTransitioningRef.current) {
        return;
      }

      isTransitioningRef.current = true;
      setIsTransitioning(true);

      if (target === "intro") {
        setShowIntro(true);
        setFrontLayer("intro");
        introX.value = swipeEnterX(width);
        introX.value = withTiming(0, screenSwipeTiming);
        welcomeX.value = withTiming(swipeExitX(width), screenSwipeTiming, (finished) => {
          if (finished) {
            runOnJS(hideWelcome)();
          }
        });
        return;
      }

      welcomeX.value = withTiming(swipeExitX(width), screenSwipeTiming, (finished) => {
        if (finished) {
          runOnJS(finishSkipToAccess)();
        }
      });
    },
    [finishSkipToAccess, hideWelcome, introX, welcomeX, width],
  );

  const animateIntroExitToAccess = useCallback(() => {
    if (isTransitioningRef.current) {
      return;
    }

    isTransitioningRef.current = true;
    setIsTransitioning(true);
    setShowAccess(true);
    setFrontLayer("access");
    accessX.value = swipeEnterX(width);
    accessX.value = withTiming(0, screenSwipeTiming);
    introX.value = withTiming(swipeExitX(width), screenSwipeTiming, (finished) => {
      if (finished) {
        runOnJS(hideIntro)();
      }
    });
  }, [accessX, hideIntro, introX, width]);

  const handleWelcomeContinue = useCallback(() => {
    animateWelcomeExit("intro");
  }, [animateWelcomeExit]);

  const handleWelcomeSkip = useCallback(() => {
    animateWelcomeExit("access");
  }, [animateWelcomeExit]);

  const welcomeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: welcomeX.value }],
  }));

  const introStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: introX.value }],
  }));

  const accessStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: accessX.value }],
  }));

  return (
    <View style={styles.host}>
      {showAccess ? (
        <Animated.View
          style={[
            styles.layer,
            styles.accessLayer,
            frontLayer === "access" && styles.frontLayer,
            accessStyle,
          ]}
          pointerEvents={isTransitioning ? "none" : "auto"}
        >
          <AccessSetupFlow onComplete={onComplete} />
        </Animated.View>
      ) : null}

      {showIntro ? (
        <Animated.View
          style={[
            styles.layer,
            styles.introLayer,
            frontLayer === "intro" && styles.frontLayer,
            introStyle,
          ]}
          pointerEvents={isTransitioning ? "none" : "auto"}
        >
          <OnboardingScreen onComplete={animateIntroExitToAccess} />
        </Animated.View>
      ) : null}

      {showWelcome ? (
        <Animated.View
          style={[
            styles.layer,
            styles.welcomeLayer,
            frontLayer === "welcome" && styles.frontLayer,
            welcomeStyle,
          ]}
          pointerEvents={isTransitioning ? "none" : "auto"}
        >
          <WelcomeScreen
            onContinue={handleWelcomeContinue}
            onSkipToHome={handleWelcomeSkip}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: pillappColors.background,
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: pillappColors.background,
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
  frontLayer: {
    zIndex: 5,
  },
});
