import Onboarding from "react-native-onboarding-swiper";
import { StyleSheet } from "react-native";

import {
  onboardingSharedStyles,
  pillAppOnboardingPages,
} from "@/components/onboarding-pages";
import { markOnboardingAsSeen } from "@/lib/onboarding/storage";

type OnboardingScreenProps = {
  /** Chiamato dopo Skip/Done: naviga verso Home/MainTabs nel layout radice. */
  onComplete: () => void;
};

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const finishOnboarding = async () => {
    await markOnboardingAsSeen();
    onComplete();
  };

  return (
    <Onboarding
      pages={pillAppOnboardingPages}
      onSkip={() => void finishOnboarding()}
      onDone={() => void finishOnboarding()}
      skipLabel="Salta"
      nextLabel="Avanti"
      doneLabel="Inizia"
      showSkip
      showNext
      showDone
      bottomBarHighlight={false}
      titleStyles={onboardingSharedStyles.title}
      subTitleStyles={onboardingSharedStyles.subtitle}
      imageContainerStyles={onboardingSharedStyles.imageContainer}
      containerStyles={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
