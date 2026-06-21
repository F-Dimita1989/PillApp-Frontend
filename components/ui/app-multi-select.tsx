import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Label, YStack } from "tamagui";

import { PrimaryButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { layout, spacing } from "@/constants/spacing";
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
    setDraft((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  const confirm = () => {
    onValuesChange(draft);
    setOpen(false);
  };

  return (
    <YStack width="100%" gap="$2" flexShrink={0}>
      {label ? (
        <Label color="$textPrimary" fontSize={14} fontWeight="600" lineHeight={20}>
          {label}
        </Label>
      ) : null}

      <Pressable
        onPress={openPicker}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label ?? "Selezione multipla"}
        accessibilityState={{ disabled, expanded: open }}
        style={({ pressed }) => [
          styles.trigger,
          disabled && styles.triggerDisabled,
          pressed && !disabled && styles.triggerPressed,
        ]}
      >
        <AppText
          variant="body"
          muted={values.length === 0}
          style={styles.triggerText}
          numberOfLines={2}
        >
          {summary}
        </AppText>
        <MaterialCommunityIcons
          name="chevron-down"
          size={22}
          color={pillappColors.textSecondary}
        />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <AppText variant="title" style={styles.sheetTitle}>
              {label ?? "Seleziona le opzioni"}
            </AppText>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              style={styles.list}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isSelected = draft.includes(item.value);
                return (
                  <Pressable
                    onPress={() => toggleValue(item.value)}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && styles.optionSelected,
                      pressed && styles.optionPressed,
                    ]}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                  >
                    <View style={styles.optionText}>
                      <AppText
                        variant="body"
                        color={isSelected ? "primary" : undefined}
                        fontWeight={isSelected ? "700" : undefined}
                      >
                        {item.label}
                      </AppText>
                    </View>
                    <MaterialCommunityIcons
                      name={isSelected ? "checkbox-marked" : "checkbox-blank-outline"}
                      size={22}
                      color={isSelected ? pillappColors.primary : pillappColors.textMuted}
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
      </Modal>
    </YStack>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: pillappColors.border,
    borderRadius: 12,
    backgroundColor: pillappColors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  triggerDisabled: {
    opacity: 0.55,
  },
  triggerPressed: {
    borderColor: pillappColors.primary,
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
    paddingTop: spacing.lg,
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
  optionSelected: {
    backgroundColor: pillappColors.primarySoft,
  },
  optionPressed: {
    backgroundColor: pillappColors.surfaceMuted,
  },
  optionText: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
});
