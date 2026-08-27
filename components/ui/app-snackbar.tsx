import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

import { AppButton } from "@/components/ui/app-button";
import { AppCard } from "@/components/ui/app-card";
import { AppText } from "@/components/ui/app-text";
import { BrandIconBadge } from "@/components/ui/brand-icon-badge";
import { layout } from "@/constants/spacing";
import { useAccessibility } from "@/lib/accessibility/context";
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
  const insets = useSafeAreaInsets();
  const { easyTap, reduceMotion } = useAccessibility();
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (!visible || !message) return;
    const timeout = setTimeout(() => onDismissRef.current(), 5000);
    return () => clearTimeout(timeout);
  }, [visible, message]);

  const isError = variant === "error";
  const open = visible && Boolean(message);
  const closeSize = easyTap ? 52 : 44;

  return (
    <Modal
      visible={open}
      transparent
      animationType={reduceMotion ? "none" : "fade"}
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View
        style={[
          styles.overlay,
          {
            paddingHorizontal: layout.screenPaddingHorizontal,
            paddingBottom: Math.max(insets.bottom, 12) + 16,
          },
        ]}
        pointerEvents="box-none"
      >
        <AppCard variant={isError ? "outlined" : "elevated"}>
          <XStack width="100%" alignItems="center" gap="$3">
            <BrandIconBadge
              name={isError ? "alert-circle-outline" : "information-outline"}
              size={40}
              iconSize={20}
              radius={12}
            />
            <YStack flex={1} gap="$1" minWidth={0}>
              <AppText variant="body" color={isError ? "error" : undefined}>
                {message}
              </AppText>
            </YStack>
            <Pressable
              onPress={onDismiss}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Chiudi messaggio"
              style={[
                styles.close,
                {
                  width: closeSize,
                  height: closeSize,
                  borderRadius: closeSize / 2,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="close"
                size={easyTap ? 22 : 20}
                color={pillappColors.textSecondary}
              />
            </Pressable>
          </XStack>
          <AppButton
            variant={onAction ? "primary" : "secondary"}
            size="md"
            fullWidth
            onPress={() => {
              onAction?.();
              onDismiss();
            }}
            accessibilityLabel={actionLabel}
          >
            {actionLabel}
          </AppButton>
        </AppCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  close: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: pillappColors.surfaceMuted,
    flexShrink: 0,
  },
});
