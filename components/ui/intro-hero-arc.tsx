import type { ReactNode } from "react";
import { Image, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Defs,
  Ellipse,
  G,
  Stop,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";
import { YStack } from "tamagui";

import { AppText } from "@/components/ui/app-text";
import { pillappColors, pillappLayout, pillappShadows } from "@/theme/tokens";

export const introHeroEmblemLayout = {
  size: 144,
  logoSize: 102,
  lift: 4,
  shiftUp: 44,
  /** Raggio orizzontale ellisse cupola (frazione larghezza schermo) */
  arcEllipseRxRatio: 0.6,
  /** Raggio verticale ellisse cupola */
  arcEllipseRyRatio: 0.58,
} as const;

/** Cerchio hero più ampio per l'onboarding (illustrazioni e icone) */
export const onboardingHeroEmblemLayout = {
  size: 220,
  /** Logo prima slide: più grande del cerchio, senza ingrandire il cerchio */
  logoSize: 208,
  /** Pixel visibili del cerchio adiacente (solo la punta) */
  carouselPeekWidth: 3,
  /** Solleva l'area del carosello rispetto all'arco */
  carouselRaiseUp: 36,
} as const;

export type OnboardingArcLayout = {
  fullWidth: number;
  arcHeight: number;
  heroShiftUp: number;
  ellipseRx: number;
  ellipseRy: number;
  ellipseCx: number;
  emblemCenterY: number;
  emblemSize: number;
  carouselStageHeight: number;
  emblemLift: number;
  emblemOverlap: number;
};

export function getOnboardingArcLayout(
  screenWidth: number,
  emblemSize: number,
  arcHeight = 300,
  parentPaddingX = 0,
): OnboardingArcLayout {
  const fullWidth = screenWidth + parentPaddingX * 2;
  const heroShiftUp = introHeroEmblemLayout.shiftUp;
  const emblemLift = introHeroEmblemLayout.lift;
  const emblemOverlap = emblemSize / 2;
  const ellipseRx = fullWidth * introHeroEmblemLayout.arcEllipseRxRatio;
  const ellipseRy = fullWidth * introHeroEmblemLayout.arcEllipseRyRatio;
  const ellipseCx = fullWidth / 2;
  /** Bordo arco = centro cerchio: metà dentro l'ellisse, metà fuori */
  const emblemCenterY = emblemOverlap + emblemLift;
  const carouselStageHeight = emblemCenterY + emblemSize / 2;

  return {
    fullWidth,
    arcHeight,
    heroShiftUp,
    ellipseRx,
    ellipseRy,
    ellipseCx,
    emblemCenterY,
    emblemSize,
    carouselStageHeight,
    emblemLift,
    emblemOverlap,
  };
}

/** Altezza riservata in cima a ogni pagina per l'hero sovrapposto. */
export function getOnboardingHeroZoneHeight(
  screenWidth: number,
  emblemSize: number,
  insetTop: number,
): number {
  const layout = getOnboardingArcLayout(screenWidth, emblemSize);
  const arcBottom =
    insetTop +
    layout.arcHeight -
    layout.heroShiftUp -
    onboardingHeroEmblemLayout.carouselRaiseUp;
  /** Bordo arco al centro cerchio + metà cerchio sotto l'arco + piccolo respiro */
  return arcBottom + layout.emblemSize / 2 + 12;
}

function emblemLogoSize(emblemSize: number): number {
  return Math.round(
    introHeroEmblemLayout.logoSize * (emblemSize / introHeroEmblemLayout.size),
  );
}

type HeroEmblemFrameProps = {
  children: ReactNode;
  size?: number;
};

export function HeroEmblemFrame({
  children,
  size = introHeroEmblemLayout.size,
}: HeroEmblemFrameProps) {
  return (
    <View
      style={[
        styles.emblem,
        pillappShadows.md,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      {children}
    </View>
  );
}

type IntroHeroArcProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  showLogo?: boolean;
  emblem?: ReactNode;
  /** Mostra titolo/sottotitolo sotto il logo (default: true) */
  showCopy?: boolean;
  /** Altezza visibile della cupola */
  arcHeight?: number;
  /** Compensa il padding orizzontale del genitore (es. 16 dentro AppScreen) */
  parentPaddingX?: number;
  /** Diametro del cerchio emblem (default: introHeroEmblemLayout.size) */
  emblemSize?: number;
  /** `carousel`: card assolute sull'arco; `framed`: singolo cerchio centrato */
  emblemVariant?: "framed" | "carousel";
  carouselStageHeight?: number;
};

export function IntroHeroArc({
  title,
  subtitle,
  eyebrow,
  showLogo = true,
  emblem,
  showCopy = true,
  arcHeight = 300,
  parentPaddingX = 0,
  emblemSize: emblemSizeProp,
  emblemVariant = "framed",
  carouselStageHeight: carouselStageHeightProp,
}: IntroHeroArcProps) {
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const gradientId = "pillappIntroArcGradient";

  const emblemSize = emblemSizeProp ?? introHeroEmblemLayout.size;
  const logoSize = emblemSizeProp
    ? emblemLogoSize(emblemSize)
    : introHeroEmblemLayout.logoSize;
  /** Sposta cupola e logo verso l'alto */
  const heroShiftUp = introHeroEmblemLayout.shiftUp;
  /** Sollevamento extra del logo rispetto al bordo arco */
  const emblemLift = introHeroEmblemLayout.lift;
  /** Metà logo dentro l'arco, metà fuori — bordo arco al centro del cerchio */
  const emblemOverlap = emblemSize / 2;

  // Larghezza reale edge-to-edge (compensa padding genitore)
  const fullWidth = screenWidth + parentPaddingX * 2;
  const carouselStageHeight =
    carouselStageHeightProp ?? emblemOverlap + emblemLift + emblemSize / 2;
  const bleedOffset = -parentPaddingX;

  // Ellisse: il bordo inferiore della cupola coincide con il centro del logo.
  // Con flip Y, cy = ry posiziona il punto (cx, 0) dell'ellisse su y = arcHeight.
  const ellipseRx = fullWidth * introHeroEmblemLayout.arcEllipseRxRatio;
  const ellipseRy = fullWidth * introHeroEmblemLayout.arcEllipseRyRatio;
  const ellipseCx = fullWidth / 2;
  const ellipseCy = ellipseRy;

  // Capovolge la cupola sull'asse Y (curva verso l'alto)
  const arcFlipTransform = `translate(0 ${arcHeight}) scale(1 -1)`;

  return (
    <YStack
      width={fullWidth}
      marginLeft={bleedOffset}
      marginRight={bleedOffset}
      marginTop={-insets.top}
      paddingTop={insets.top}
      alignItems="center"
      accessibilityRole="header"
    >
      <View
        style={[
          styles.arcClip,
          { width: fullWidth, height: arcHeight, marginTop: -heroShiftUp },
        ]}
      >
        <Svg
          width={fullWidth}
          height={arcHeight}
          style={StyleSheet.absoluteFill}
        >
          <Defs>
            <SvgLinearGradient
              id={gradientId}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <Stop offset="0%" stopColor={pillappColors.secondary} />
              <Stop offset="35%" stopColor="#4EC4B5" />
              <Stop offset="70%" stopColor={pillappColors.primary} />
              <Stop offset="100%" stopColor={pillappColors.primaryDark} />
            </SvgLinearGradient>
          </Defs>
          <G transform={arcFlipTransform}>
            <Ellipse
              cx={ellipseCx}
              cy={ellipseCy}
              rx={ellipseRx}
              ry={ellipseRy}
              fill={`url(#${gradientId})`}
            />
          </G>
        </Svg>
      </View>

      <View
        style={[
          emblemVariant === "carousel"
            ? styles.carouselStage
            : styles.emblemWrap,
          emblemVariant === "carousel"
            ? {
                width: fullWidth,
                height: carouselStageHeight,
                marginTop: -(
                  emblemOverlap +
                  emblemLift +
                  onboardingHeroEmblemLayout.carouselRaiseUp
                ),
              }
            : { marginTop: -(emblemOverlap + emblemLift) },
        ]}
      >
        {emblemVariant === "carousel" ? (
          emblem
        ) : (
          <HeroEmblemFrame size={emblemSize}>
            {emblem ? (
              emblem
            ) : showLogo ? (
              <Image
                source={require("@/assets/images/pillapp-logo.png")}
                style={{ width: logoSize, height: logoSize }}
                resizeMode="contain"
                accessibilityLabel="Logo PillApp"
              />
            ) : null}
          </HeroEmblemFrame>
        )}
      </View>

      {showCopy ? (
        <YStack
          width="100%"
          paddingHorizontal={pillappLayout.screenPaddingX}
          paddingTop="$3"
          gap="$2"
          alignItems="center"
        >
          {eyebrow ? (
            <AppText variant="overline" color="primary">
              {eyebrow}
            </AppText>
          ) : null}
          <AppText variant="headline" textAlign="center" color="primary">
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant="body" muted textAlign="center" maxWidth={340}>
              {subtitle}
            </AppText>
          ) : null}
        </YStack>
      ) : null}
    </YStack>
  );
}

const styles = StyleSheet.create({
  arcClip: {
    overflow: "hidden",
  },
  emblemWrap: {
    zIndex: 2,
    alignItems: "center",
  },
  carouselStage: {
    zIndex: 2,
    overflow: "visible",
  },
  emblem: {
    backgroundColor: pillappColors.surface,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
