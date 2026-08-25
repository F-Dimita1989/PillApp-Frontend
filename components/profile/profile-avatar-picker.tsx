import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet } from "react-native";
import { XStack, YStack } from "tamagui";

import { AppText } from "@/components/ui";
import { useAccessibility } from "@/lib/accessibility/context";
import { playAppHaptic } from "@/lib/accessibility/haptics";
import {
  PROFILE_AVATARS,
  type ProfileAvatarId,
} from "@/constants/profile-avatars";
import { pillappBrandGradient, pillappColors } from "@/theme/tokens";

export function ProfileAvatarPicker({
  value,
  onChange,
}: {
  value: ProfileAvatarId;
  onChange: (id: ProfileAvatarId) => void;
}) {
  const { hapticsEnabled, easyTap } = useAccessibility();
  const size = easyTap ? 64 : 56;

  return (
    <XStack width="100%" flexWrap="wrap" gap="$3">
      {PROFILE_AVATARS.map((avatar) => {
        const selected = avatar.id === value;
        const icon = (
          <MaterialCommunityIcons
            name={avatar.icon}
            size={easyTap ? 30 : 26}
            color={selected ? pillappColors.onPrimary : pillappColors.secondary}
          />
        );

        return (
          <Pressable
            key={avatar.id}
            onPress={() => {
              void playAppHaptic(hapticsEnabled, "success");
              onChange(avatar.id);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`Avatar ${avatar.label}`}
          >
            <YStack alignItems="center" gap="$1.5" width={size + 8}>
              {selected ? (
                <LinearGradient
                  colors={[...pillappBrandGradient.colors]}
                  locations={[...pillappBrandGradient.locations]}
                  start={pillappBrandGradient.start}
                  end={pillappBrandGradient.end}
                  style={[
                    styles.avatar,
                    { width: size, height: size, borderRadius: size / 2 },
                  ]}
                >
                  {icon}
                </LinearGradient>
              ) : (
                <YStack
                  width={size}
                  height={size}
                  borderRadius={size / 2}
                  alignItems="center"
                  justifyContent="center"
                  backgroundColor="$secondarySoft"
                  borderWidth={1}
                  borderColor="$border"
                >
                  {icon}
                </YStack>
              )}
              <AppText
                variant="caption"
                color={selected ? "secondary" : undefined}
                muted={!selected}
                textAlign="center"
              >
                {avatar.label}
              </AppText>
            </YStack>
          </Pressable>
        );
      })}
    </XStack>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    justifyContent: "center",
  },
});
