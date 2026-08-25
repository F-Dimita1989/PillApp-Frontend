import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { XStack } from "tamagui";

import { AppText } from "@/components/ui/app-text";
import { pillappColors } from "@/theme/tokens";

type PrivacyTermsAcceptRowProps = {
  checked: boolean;
  onPress: () => void;
  compact?: boolean;
};

export function PrivacyTermsAcceptRow({
  checked,
  onPress,
  compact = false,
}: PrivacyTermsAcceptRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel="Accetto i termini e le condizioni"
    >
      <XStack
        width="100%"
        alignItems="center"
        gap="$3"
        paddingHorizontal="$3"
        paddingVertical={compact ? "$2.5" : "$3"}
        borderRadius="$3"
        borderWidth={checked ? 2 : 1}
        borderColor={checked ? "$secondary" : "$border"}
        backgroundColor={checked ? "$secondarySoft" : "$surface"}
      >
        <MaterialCommunityIcons
          name={checked ? "checkbox-marked" : "checkbox-blank-outline"}
          size={compact ? 22 : 24}
          color={checked ? pillappColors.secondary : pillappColors.textMuted}
        />
        <AppText
          variant={compact ? "label" : "body"}
          color={checked ? "secondary" : undefined}
          fontWeight={checked ? "700" : "600"}
          flex={1}
        >
          Accetto i termini
        </AppText>
      </XStack>
    </Pressable>
  );
}
