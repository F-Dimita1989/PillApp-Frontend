import { ScrollView, useWindowDimensions } from "react-native";
import { YStack } from "tamagui";

import { AppText } from "@/components/ui/app-text";
import type { OnboardingSlide } from "@/constants/onboarding-slides";
import { pillappLayout } from "@/theme/tokens";

type OnboardingSlideViewProps = {
  slide: OnboardingSlide;
  width: number;
};

export function OnboardingSlideView({ slide, width }: OnboardingSlideViewProps) {
  const { height } = useWindowDimensions();
  const compact = height < 720;

  return (
    <ScrollView
      style={{ flex: 1, width }}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        paddingVertical: 16,
        paddingBottom: 24,
      }}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <YStack
        paddingHorizontal={pillappLayout.screenPaddingX}
        gap="$5"
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

        <YStack width="100%" gap="$3" paddingHorizontal="$2">
          <AppText variant={compact ? "title" : "headline"} textAlign="center">
            {slide.title}
          </AppText>
          <AppText variant="body" muted textAlign="center">
            {slide.subtitle}
          </AppText>
        </YStack>
      </YStack>
    </ScrollView>
  );
}
