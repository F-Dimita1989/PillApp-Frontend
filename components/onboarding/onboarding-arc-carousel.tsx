import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import type { ImageSourcePropType } from "react-native";
import { Image, StyleSheet, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

import {
  onboardingSlides,
  type OnboardingSlide,
} from "@/constants/onboarding-slides";
import {
  HeroEmblemFrame,
  getOnboardingArcLayout,
  onboardingHeroEmblemLayout,
  type OnboardingArcLayout,
} from "@/components/ui/intro-hero-arc";

type OnboardingArcCarouselProps = {
  scrollX: SharedValue<number>;
  slideWidth: number;
  slides?: OnboardingSlide[];
  emblemSize?: number;
};

type CarouselCardProps = {
  slide: OnboardingSlide;
  index: number;
  scrollX: SharedValue<number>;
  slideWidth: number;
  layout: OnboardingArcLayout;
  slideOffset: number;
  iconSize: number;
  logoSize: number;
};

type EmblemCoverImageProps = {
  source: ImageSourcePropType;
  size: number;
  coverScale?: number;
};

function EmblemCoverImage({ source, size, coverScale = 1 }: EmblemCoverImageProps) {
  const scaledSize = Math.round(size * coverScale);

  return (
    <View
      style={[
        styles.circularCrop,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Image
        source={source}
        style={{ width: scaledSize, height: scaledSize }}
        resizeMode="cover"
      />
    </View>
  );
}

function CarouselCardContent({
  slide,
  emblemSize,
  iconSize,
  logoSize,
}: {
  slide: OnboardingSlide;
  emblemSize: number;
  iconSize: number;
  logoSize: number;
}) {
  if (slide.showLogo) {
    return (
      <Image
        source={require("@/assets/images/pillapp-logo.png")}
        style={{ width: logoSize, height: logoSize }}
        resizeMode="contain"
        accessibilityLabel="Logo PillApp"
      />
    );
  }

  if (slide.image) {
    return (
      <EmblemCoverImage
        source={slide.image}
        size={emblemSize}
        coverScale={slide.imageCoverScale}
      />
    );
  }

  return (
    <MaterialCommunityIcons
      name={slide.icon}
      size={iconSize}
      color={slide.iconColor}
    />
  );
}

function CarouselCard({
  slide,
  index,
  scrollX,
  slideWidth,
  layout,
  slideOffset,
  iconSize,
  logoSize,
}: CarouselCardProps) {
  const { emblemSize, emblemCenterY } = layout;
  const baseTop = emblemCenterY - emblemSize / 2;

  const animatedStyle = useAnimatedStyle(() => {
    const focusDistance = Math.abs(index * slideWidth - scrollX.value);
    const rel = focusDistance / slideWidth;

    return {
      position: "absolute",
      left: index * slideOffset,
      top: baseTop,
      opacity: interpolate(rel, [0, 1.05, 1.45], [1, 1, 0], Extrapolation.CLAMP),
      transform: [
        {
          scale: interpolate(rel, [0, 1], [1, 0.94], Extrapolation.CLAMP),
        },
      ],
      zIndex: Math.round(1000 - focusDistance),
    };
  });

  return (
    <Animated.View
      style={animatedStyle}
      collapsable={false}
      pointerEvents="none"
      accessibilityLabel={`Illustrazione: ${slide.title}`}
    >
      <HeroEmblemFrame size={emblemSize}>
        <CarouselCardContent
          slide={slide}
          emblemSize={emblemSize}
          iconSize={iconSize}
          logoSize={logoSize}
        />
      </HeroEmblemFrame>
    </Animated.View>
  );
}

export function OnboardingArcCarousel({
  scrollX,
  slideWidth,
  slides = onboardingSlides,
  emblemSize = onboardingHeroEmblemLayout.size,
}: OnboardingArcCarouselProps) {
  const layout = useMemo(
    () => getOnboardingArcLayout(slideWidth, emblemSize),
    [emblemSize, slideWidth],
  );
  const iconSize = Math.round(emblemSize * 0.48);
  const logoSize = onboardingHeroEmblemLayout.logoSize;
  const slideOffset = useMemo(() => {
    const peekWidth = onboardingHeroEmblemLayout.carouselPeekWidth;
    return slideWidth / 2 + emblemSize / 2 - peekWidth;
  }, [emblemSize, slideWidth]);

  const trackStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX:
          layout.ellipseCx -
          emblemSize / 2 -
          (scrollX.value / slideWidth) * slideOffset,
      },
    ],
  }));

  return (
    <View style={[styles.stage, { width: layout.fullWidth, height: layout.carouselStageHeight }]}>
      <Animated.View style={[styles.track, trackStyle]} collapsable={false}>
        {slides.map((slide, index) => (
          <CarouselCard
            key={slide.id}
            slide={slide}
            index={index}
            scrollX={scrollX}
            slideWidth={slideWidth}
            layout={layout}
            slideOffset={slideOffset}
            iconSize={iconSize}
            logoSize={logoSize}
          />
        ))}
      </Animated.View>
    </View>
  );
}

export { getOnboardingArcLayout };

const styles = StyleSheet.create({
  stage: {
    overflow: "visible",
  },
  track: {
    overflow: "visible",
  },
  circularCrop: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
});
