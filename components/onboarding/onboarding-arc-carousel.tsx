import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import type { ImageSourcePropType } from "react-native";
import { Image, StyleSheet, View } from "react-native";
import Animated, {
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
  slideWidth: number;
  layout: OnboardingArcLayout;
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
  slideWidth,
  layout,
  iconSize,
  logoSize,
}: CarouselCardProps) {
  const { emblemSize, emblemCenterY } = layout;
  const baseTop = emblemCenterY - emblemSize / 2;

  return (
    <View
      style={{
        position: "absolute",
        left: index * slideWidth,
        top: baseTop,
      }}
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
    </View>
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

  const trackStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: layout.ellipseCx - emblemSize / 2 - scrollX.value,
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
            slideWidth={slideWidth}
            layout={layout}
            iconSize={iconSize}
            logoSize={logoSize}
          />
        ))}
      </Animated.View>
    </View>
  );
}

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
