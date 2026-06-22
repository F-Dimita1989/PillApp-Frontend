import { useCallback, useRef, useState } from "react";
import {
  useWindowDimensions,
  type ListRenderItemInfo,
  type ViewToken,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import { OnboardingGradientButton } from "@/components/onboarding/onboarding-gradient-button";
import { OnboardingHeroEmblem } from "@/components/onboarding/onboarding-hero-emblem";
import { OnboardingSlideView } from "@/components/onboarding/onboarding-slide-view";
import { AppText } from "@/components/ui/app-text";
import { IntroHeroArc, onboardingHeroEmblemLayout } from "@/components/ui";
import {
  ONBOARDING_SLIDE_COUNT,
  onboardingSlides,
  type OnboardingSlide,
} from "@/constants/onboarding-slides";
import { markOnboardingAsSeen } from "@/lib/onboarding/storage";
import { pillappLayout } from "@/theme/tokens";

type OnboardingScreenProps = {
  onComplete: () => void;
};

type OnboardingAnimatedSlideProps = {
  slide: OnboardingSlide;
  index: number;
  width: number;
  scrollX: SharedValue<number>;
};

function OnboardingAnimatedSlide({
  slide,
  index,
  width,
  scrollX,
}: OnboardingAnimatedSlideProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [0, 1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <Animated.View style={[{ width }, animatedStyle]}>
      <OnboardingSlideView slide={slide} width={width} />
    </Animated.View>
  );
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const listRef = useRef<Animated.FlatList<OnboardingSlide>>(null);
  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

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
    ({ item, index }: ListRenderItemInfo<OnboardingSlide>) => (
      <OnboardingAnimatedSlide
        slide={item}
        index={index}
        width={width}
        scrollX={scrollX}
      />
    ),
    [scrollX, width],
  );

  return (
    <YStack flex={1} backgroundColor="$background">
      <IntroHeroArc
        title=""
        showCopy={false}
        showLogo={false}
        parentPaddingX={0}
        emblemSize={onboardingHeroEmblemLayout.size}
        emblem={
          <OnboardingHeroEmblem
            scrollX={scrollX}
            width={width}
            emblemSize={onboardingHeroEmblemLayout.size}
          />
        }
      />

      <Animated.FlatList
        ref={listRef}
        data={onboardingSlides}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
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
        paddingHorizontal={pillappLayout.screenPaddingX}
        paddingBottom={insets.bottom + 16}
        paddingTop="$4"
        gap="$4"
        backgroundColor="$background"
      >
        <XStack justifyContent="center" gap="$2">
          {onboardingSlides.map((slide, index) => (
            <YStack
              key={slide.id}
              width={index === currentIndex ? 24 : 8}
              height={8}
              borderRadius="$pill"
              backgroundColor={index === currentIndex ? "$primary" : "$border"}
            />
          ))}
        </XStack>

        <XStack justifyContent="space-between" alignItems="center" minHeight={48}>
          {isFirstSlide ? (
            <Pressable
              onPress={() => void finishOnboarding()}
              accessibilityRole="button"
              accessibilityLabel="Salta introduzione"
              hitSlop={8}
            >
              <AppText variant="body" color="primary" fontWeight="600">
                Salta
              </AppText>
            </Pressable>
          ) : (
            <Pressable
              onPress={() =>
                listRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true })
              }
              accessibilityRole="button"
              accessibilityLabel="Torna alla slide precedente"
              hitSlop={8}
            >
              <AppText variant="body" color="primary" fontWeight="600">
                Indietro
              </AppText>
            </Pressable>
          )}

          <OnboardingGradientButton
            label={isLastSlide ? "Inizia" : "Continua"}
            onPress={goNext}
          />
        </XStack>
      </YStack>
    </YStack>
  );
}
