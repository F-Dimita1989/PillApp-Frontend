import { useCallback, useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { OnboardingFlow } from "@/components/onboarding-flow";
import { PostOnboardingFlow } from "@/components/post-onboarding-flow";
import {
  screenSwipeTiming,
  swipeEnterX,
  swipeExitX,
} from "@/lib/motion/screen-transition";
import { pillappColors } from "@/theme/tokens";

type AppEntryFlowProps = {
  hasSeenOnboarding: boolean;
  needsAccessSetup: boolean;
  needsSetup: boolean;
  startAtAccessSetup?: boolean;
  onAccessSetupComplete: () => void;
  onProfileSetupComplete: () => void;
  onSkipProfileSetup: () => void;
};

export function AppEntryFlow({
  hasSeenOnboarding,
  needsAccessSetup,
  needsSetup,
  startAtAccessSetup = false,
  onAccessSetupComplete,
  onProfileSetupComplete,
  onSkipProfileSetup,
}: AppEntryFlowProps) {
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.max(windowWidth, 1);

  const showOnboardingInitially = !hasSeenOnboarding || needsAccessSetup;
  const showProfileInitially =
    hasSeenOnboarding && !needsAccessSetup && needsSetup;

  const [showOnboarding, setShowOnboarding] = useState(showOnboardingInitially);
  const [showProfile, setShowProfile] = useState(showProfileInitially);
  const [profileInFront, setProfileInFront] = useState(showProfileInitially);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const onboardingX = useSharedValue(0);
  const profileX = useSharedValue(showProfileInitially ? 0 : width);

  const setIdle = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  const finishOnboardingTransition = useCallback(() => {
    setShowOnboarding(false);
    setIdle();
  }, [setIdle]);

  const handleAccessSetupComplete = useCallback(() => {
    onAccessSetupComplete();

    if (!needsSetup) {
      setShowOnboarding(false);
      return;
    }

    setIsTransitioning(true);
    setShowProfile(true);
    setProfileInFront(true);
    profileX.value = swipeEnterX(width);
    profileX.value = withTiming(0, screenSwipeTiming);
    onboardingX.value = withTiming(swipeExitX(width), screenSwipeTiming, (finished) => {
      if (!finished) {
        return;
      }
      runOnJS(finishOnboardingTransition)();
    });
  }, [
    finishOnboardingTransition,
    needsSetup,
    onAccessSetupComplete,
    onboardingX,
    profileX,
    width,
  ]);

  const onboardingStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: onboardingX.value }],
  }));

  const profileStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: profileX.value }],
  }));

  if (!showOnboarding && !showProfile) {
    return null;
  }

  return (
    <View style={styles.host}>
      {showProfile ? (
        <Animated.View
          style={[
            styles.layer,
            styles.profileLayer,
            profileInFront && styles.frontLayer,
            profileStyle,
          ]}
          pointerEvents={isTransitioning ? "none" : "auto"}
        >
          <PostOnboardingFlow onComplete={onProfileSetupComplete} />
        </Animated.View>
      ) : null}

      {showOnboarding ? (
        <Animated.View
          style={[styles.layer, styles.onboardingLayer, onboardingStyle]}
          pointerEvents={isTransitioning ? "none" : "auto"}
        >
          <OnboardingFlow
            startAtAccessSetup={startAtAccessSetup}
            onComplete={handleAccessSetupComplete}
            onSkipProfileSetup={onSkipProfileSetup}
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
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
  },
  profileLayer: {
    zIndex: 1,
    backgroundColor: pillappColors.background,
  },
  onboardingLayer: {
    zIndex: 2,
    backgroundColor: pillappColors.background,
  },
  frontLayer: {
    zIndex: 5,
  },
});
