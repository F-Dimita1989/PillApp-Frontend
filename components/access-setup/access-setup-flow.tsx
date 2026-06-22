import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import { AccessSetupSlideView } from "@/components/access-setup/access-setup-slide-view";
import { OnboardingArcCarousel } from "@/components/onboarding/onboarding-arc-carousel";
import { OnboardingGradientButton } from "@/components/onboarding/onboarding-gradient-button";
import { AppText } from "@/components/ui/app-text";
import {
  IntroHeroArc,
  getOnboardingArcLayout,
  getOnboardingHeroZoneHeight,
} from "@/components/ui";
import {
  ACCESS_SETUP_SLIDE_COUNT,
  accessSetupEmblemSize,
  accessSetupSlides,
} from "@/constants/access-setup-slides";
import type { OnboardingSlide } from "@/constants/onboarding-slides";
import {
  allPermissionsGranted,
  getAppPermissionStates,
  requestAllAppPermissions,
  type AppPermissionState,
} from "@/lib/access-setup/permissions";
import { markAccessSetupComplete } from "@/lib/access-setup/storage";
import { pillappLayout } from "@/theme/tokens";

type AccessSetupFlowProps = {
  onComplete: () => void;
};

type AccessSetupSlidePageProps = {
  slide: OnboardingSlide;
  index: number;
  width: number;
  scrollX: SharedValue<number>;
  heroZoneHeight: number;
  permissionStates: AppPermissionState[];
  isLoadingPermissions: boolean;
  hasRequestedPermissions: boolean;
  permissionsGranted: boolean;
};

function AccessSetupSlidePage({
  slide,
  index,
  width,
  scrollX,
  heroZoneHeight,
  permissionStates,
  isLoadingPermissions,
  hasRequestedPermissions,
  permissionsGranted,
}: AccessSetupSlidePageProps) {
  const textStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollX.value,
      [(index - 0.65) * width, index * width, (index + 0.65) * width],
      [0, 1, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateY: interpolate(
          scrollX.value,
          [(index - 1) * width, index * width, (index + 1) * width],
          [12, 0, 12],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return (
    <View style={[styles.page, { width }]}>
      <View style={{ height: heroZoneHeight }} />
      <Animated.View style={[styles.slideBody, textStyle]}>
        <AccessSetupSlideView
          slide={slide}
          width={width}
          permissionStates={permissionStates}
          isLoadingPermissions={isLoadingPermissions}
          hasRequestedPermissions={hasRequestedPermissions}
          permissionsGranted={permissionsGranted}
        />
      </Animated.View>
    </View>
  );
}

export function AccessSetupFlow({ onComplete }: AccessSetupFlowProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const listRef = useRef<Animated.FlatList<OnboardingSlide>>(null);
  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [permissionStates, setPermissionStates] = useState<AppPermissionState[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);
  const [hasRequestedPermissions, setHasRequestedPermissions] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const arcLayout = useMemo(
    () => getOnboardingArcLayout(width, accessSetupEmblemSize),
    [width],
  );

  const heroZoneHeight = useMemo(
    () => getOnboardingHeroZoneHeight(width, accessSetupEmblemSize, insets.top),
    [insets.top, width],
  );

  const isFirstSlide = currentIndex === 0;
  const isLastSlide = currentIndex === ACCESS_SETUP_SLIDE_COUNT - 1;

  const permissionsGranted = allPermissionsGranted(permissionStates);

  const refreshPermissions = useCallback(async () => {
    setIsLoadingPermissions(true);
    try {
      setPermissionStates(await getAppPermissionStates());
    } finally {
      setIsLoadingPermissions(false);
    }
  }, []);

  useEffect(() => {
    void refreshPermissions();
  }, [refreshPermissions]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleRequestPermissions = useCallback(async () => {
    setIsRequestingPermissions(true);
    setHasRequestedPermissions(true);
    try {
      setPermissionStates(await requestAllAppPermissions());
    } finally {
      setIsRequestingPermissions(false);
    }
  }, []);

  const goNext = useCallback(() => {
    if (isLastSlide) {
      return;
    }

    const nextIndex = currentIndex + 1;
    listRef.current?.scrollToOffset({
      offset: nextIndex * width,
      animated: true,
    });
    setCurrentIndex(nextIndex);
  }, [currentIndex, isLastSlide, width]);

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
      setCurrentIndex(Math.max(0, Math.min(ACCESS_SETUP_SLIDE_COUNT - 1, index)));
    },
    [width],
  );

  const handleFinish = useCallback(async () => {
    if (isFinishing) {
      return;
    }

    setIsFinishing(true);
    try {
      await markAccessSetupComplete();
      onComplete();
    } finally {
      setIsFinishing(false);
    }
  }, [isFinishing, onComplete]);

  const handlePrimaryPress = useCallback(() => {
    if (isFirstSlide) {
      if (!permissionsGranted) {
        void handleRequestPermissions();
        return;
      }
      goNext();
      return;
    }

    void handleFinish();
  }, [goNext, handleFinish, handleRequestPermissions, isFirstSlide, permissionsGranted]);

  const primaryLabel = useMemo(() => {
    if (isFirstSlide) {
      if (isRequestingPermissions) {
        return "Attendi...";
      }
      return permissionsGranted ? "Continua" : "Consenti gli accessi";
    }
    return isFinishing ? "Attendi..." : "Ho capito";
  }, [isFinishing, isFirstSlide, isRequestingPermissions, permissionsGranted]);

  const primaryDisabled = isRequestingPermissions || isFinishing;

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<OnboardingSlide>) => (
      <AccessSetupSlidePage
        slide={item}
        index={index}
        width={width}
        scrollX={scrollX}
        heroZoneHeight={heroZoneHeight}
        permissionStates={permissionStates}
        isLoadingPermissions={isLoadingPermissions}
        hasRequestedPermissions={hasRequestedPermissions}
        permissionsGranted={permissionsGranted}
      />
    ),
    [
      hasRequestedPermissions,
      heroZoneHeight,
      isLoadingPermissions,
      permissionStates,
      permissionsGranted,
      scrollX,
      width,
    ],
  );

  return (
    <YStack flex={1} backgroundColor="$background">
      <StatusBar style="dark" />
      <View style={styles.pagerHost}>
        <Animated.FlatList
          ref={listRef}
          data={accessSetupSlides}
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
          scrollEnabled={currentIndex !== 0 || permissionsGranted}
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
            emblemSize={accessSetupEmblemSize}
            emblemVariant="carousel"
            carouselStageHeight={arcLayout.carouselStageHeight}
            emblem={
              <OnboardingArcCarousel
                slides={accessSetupSlides}
                scrollX={scrollX}
                slideWidth={width}
                emblemSize={accessSetupEmblemSize}
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
          {accessSetupSlides.map((slide, index) => (
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
            <View style={styles.sideSlot} />
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

          <View style={primaryDisabled ? styles.disabledButton : undefined}>
            <OnboardingGradientButton
              label={primaryLabel}
              onPress={primaryDisabled ? () => {} : handlePrimaryPress}
            />
          </View>
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
  sideSlot: {
    minWidth: 72,
  },
  disabledButton: {
    opacity: 0.55,
  },
});
