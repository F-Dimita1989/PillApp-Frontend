import {
  CoachmarkErrorBoundary,
  AnimatedMask,
  useCoachmarkContext,
  useOrientationChange,
  useTourMeasurement,
  isReduceMotionEnabled,
} from "@edwardloopez/react-native-coachmark";
import type { Placement, SpotlightShape, TooltipRenderProps, TourStep } from "@edwardloopez/react-native-coachmark";
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

import { pillappCoachmarkSpotlight } from "@/constants/coachmark-theme";

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

function useTourTooltipPosition({
  targetRect,
  tooltipSize,
  activeStep,
}: {
  targetRect: { x: number; y: number; width: number; height: number } | null;
  tooltipSize: { width: number; height: number } | null;
  activeStep: TourStep | undefined;
}) {
  const [tooltipPos, setTooltipPos] = useState({ x: -9999, y: -9999 });
  const { width: W, height: H } = Dimensions.get("window");

  useEffect(() => {
    if (!targetRect || !tooltipSize || !activeStep) return;
    const placement = activeStep.placement ?? "auto";
    const pos = computeTooltipPosition(
      W,
      H,
      targetRect,
      placement,
      { w: tooltipSize.width, h: tooltipSize.height },
      20,
    );
    setTooltipPos({ x: pos.x, y: pos.y });
  }, [targetRect, tooltipSize, W, H, activeStep]);

  return tooltipPos;
}

function computeTooltipPosition(
  screenW: number,
  screenH: number,
  target: { x: number; y: number; width: number; height: number },
  placement: Placement,
  tooltipSize: { w: number; h: number },
  gap = 12,
) {
  const cx = target.x + target.width / 2;
  const cy = target.y + target.height / 2;
  const pref =
    placement === "auto"
      ? (["bottom", "top", "right", "left"] as const)
      : ([placement] as const);

  for (const p of pref) {
    if (p === "bottom" && target.y + target.height + gap + tooltipSize.h <= screenH) {
      return {
        x: Math.min(Math.max(cx - tooltipSize.w / 2, 12), screenW - tooltipSize.w - 12),
        y: target.y + target.height + gap,
        placement: "bottom" as const,
      };
    }
    if (p === "top" && target.y - gap - tooltipSize.h >= 0) {
      return {
        x: Math.min(Math.max(cx - tooltipSize.w / 2, 12), screenW - tooltipSize.w - 12),
        y: Math.max(target.y - gap - tooltipSize.h, 12),
        placement: "top" as const,
      };
    }
    if (p === "right" && target.x + target.width + gap + tooltipSize.w <= screenW) {
      return {
        x: target.x + target.width + gap,
        y: Math.min(Math.max(cy - tooltipSize.h / 2, 12), screenH - tooltipSize.h - 12),
        placement: "right" as const,
      };
    }
    if (p === "left" && target.x - gap - tooltipSize.w >= 0) {
      return {
        x: target.x - gap - tooltipSize.w,
        y: Math.min(Math.max(cy - tooltipSize.h / 2, 12), screenH - tooltipSize.h - 12),
        placement: "left" as const,
      };
    }
  }

  return {
    x: Math.min(Math.max(cx - tooltipSize.w / 2, 12), screenW - tooltipSize.w - 12),
    y: Math.min(target.y + target.height + gap, screenH - tooltipSize.h - 12),
    placement: "bottom" as const,
  };
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
  const [tooltipSize, setTooltipSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
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

  const tooltipPos = useTourTooltipPosition({
    targetRect,
    tooltipSize,
    activeStep,
  });

  const handleOrientationChange = useCallback(() => {
    remeasure();
  }, [remeasure]);

  useOrientationChange(state.isActive, handleOrientationChange);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleTooltipLayout = useCallback(
    (e: { nativeEvent: { layout: { width: number; height: number } } }) => {
      const { width, height } = e.nativeEvent.layout;
      setTooltipSize({ width, height });
    },
    [],
  );

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
            { left: tooltipPos.x, top: tooltipPos.y },
          ]}
          onLayout={handleTooltipLayout}
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
