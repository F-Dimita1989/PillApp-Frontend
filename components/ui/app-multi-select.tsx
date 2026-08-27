import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { YStack } from "tamagui";

import { PrimaryButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { CardSurfaceProvider, useCardSurface } from "@/components/ui/card-surface";
import { layout, spacing } from "@/constants/spacing";
import { useAccessibility } from "@/lib/accessibility/context";
import { speakAppText } from "@/lib/accessibility/speech";
import { pillappColors } from "@/theme/tokens";

import type { SelectOption } from "@/components/ui/app-select";

type AppMultiSelectProps = {
  label?: string;
  values: string[];
  options: SelectOption[];
  onValuesChange: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
};

export function AppMultiSelect({
  label,
  values,
  options,
  onValuesChange,
  placeholder = "Seleziona…",
  disabled = false,
  accessibilityLabel,
}: AppMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(values);
  const onBrand = useCardSurface() === "brand";
  const { easyTap, highContrast, reduceMotion, speechEnabled } = useAccessibility();

  const summary = useMemo(() => {
    if (values.length === 0) return placeholder;
    const labels = options
      .filter((option) => values.includes(option.value))
      .map((option) => option.label);
    return labels.join(", ");
  }, [options, placeholder, values]);

  const openPicker = () => {
    if (disabled) return;
    setDraft(values);
    setOpen(true);
  };

  const toggleValue = (value: string) => {
    setDraft((current) => {
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      if (speechEnabled) {
        const option = options.find((item) => item.value === value);
        const selected = next.includes(value);
        speakAppText(
          `${option?.label ?? value} ${selected ? "selezionato" : "deselezionato"}`,
        );
      }
      return next;
    });
  };

  const confirm = () => {
    onValuesChange(draft);
    setOpen(false);
  };

  return (
    <YStack width="100%" gap="$2" flexShrink={0}>
      {label ? <AppText variant="label">{label}</AppText> : null}

      <Pressable
        onPress={openPicker}
        onLongPress={() => {
          if (speechEnabled) {
            speakAppText([label, summary].filter(Boolean).join(". "));
          }
        }}
        delayLongPress={400}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label ?? "Selezione multipla"}
        accessibilityState={{ disabled, expanded: open }}
        style={({ pressed }) => [
          styles.trigger,
          onBrand && styles.triggerOnBrand,
          easyTap && styles.triggerEasyTap,
          highContrast && styles.triggerHighContrast,
          disabled && styles.triggerDisabled,
          pressed && !disabled && styles.triggerPressed,
        ]}
      >
        <CardSurfaceProvider surface="light">
          <AppText
            variant="body"
            muted={values.length === 0}
            style={styles.triggerText}
            numberOfLines={2}
          >
            {summary}
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
            <AppText variant="bodyStrong" style={styles.sheetTitle}>
              {label ?? "Seleziona le opzioni"}
            </AppText>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
              overScrollMode="never"
              renderItem={({ item }) => {
                const isSelected = draft.includes(item.value);
                return (
                  <Pressable
                    onPress={() => toggleValue(item.value)}
                    style={({ pressed }) => [
                      styles.option,
                      easyTap && styles.optionEasyTap,
                      isSelected && styles.optionSelected,
                      pressed && styles.optionPressed,
                    ]}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                  >
                    <View style={styles.optionText}>
                      <AppText
                        variant="body"
                        color={isSelected ? "secondary" : undefined}
                        fontWeight={isSelected ? "700" : undefined}
                        style={styles.optionLabel}
                      >
                        {item.label}
                      </AppText>
                    </View>
                    <MaterialCommunityIcons
                      name={isSelected ? "checkbox-marked" : "checkbox-blank-outline"}
                      size={22}
                      color={isSelected ? pillappColors.secondary : pillappColors.textMuted}
                    />
                  </Pressable>
                );
              }}
            />
            <View style={styles.footer}>
              <PrimaryButton onPress={confirm} fullWidth>
                Conferma
              </PrimaryButton>
            </View>
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
    borderColor: pillappColors.border,
    borderRadius: 16,
    backgroundColor: pillappColors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  triggerEasyTap: {
    minHeight: 60,
  },
  triggerOnBrand: {
    borderColor: "rgba(255,255,255,0.5)",
    backgroundColor: "rgba(255,255,255,0.94)",
  },
  triggerHighContrast: {
    borderWidth: 2,
    borderColor: pillappColors.textPrimary,
    backgroundColor: pillappColors.surface,
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
    maxHeight: "75%",
    backgroundColor: pillappColors.surface,
    borderRadius: 20,
    paddingTop: spacing.md,
    borderWidth: 1,
    borderColor: pillappColors.border,
  },
  sheetTitle: {
    textAlign: "center",
    fontWeight: "700",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    paddingHorizontal: spacing.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingVertical: 10,
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
  },
  optionLabel: {
    includeFontPadding: false,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
});
