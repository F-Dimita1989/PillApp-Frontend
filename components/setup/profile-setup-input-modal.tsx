import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { pillappLayout } from "@/theme/tokens";

type ProfileSetupInputModalProps = {
  visible: boolean;
  children: ReactNode;
  onRequestClose?: () => void;
  onShow?: () => void;
};

export function ProfileSetupInputModal({
  visible,
  children,
  onRequestClose,
  onShow,
}: ProfileSetupInputModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onRequestClose}
      onShow={onShow}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={[
            styles.backdrop,
            {
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
              paddingHorizontal: pillappLayout.screenPaddingX,
            },
          ]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            accessibilityLabel="Chiudi modulo"
            accessibilityRole="button"
            onPress={onRequestClose}
          />
          <View style={styles.cardSlot}>{children}</View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.58)",
  },
  cardSlot: {
    width: "100%",
    maxWidth: 420,
    zIndex: 1,
  },
});
