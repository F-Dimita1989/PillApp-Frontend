import {
  CoachmarkErrorBoundary,
  AnimatedMask,
  useCoachmarkContext,
  useOrientationChange,
  useTourMeasurement,
  isReduceMotionEnabled,
} from "@edwardloopez/react-native-coachmark";
import type { SpotlightShape, TooltipRenderProps, TourStep } from "@edwardloopez/react-native-coachmark";
import { useCallback, useEffect, useMemo, useState, memo, Fragment } from "react";
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
} from "react-native";
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AIC_TOUR_ANCHORS } from "@/constants/aic-scanner-tour";
import { pillappCoachmarkSpotlight } from "@/constants/coachmark-theme";
import { layout, spacing } from "@/constants/spacing";

type CustomTooltipWrapperProps = {
  renderer: ((props: TooltipRenderProps) => React.ReactElement) | undefined;
  props: TooltipRenderProps;
};

const CustomTooltipWrapper = memo(function CustomTooltipWrapper({
  renderer,
  props,
}: CustomTooltipWrapperProps) {
  if (renderer) {
    return <Fragment>{renderer(props)}</Fragment>;
  }
  return null;
});

function resolveNextOnBackdropPress(
  step: TourStep | undefined,
  tour: { nextOnBackdropPress?: boolean } | null | undefined,
) {
  return step?.nextOnBackdropPress ?? tour?.nextOnBackdropPress ?? true;
}

function spotlightBorderRadius(
  shape: SpotlightShape,
  width: number,
  height: number,
  radius: number,
) {
  "worklet";
  if (shape === "circle") {
    return Math.max(width, height) / 2;
  }
  if (shape === "pill") {
    return Math.min(width, height) / 2;
  }
  return Math.min(radius, Math.min(width, height) / 2);
}

type SpotlightRingProps = {
  holeX: SharedValue<number>;
  holeY: SharedValue<number>;
  holeWidth: SharedValue<number>;
  holeHeight: SharedValue<number>;
  holeShape: SpotlightShape;
  holeRadius: number;
  overlayOpacity: SharedValue<number>;
};

function SpotlightRing({
  holeX,
  holeY,
  holeWidth,
  holeHeight,
  holeShape,
  holeRadius,
  overlayOpacity,
}: SpotlightRingProps) {
  const { ringColor, ringWidth, ringPadding, ringShadowColor, ringShadowOpacity, ringShadowRadius } =
    pillappCoachmarkSpotlight;

  const ringStyle = useAnimatedStyle(() => {
    "worklet";
    const w = holeWidth.value;
    const h = holeHeight.value;
    const pad = ringPadding;
    const borderRadius = spotlightBorderRadius(holeShape, w, h, holeRadius);

    return {
      position: "absolute" as const,
      left: holeX.value - pad,
      top: holeY.value - pad,
      width: w + pad * 2,
      height: h + pad * 2,
      borderRadius,
      borderWidth: ringWidth,
      borderColor: ringColor,
      opacity: overlayOpacity.value,
      shadowColor: ringShadowColor,
      shadowOpacity: ringShadowOpacity,
      shadowRadius: ringShadowRadius,
      shadowOffset: { width: 0, height: 0 },
      elevation: 10,
    };
  });

  return <Animated.View style={ringStyle} pointerEvents="none" />;
}

/**
 * Overlay tour con maschera scura e alone blu sull'elemento attivo.
 */
export function AicTourOverlay() {
  const { state, getAnchor, setMeasured, next, back, stop, theme } =
    useCoachmarkContext();
  const insets = useSafeAreaInsets();
  const [reduceMotion, setReduceMotion] = useState(false);
  const opacity = useSharedValue(0);
  const holeX = useSharedValue(0);
  const holeY = useSharedValue(0);
  const holeWidth = useSharedValue(1);
  const holeHeight = useSharedValue(1);

  const { width: W, height: H } =
    Platform.OS === "android"
      ? Dimensions.get("screen")
      : Dimensions.get("window");

  const activeStep = state.activeTour?.steps[state.index];

  useEffect(() => {
    isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    const duration = reduceMotion ? 0 : theme.motion.durationMs;
    opacity.value = withTiming(state.isActive ? 1 : 0, { duration });
  }, [opacity, state.isActive, theme.motion.durationMs, reduceMotion]);

  const { targetRect, holeShape, holeRadius, remeasure } = useTourMeasurement({
    activeStep,
    index: state.index,
    tourKey: state.activeTour?.key,
    getAnchor,
    setMeasured,
    next,
    reduceMotion,
    durationMs: theme.motion.durationMs,
    holeX,
    holeY,
    holeWidth,
    holeHeight,
  });

  const handleOrientationChange = useCallback(() => {
    remeasure();
  }, [remeasure]);

  useOrientationChange(state.isActive, handleOrientationChange);

  // Dopo lo scroll manuale sul passo 4, riallinea il buco senza rilanciare autoFocus.
  useEffect(() => {
    if (
      !state.isActive ||
      activeStep?.id !== AIC_TOUR_ANCHORS.resultCard
    ) {
      return;
    }

    const timer = setTimeout(() => {
      void remeasure();
    }, 700);

    return () => clearTimeout(timer);
  }, [state.isActive, state.index, activeStep?.id, remeasure]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleSkip = useCallback(() => stop("skipped"), [stop]);

  const tooltipRenderProps = useMemo((): TooltipRenderProps | null => {
    if (!activeStep || !state.activeTour) return null;
    return {
      theme,
      title: activeStep.title,
      description: activeStep.description,
      index: state.index,
      count: state.activeTour.steps.length,
      isFirst: state.index === 0,
      isLast: state.index === state.activeTour.steps.length - 1,
      onNext: next,
      onBack: back,
      onSkip: handleSkip,
      currentStep: activeStep,
    };
  }, [theme, activeStep, state.index, state.activeTour, next, back, handleSkip]);

  if (!state.isActive || !activeStep || !tooltipRenderProps) return null;

  const customRenderer =
    activeStep.renderTooltip || state.activeTour?.renderTooltip;
  const nextOnBackdropPress = resolveNextOnBackdropPress(
    activeStep,
    state.activeTour ?? undefined,
  );

  return (
    <Modal
      transparent
      visible
      animationType="none"
      statusBarTranslucent={Platform.OS === "android"}
    >
      <Animated.View style={[StyleSheet.absoluteFill, overlayStyle]}>
        <AnimatedMask
          width={W}
          height={H}
          holes={[
            {
              x: holeX,
              y: holeY,
              width: holeWidth,
              height: holeHeight,
              shape: holeShape,
              radius: holeRadius,
            },
          ]}
          backdropColor={theme.backdropColor}
          backdropOpacity={theme.backdropOpacity}
        />

        <SpotlightRing
          holeX={holeX}
          holeY={holeY}
          holeWidth={holeWidth}
          holeHeight={holeHeight}
          holeShape={holeShape}
          holeRadius={holeRadius}
          overlayOpacity={opacity}
        />

        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={nextOnBackdropPress ? next : undefined}
        />

        <Animated.View
          style={[
            styles.tooltipContainer,
            {
              left: layout.screenPaddingHorizontal,
              right: layout.screenPaddingHorizontal,
              bottom: insets.bottom + spacing.sm,
            },
          ]}
        >
          <CoachmarkErrorBoundary
            onError={(error) => {
              console.error("[Coachmark] Custom tooltip error:", error);
            }}
            onReset={next}
          >
            <CustomTooltipWrapper
              renderer={customRenderer}
              props={tooltipRenderProps}
            />
          </CoachmarkErrorBoundary>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  tooltipContainer: {
    position: "absolute",
  },
});
