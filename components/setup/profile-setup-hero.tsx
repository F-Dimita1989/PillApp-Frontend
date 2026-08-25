import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "react-native";

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
  /** Se false, mostra solo cupola e emblem (il titolo resta nel contenuto). */
  showCopy?: boolean;
};

export function ProfileSetupHero({
  meta,
  subtitle,
  showLogo = false,
  hideSubtitle = false,
  showCopy = true,
}: ProfileSetupHeroProps) {
  const intro = onboardingIntroHeroLayout;

  return (
    <IntroHeroArc
      eyebrow={meta.eyebrow}
      title={meta.title}
      subtitle={hideSubtitle ? undefined : (subtitle ?? meta.subtitle)}
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
