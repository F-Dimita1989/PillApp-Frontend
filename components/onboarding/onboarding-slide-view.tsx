import { Platform, ScrollView, useWindowDimensions } from "react-native";
import { YStack } from "tamagui";

import { AppText } from "@/components/ui/app-text";
import type { OnboardingSlide } from "@/constants/onboarding-slides";
import { pillappLayout } from "@/theme/tokens";

type OnboardingSlideViewProps = {
  slide: OnboardingSlide;
  width: number;
  bottomInset?: number;
};

export function OnboardingSlideView({
  slide,
  width,
  bottomInset = 0,
}: OnboardingSlideViewProps) {
  const { height } = useWindowDimensions();
  const compact = height < 720;

  return (
    <ScrollView
      style={{ flex: 1, width }}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "flex-start",
        paddingTop: 12,
        paddingBottom: Math.max(24, bottomInset),
      }}
      showsVerticalScrollIndicator={false}
      bounces={false}
      nestedScrollEnabled={Platform.OS === "android"}
      keyboardShouldPersistTaps="handled"
    >
      <YStack
        paddingHorizontal={pillappLayout.screenPaddingX}
        gap="$4"
        accessibilityRole="summary"
      >
        {slide.badge ? (
          <YStack alignItems="center">
            <YStack
              borderRadius="$1"
              paddingHorizontal="$3"
              paddingVertical="$1"
              backgroundColor="$primary"
            >
              <AppText variant="caption" color="inverse" fontWeight="700">
                {slide.badge}
              </AppText>
            </YStack>
          </YStack>
        ) : null}

        <YStack width="100%" gap="$3">
          <AppText
            variant={compact ? "title" : "headline"}
            color="primary"
            textAlign="center"
          >
            {slide.title}
          </AppText>
          <AppText variant="body" color="primary" textAlign="center">
            {slide.subtitle}
          </AppText>
        </YStack>
      </YStack>
    </ScrollView>
  );
}
