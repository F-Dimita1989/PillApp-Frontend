import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, StyleSheet, View } from "react-native";

import {
  IntroHeroArc,
  introHeroEmblemLayout,
  onboardingHeroEmblemLayout,
  onboardingIntroHeroLayout,
} from "@/components/ui/intro-hero-arc";
import type { ProfileSetupStepMeta } from "@/constants/profile-setup-steps";
import { pillappColors } from "@/theme/tokens";

const PROFILE_STEP_ICON_SIZE = Math.round(
  56 * (onboardingHeroEmblemLayout.size / introHeroEmblemLayout.size),
);

type ProfileSetupHeroProps = {
  meta: ProfileSetupStepMeta;
  subtitle?: string;
  showLogo?: boolean;
  hideSubtitle?: boolean;
  hideTitle?: boolean;
  /** Se false, mostra solo cupola e emblem (il titolo resta nel contenuto). */
  showCopy?: boolean;
};

export function ProfileSetupHero({
  meta,
  subtitle,
  showLogo = false,
  hideSubtitle = false,
  hideTitle = false,
  showCopy = true,
}: ProfileSetupHeroProps) {
  const intro = onboardingIntroHeroLayout;
  const coverScale = meta.imageCoverScale ?? 1;
  const imageSize = Math.round(intro.emblemSize * coverScale);

  return (
    <IntroHeroArc
      eyebrow={meta.eyebrow}
      title={hideTitle ? "" : meta.title}
      subtitle={hideSubtitle || hideTitle ? undefined : (subtitle ?? meta.subtitle)}
      showLogo={false}
      showCopy={showCopy}
      parentPaddingX={intro.parentPaddingX}
      arcHeight={intro.arcHeight}
      emblemSize={intro.emblemSize}
      emblemRaiseExtra={intro.emblemRaiseExtra}
      extendIntoStatusBar
      emblem={
        showLogo ? (
          <Image
            source={require("@/assets/images/pillapp-logo.png")}
            style={{
              width: intro.logoSize,
              height: intro.logoSize,
            }}
            resizeMode="contain"
            accessibilityLabel="Logo PillApp"
          />
        ) : meta.image ? (
          <View
            style={[
              styles.circularCrop,
              {
                width: intro.emblemSize,
                height: intro.emblemSize,
                borderRadius: intro.emblemSize / 2,
              },
            ]}
          >
            <Image
              source={meta.image}
              style={{ width: imageSize, height: imageSize }}
              resizeMode="cover"
            />
          </View>
        ) : (
          <MaterialCommunityIcons
            name={meta.icon}
            size={PROFILE_STEP_ICON_SIZE}
            color={pillappColors.secondary}
          />
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  circularCrop: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
});
