import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Label, YStack } from "tamagui";

import { AppText } from "@/components/ui/app-text";
import { layout, spacing } from "@/constants/spacing";
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
};

export function AppSelect({
  label,
  value,
  options,
  onValueChange,
  placeholder = "Seleziona…",
  disabled = false,
  accessibilityLabel,
}: AppSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <YStack width="100%" gap="$2" flexShrink={0}>
      {label ? (
        <Label color="$textPrimary" fontSize={14} fontWeight="600" lineHeight={20}>
          {label}
        </Label>
      ) : null}

      <Pressable
        onPress={() => {
          if (!disabled) setOpen(true);
        }}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label ?? "Menu a tendina"}
        accessibilityState={{ disabled, expanded: open }}
        style={({ pressed }) => [
          styles.trigger,
          disabled && styles.triggerDisabled,
          pressed && !disabled && styles.triggerPressed,
        ]}
      >
        <AppText
          variant="body"
          muted={!selected}
          style={styles.triggerText}
          numberOfLines={1}
        >
          {selected?.label ?? placeholder}
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
                      setOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && styles.optionSelected,
                      pressed && styles.optionPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View style={styles.optionText}>
                      <AppText
                        variant="body"
                        color={isSelected ? "primary" : undefined}
                        fontWeight={isSelected ? "700" : undefined}
                      >
                        {item.label}
                      </AppText>
                      {item.description ? (
                        <AppText variant="caption" muted>
                          {item.description}
                        </AppText>
                      ) : null}
                    </View>
                    {isSelected ? (
                      <MaterialCommunityIcons
                        name="check"
                        size={20}
                        color={pillappColors.primary}
                      />
                    ) : null}
                  </Pressable>
                );
              }}
            />
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
  optionSelected: {
    backgroundColor: pillappColors.primarySoft,
  },
  optionPressed: {
    backgroundColor: pillappColors.surfaceMuted,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
});
