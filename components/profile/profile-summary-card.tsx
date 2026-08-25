import { MaterialCommunityIcons } from "@expo/vector-icons";
import { XStack, YStack } from "tamagui";

import { AppCard, AppText } from "@/components/ui";
import { GUEST_SEX_OPTIONS } from "@/constants/profile";
import { getProfileAvatar } from "@/constants/profile-avatars";
import { pillappColors } from "@/theme/tokens";
import type { UserProfile } from "@/types/domain";

function ageFromBirthYear(birthYear?: number): number | undefined {
  if (!birthYear) return undefined;
  return new Date().getFullYear() - birthYear;
}

export function ProfileSummaryCard({
  profile,
  medicationCount,
  adherencePercent,
  measurementCount,
  noteCount,
}: {
  profile: UserProfile;
  medicationCount: number;
  adherencePercent: number;
  measurementCount: number;
  noteCount: number;
}) {
  const avatar = getProfileAvatar(profile.avatarId);
  const age = ageFromBirthYear(profile.birthYear);
  const sexLabel = GUEST_SEX_OPTIONS.find((option) => option.value === profile.sex)?.label;
  const identityBits = [
    age ? `${age} anni` : null,
    sexLabel && sexLabel !== "Preferisco non dirlo" ? sexLabel : null,
  ].filter(Boolean);

  return (
    <AppCard variant="brand">
      <XStack alignItems="center" gap="$3">
        <YStack
          width={64}
          height={64}
          borderRadius={32}
          alignItems="center"
          justifyContent="center"
          backgroundColor="rgba(255,255,255,0.22)"
          flexShrink={0}
        >
          <MaterialCommunityIcons
            name={avatar.icon}
            size={32}
            color={pillappColors.onPrimary}
          />
        </YStack>
        <YStack flex={1} gap="$1" minWidth={0}>
          <AppText variant="overline">Il tuo profilo</AppText>
          <AppText variant="headline">
            {profile.name.trim() || "Utente PillApp"}
          </AppText>
          <AppText variant="caption" muted>
            {identityBits.length ? identityBits.join(" · ") : "Completa i dati in fase di setup"}
          </AppText>
        </YStack>
      </XStack>

      <XStack width="100%" gap="$2">
        <SummaryStat label="Farmaci" value={String(medicationCount)} />
        <SummaryStat label="Aderenza oggi" value={`${adherencePercent}%`} />
        <SummaryStat label="Diario" value={`${measurementCount + noteCount}`} />
      </XStack>
    </AppCard>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <YStack
      flex={1}
      gap="$1"
      padding="$3"
      borderRadius="$3"
      backgroundColor="rgba(255,255,255,0.16)"
    >
      <AppText variant="title" textAlign="center">
        {value}
      </AppText>
      <AppText variant="caption" muted textAlign="center">
        {label}
      </AppText>
    </YStack>
  );
}
