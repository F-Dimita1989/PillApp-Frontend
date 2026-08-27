import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";

import { pillappColors, pillappShadows } from "@/theme/tokens";

type SoundPreviewButtonProps = {
  onPress: () => void;
  loading?: boolean;
  accessibilityLabel?: string;
};

export function SoundPreviewButton({
  onPress,
  loading = false,
  accessibilityLabel,
}: SoundPreviewButtonProps) {
  return (
    <Pressable
      onPress={loading ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? "Prova suoneria"}
      hitSlop={8}
      style={({ pressed }) => [
        styles.button,
        pressed && !loading && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={pillappColors.secondary} />
      ) : (
        <MaterialCommunityIcons
          name="play"
          size={20}
          color={pillappColors.secondary}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: pillappColors.secondarySoft,
    ...pillappShadows.sm,
  },
  pressed: {
    opacity: 0.85,
  },
});
