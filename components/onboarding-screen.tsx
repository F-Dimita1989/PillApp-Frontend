import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  View,
  useWindowDimensions,
  type ListRenderItemInfo,
  type ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import { OnboardingSlideView } from "@/components/onboarding/onboarding-slide-view";
import { PrimaryButton, SecondaryButton } from "@/components/ui";
import {
  ONBOARDING_SLIDE_COUNT,
  onboardingSlides,
  type OnboardingSlide,
} from "@/constants/onboarding-slides";
import { layout, spacing } from "@/constants/spacing";
import { markOnboardingAsSeen } from "@/lib/onboarding/storage";
import { pillappColors } from "@/theme/tokens";

type OnboardingScreenProps = {
  onComplete: () => void;
};

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<OnboardingSlide>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLastSlide = currentIndex === ONBOARDING_SLIDE_COUNT - 1;
  const isFirstSlide = currentIndex === 0;

  const finishOnboarding = useCallback(async () => {
    await markOnboardingAsSeen();
    onComplete();
  }, [onComplete]);

  const goNext = useCallback(() => {
    if (isLastSlide) {
      void finishOnboarding();
      return;
    }
    listRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
  }, [currentIndex, finishOnboarding, isLastSlide]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const index = viewableItems[0]?.index;
      if (typeof index === "number") {
        setCurrentIndex(index);
      }
    },
  ).current;

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<OnboardingSlide>) => (
      <OnboardingSlideView slide={item} width={width} />
    ),
    [width],
  );

  return (
    <YStack flex={1} backgroundColor="$background">
      <FlatList
        ref={listRef}
        data={onboardingSlides}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 60 }}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        style={{ flex: 1 }}
      />

      <YStack
        paddingHorizontal={layout.screenPaddingHorizontal}
        paddingBottom={insets.bottom + spacing.md}
        paddingTop={spacing.md}
        gap="$3"
        backgroundColor="$background"
      >
        <XStack justifyContent="center" gap="$2">
          {onboardingSlides.map((slide, index) => (
            <View
              key={slide.id}
              style={{
                width: index === currentIndex ? 24 : 8,
                height: 8,
                borderRadius: 999,
                backgroundColor:
                  index === currentIndex ? pillappColors.primary : pillappColors.border,
              }}
            />
          ))}
        </XStack>

        <PrimaryButton fullWidth onPress={goNext}>
          {isLastSlide ? "Inizia" : "Continua"}
        </PrimaryButton>

        {!isFirstSlide ? (
          <SecondaryButton
            fullWidth
            onPress={() =>
              listRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true })
            }
          >
            Indietro
          </SecondaryButton>
        ) : (
          <SecondaryButton fullWidth onPress={() => void finishOnboarding()}>
            Salta
          </SecondaryButton>
        )}
      </YStack>
    </YStack>
  );
}
