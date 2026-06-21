import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { XStack, YStack } from "tamagui";

import { AppText } from "@/components/ui/app-text";
import { pillappColors } from "@/theme/tokens";

type AppSnackbarProps = {
  visible: boolean;
  message: string;
  onDismiss: () => void;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "default" | "error";
};

export function AppSnackbar({
  visible,
  message,
  onDismiss,
  actionLabel = "OK",
  onAction,
  variant = "default",
}: AppSnackbarProps) {
  if (!visible || !message) {
    return null;
  }

  const isError = variant === "error";

  return (
    <YStack
      position="absolute"
      bottom="$6"
      left="$4"
      right="$4"
      zIndex={1000}
      pointerEvents="box-none"
    >
      <XStack
        backgroundColor={isError ? "$errorSoft" : "$textPrimary"}
        borderRadius="$3"
        paddingHorizontal="$4"
        paddingVertical="$3"
        alignItems="center"
        gap="$3"
        shadowColor="$shadow"
        shadowOpacity={0.15}
        shadowRadius={12}
        shadowOffset={{ width: 0, height: 4 }}
        elevation={6}
      >
        <AppText
          variant="body"
          flex={1}
          color={isError ? "error" : "inverse"}
        >
          {message}
        </AppText>
        <Pressable
          onPress={() => {
            onAction?.();
            onDismiss();
          }}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <AppText
            variant="label"
            color={isError ? "error" : "primary"}
            fontWeight="700"
          >
            {actionLabel}
          </AppText>
        </Pressable>
        <Pressable
          onPress={onDismiss}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Chiudi messaggio"
        >
          <MaterialCommunityIcons
            name="close"
            size={20}
            color={isError ? pillappColors.error : pillappColors.textInverse}
          />
        </Pressable>
      </XStack>
    </YStack>
  );
}
