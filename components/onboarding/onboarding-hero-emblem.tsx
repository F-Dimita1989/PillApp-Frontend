import { MaterialCommunityIcons } from "@expo/vector-icons";
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
import { introHeroEmblemLayout, onboardingHeroEmblemLayout } from "@/components/ui/intro-hero-arc";

type OnboardingHeroEmblemProps = {
  scrollX: SharedValue<number>;
  width: number;
  emblemSize?: number;
};

type AnimatedSlideIconProps = {
  slide: OnboardingSlide;
  index: number;
  width: number;
  scrollX: SharedValue<number>;
  iconSize: number;
  emblemSize: number;
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

function AnimatedSlideIcon({
  slide,
  index,
  width,
  scrollX,
  iconSize,
  emblemSize,
}: AnimatedSlideIconProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [0, 1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <Animated.View
      style={[styles.layer, animatedStyle]}
      pointerEvents="none"
      accessibilityElementsHidden={!slide.image}
      importantForAccessibility={slide.image ? "yes" : "no-hide-descendants"}
      accessibilityLabel={slide.image ? `Illustrazione: ${slide.title}` : undefined}
    >
      {slide.image ? (
        <EmblemCoverImage
          source={slide.image}
          size={emblemSize}
          coverScale={slide.imageCoverScale}
        />
      ) : (
        <MaterialCommunityIcons
          name={slide.icon}
          size={iconSize}
          color={slide.iconColor}
        />
      )}
    </Animated.View>
  );
}

export function OnboardingHeroEmblem({
  scrollX,
  width,
  emblemSize = introHeroEmblemLayout.size,
}: OnboardingHeroEmblemProps) {
  const logoSize = onboardingHeroEmblemLayout.logoSize;
  const iconSize = Math.round(emblemSize * 0.48);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, [0, width], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <View style={styles.stack}>
      <Animated.View
        style={[styles.layer, logoStyle]}
        accessibilityLabel="Logo PillApp"
      >
        <Image
          source={require("@/assets/images/pillapp-logo.png")}
          style={{ width: logoSize, height: logoSize }}
          resizeMode="contain"
        />
      </Animated.View>

      {onboardingSlides.map((slide, index) =>
        index === 0 ? null : (
          <AnimatedSlideIcon
            key={slide.id}
            slide={slide}
            index={index}
            width={width}
            scrollX={scrollX}
            iconSize={iconSize}
            emblemSize={emblemSize}
          />
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  circularCrop: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
});
