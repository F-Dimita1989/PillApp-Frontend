import { useCallback, useMemo, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import { OnboardingArcCarousel } from "@/components/onboarding/onboarding-arc-carousel";
import { OnboardingGradientButton } from "@/components/onboarding/onboarding-gradient-button";
import { OnboardingSlideView } from "@/components/onboarding/onboarding-slide-view";
import { AppText } from "@/components/ui/app-text";
import {
  IntroHeroArc,
  getOnboardingArcLayout,
  getOnboardingHeroZoneHeight,
  onboardingHeroEmblemLayout,
} from "@/components/ui";
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

type OnboardingSlidePageProps = {
  slide: OnboardingSlide;
  width: number;
  heroZoneHeight: number;
  bottomInset: number;
};

function OnboardingSlidePage({
  slide,
  width,
  heroZoneHeight,
  bottomInset,
}: OnboardingSlidePageProps) {
  return (
    <View style={[styles.page, { width }]}>
      <View style={{ height: heroZoneHeight }} />
      <View style={styles.slideBody}>
        <OnboardingSlideView slide={slide} width={width} bottomInset={bottomInset} />
      </View>
    </View>
  );
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const listRef = useRef<Animated.FlatList<OnboardingSlide>>(null);
  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const arcLayout = useMemo(
    () => getOnboardingArcLayout(width, onboardingHeroEmblemLayout.size),
    [width],
  );

  const heroZoneHeight = useMemo(
    () => getOnboardingHeroZoneHeight(width, onboardingHeroEmblemLayout.size, insets.top),
    [insets.top, width],
  );

  const slideBottomInset = useMemo(
    () => insets.bottom + 16,
    [insets.bottom],
  );

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
    const nextIndex = currentIndex + 1;
    listRef.current?.scrollToOffset({
      offset: nextIndex * width,
      animated: true,
    });
    setCurrentIndex(nextIndex);
  }, [currentIndex, finishOnboarding, isLastSlide, width]);

  const goPrevious = useCallback(() => {
    const prevIndex = currentIndex - 1;
    listRef.current?.scrollToOffset({
      offset: prevIndex * width,
      animated: true,
    });
    setCurrentIndex(prevIndex);
  }, [currentIndex, width]);

  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / width);
      setCurrentIndex(Math.max(0, Math.min(ONBOARDING_SLIDE_COUNT - 1, index)));
    },
    [width],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<OnboardingSlide>) => (
      <OnboardingSlidePage
        slide={item}
        width={width}
        heroZoneHeight={heroZoneHeight}
        bottomInset={slideBottomInset}
      />
    ),
    [heroZoneHeight, slideBottomInset, width],
  );

  return (
    <YStack flex={1} backgroundColor="$background">
      <StatusBar style="dark" />
      <View style={styles.pagerHost}>
        <Animated.FlatList
          ref={listRef}
          data={onboardingSlides}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          snapToInterval={width}
          snapToAlignment="start"
          bounces={false}
          decelerationRate="fast"
          overScrollMode="never"
          removeClippedSubviews={false}
          showsHorizontalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={1}
          onMomentumScrollEnd={handleScrollEnd}
          onScrollEndDrag={handleScrollEnd}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          style={styles.pager}
          contentContainerStyle={styles.pagerContent}
        />

        <View style={styles.heroOverlay} pointerEvents="none">
          <IntroHeroArc
            title=""
            showCopy={false}
            showLogo={false}
            parentPaddingX={0}
            emblemSize={onboardingHeroEmblemLayout.size}
            emblemVariant="carousel"
            carouselStageHeight={arcLayout.carouselStageHeight}
            extendIntoStatusBar
            emblem={
              <OnboardingArcCarousel
                scrollX={scrollX}
                slideWidth={width}
                emblemSize={onboardingHeroEmblemLayout.size}
              />
            }
          />
        </View>
      </View>

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
              backgroundColor={index === currentIndex ? "$secondary" : "$border"}
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
              onPress={goPrevious}
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

const styles = StyleSheet.create({
  pagerHost: {
    flex: 1,
    position: "relative",
  },
  pager: {
    flex: 1,
  },
  pagerContent: {
    flexGrow: 1,
  },
  page: {
    flex: 1,
    minHeight: 0,
  },
  slideBody: {
    flex: 1,
    minHeight: 0,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
