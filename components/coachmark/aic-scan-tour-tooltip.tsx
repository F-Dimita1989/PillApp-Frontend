import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import { XStack, YStack } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AicScanExampleImage } from "@/components/farmaci/aic-scan-example-image";
import {
  AppButton,
  AppProgress,
  AppText,
  PrimaryButton,
} from "@/components/ui";
import { layout, spacing } from "@/constants/spacing";
import { AIC_TOUR_ANCHORS } from "@/constants/aic-scanner-tour";
import type { TooltipRenderProps } from "@edwardloopez/react-native-coachmark";

type AicScanTourTooltipProps = TooltipRenderProps & {
  onTourCompleted: () => void;
  onTourSkipped: () => void;
};

export function AicScanTourTooltip({
  title,
  description,
  index,
  count,
  isFirst,
  isLast,
  onNext,
  onBack,
  onSkip,
  onTourCompleted,
  onTourSkipped,
  currentStep,
}: AicScanTourTooltipProps) {
  const insets = useSafeAreaInsets();
  const { height: screenH, width: screenW } = useWindowDimensions();
  const anchorRef = useRef<View>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const progress = (index + 1) / count;
  const tooltipWidth = screenW - layout.screenPaddingHorizontal * 2;
  const isFramingStep = currentStep.id === AIC_TOUR_ANCHORS.framingBox;

  const pinToBottom = useCallback(() => {
    anchorRef.current?.measureInWindow((x, y, _w, h) => {
      setOffset({
        x: layout.screenPaddingHorizontal - x,
        y: screenH - insets.bottom - spacing.sm - h - y,
      });
    });
  }, [insets.bottom, screenH]);

  useLayoutEffect(() => {
    pinToBottom();
  }, [pinToBottom, index, title, description]);

  const handleNext = () => {
    if (isLast) {
      onTourCompleted();
    }
    onNext();
  };

  const handleSkip = () => {
    onTourSkipped();
    onSkip();
  };

  return (
    <View
      ref={anchorRef}
      style={{
        alignSelf: "flex-start",
        width: tooltipWidth,
        transform: [{ translateX: offset.x }, { translateY: offset.y }],
      }}
      onLayout={pinToBottom}
    >
      <YStack
        backgroundColor="$surface"
        borderColor="$border"
        borderWidth={1}
        borderRadius="$4"
        padding="$4"
        gap="$2"
        shadowColor="$shadow"
        shadowOpacity={0.12}
        shadowRadius={16}
        shadowOffset={{ width: 0, height: 4 }}
        elevation={5}
        accessibilityRole="alert"
        accessibilityLabel={`Guida passo ${index + 1} di ${count}. ${title ?? ""}. ${description ?? ""}`}
      >
        <AppText variant="label" color="primary">
          Passo {index + 1} di {count}
        </AppText>

        <AppProgress progress={progress} />

        {title ? (
          <AppText variant="label" fontWeight="700">
            {title}
          </AppText>
        ) : null}

        {description ? (
          <AppText variant="caption" muted>
            {description}
          </AppText>
        ) : null}

        {isFramingStep ? (
          <YStack alignItems="center" marginTop="$1">
            <AicScanExampleImage size="compact" />
          </YStack>
        ) : null}

        <YStack gap="$2" marginTop="$1">
          <PrimaryButton
            onPress={handleNext}
            fullWidth
            accessibilityLabel={isLast ? "Fine guida" : "Passo successivo"}
          >
            {isLast ? "Fine guida" : "Avanti"}
          </PrimaryButton>

          <XStack justifyContent="center" alignItems="center" gap="$4">
            {!isFirst ? (
              <AppButton variant="ghost" size="md" onPress={onBack}>
                Indietro
              </AppButton>
            ) : null}
            <AppButton variant="ghost" size="md" onPress={handleSkip}>
              Salta guida
            </AppButton>
          </XStack>
        </YStack>
      </YStack>
    </View>
  );
}
