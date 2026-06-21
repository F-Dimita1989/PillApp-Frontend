import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, ScrollView, View, useWindowDimensions } from "react-native";
import { YStack } from "tamagui";

import { AppText } from "@/components/ui/app-text";
import type { OnboardingSlide } from "@/constants/onboarding-slides";
import { layout, radii, spacing } from "@/constants/spacing";
import { pillappColors } from "@/theme/tokens";

type OnboardingSlideViewProps = {
  slide: OnboardingSlide;
  width: number;
};

export function OnboardingSlideView({ slide, width }: OnboardingSlideViewProps) {
  const { height } = useWindowDimensions();
  const compact = height < 720;
  const iconSize = compact ? 64 : 80;
  const logoSize = compact ? 256 : 320;

  return (
    <ScrollView
      style={{ flex: 1, width }}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        paddingVertical: spacing.md,
      }}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <View
        style={{
          paddingHorizontal: layout.screenPaddingHorizontal,
          gap: spacing.xl,
        }}
        accessibilityRole="summary"
      >
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.md,
            minHeight: 320,
          }}
        >
          {slide.badge ? (
            <View
              style={{
                borderRadius: radii.sm,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xxs,
                backgroundColor: pillappColors.primary,
              }}
            >
              <AppText variant="caption" color="inverse" fontWeight="700">
                {slide.badge}
              </AppText>
            </View>
          ) : null}

          {slide.showLogo ? (
            <Image
              source={require("@/assets/images/pillapp-logo.png")}
              style={{ width: logoSize, height: logoSize }}
              resizeMode="contain"
              accessibilityRole="image"
              accessibilityLabel="Logo PillApp"
            />
          ) : (
            <MaterialCommunityIcons name={slide.icon} size={iconSize} color={slide.iconColor} />
          )}
        </View>

        <YStack width="100%" gap="$3" paddingHorizontal="$2">
          <AppText variant={compact ? "title" : "headline"} textAlign="center">
            {slide.title}
          </AppText>
          <AppText variant="body" muted textAlign="center">
            {slide.subtitle}
          </AppText>
        </YStack>
      </View>
    </ScrollView>
  );
}
