import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { YStack } from "tamagui";

import { AppText } from "@/components/ui/app-text";
import { CardSurfaceProvider } from "@/components/ui/card-surface";
import { SoundPreviewButton } from "@/components/ui/sound-preview-button";
import { layout, spacing } from "@/constants/spacing";
import { useAccessibility } from "@/lib/accessibility/context";
import { speakAppText } from "@/lib/accessibility/speech";
import { pillappColors } from "@/theme/tokens";

export type SelectOption = {
  value: string;
  label: string;
  description?: string;
};

type AppSelectProps = {
  label?: string;
  value: string;
  options: SelectOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  /** Play/preview control on each option (e.g. notification sounds). */
  onPreviewOption?: (value: string) => void;
  previewingOption?: string | null;
};

export function AppSelect({
  label,
  value,
  options,
  onValueChange,
  placeholder = "Seleziona…",
  disabled = false,
  accessibilityLabel,
  onPreviewOption,
  previewingOption,
}: AppSelectProps) {
  const [open, setOpen] = useState(false);
  const { easyTap, highContrast, reduceMotion, speechEnabled } = useAccessibility();
  const selected = options.find((option) => option.value === value);

  return (
    <YStack width="100%" gap="$2" flexShrink={0}>
      {label ? <AppText variant="label">{label}</AppText> : null}

      <Pressable
        onPress={() => {
          if (!disabled) setOpen(true);
        }}
        onLongPress={() => {
          if (speechEnabled) {
            speakAppText(
              [label, selected?.label ?? placeholder].filter(Boolean).join(". "),
              { force: true },
            );
          }
        }}
        delayLongPress={400}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label ?? "Menu a tendina"}
        accessibilityState={{ disabled, expanded: open }}
        style={({ pressed }) => [
          styles.trigger,
          easyTap && styles.triggerEasyTap,
          highContrast && styles.triggerHighContrast,
          disabled && styles.triggerDisabled,
          pressed && !disabled && styles.triggerPressed,
        ]}
      >
        <CardSurfaceProvider surface="light">
          <AppText
            variant="body"
            muted={!selected}
            style={styles.triggerText}
            numberOfLines={1}
            speakOnPress={false}
          >
            {selected?.label ?? placeholder}
          </AppText>
        </CardSurfaceProvider>
        <MaterialCommunityIcons
          name="chevron-down"
          size={22}
          color={pillappColors.textSecondary}
        />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType={reduceMotion ? "none" : "fade"}
        onRequestClose={() => setOpen(false)}
      >
        <CardSurfaceProvider surface="light">
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <AppText variant="title" style={styles.sheetTitle}>
              {label ?? "Scegli un'opzione"}
            </AppText>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              style={styles.list}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    onPress={() => {
                      onValueChange(item.value);
                      if (speechEnabled) speakAppText(item.label, { force: true });
                      setOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      easyTap && styles.optionEasyTap,
                      isSelected && styles.optionSelected,
                      pressed && styles.optionPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View style={styles.optionText}>
                      <AppText
                        variant="body"
                        color={isSelected ? "secondary" : undefined}
                        fontWeight={isSelected ? "700" : undefined}
                        speakOnPress={false}
                      >
                        {item.label}
                      </AppText>
                      {item.description ? (
                        <AppText variant="caption" muted speakOnPress={false}>
                          {item.description}
                        </AppText>
                      ) : null}
                    </View>
                    {onPreviewOption ? (
                      <View onStartShouldSetResponder={() => true}>
                        <SoundPreviewButton
                          loading={previewingOption === item.value}
                          onPress={() => onPreviewOption(item.value)}
                          accessibilityLabel={`Prova ${item.label}`}
                        />
                      </View>
                    ) : null}
                    {isSelected ? (
                      <MaterialCommunityIcons
                        name="check"
                        size={20}
                        color={pillappColors.secondary}
                      />
                    ) : null}
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
        </CardSurfaceProvider>
      </Modal>
    </YStack>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.94)",
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  triggerEasyTap: {
    minHeight: 60,
  },
  triggerHighContrast: {
    borderWidth: 2,
    borderColor: pillappColors.textPrimary,
  },
  triggerDisabled: {
    opacity: 0.55,
  },
  triggerPressed: {
    borderColor: pillappColors.secondary,
  },
  triggerText: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing.xl,
  },
  sheet: {
    maxHeight: "70%",
    backgroundColor: pillappColors.surface,
    borderRadius: 20,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderWidth: 1,
    borderColor: pillappColors.border,
  },
  sheetTitle: {
    textAlign: "center",
    fontWeight: "700",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
  },
  optionEasyTap: {
    minHeight: 56,
  },
  optionSelected: {
    backgroundColor: pillappColors.secondarySoft,
  },
  optionPressed: {
    backgroundColor: pillappColors.surfaceMuted,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
});
