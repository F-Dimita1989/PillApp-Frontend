import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Label, YStack } from "tamagui";

import { AppText } from "@/components/ui/app-text";
import { layout, spacing } from "@/constants/spacing";
import { pillappColors, pillappRadius } from "@/theme/tokens";

export type ProfileSetupSelectOption = {
  value: string;
  label: string;
};

type ProfileSetupSelectProps = {
  label?: string;
  value: string;
  options: ProfileSetupSelectOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
};

const FIELD_HEIGHT = 52;

export function ProfileSetupSelect({
  label,
  value,
  options,
  onValueChange,
  placeholder = "Seleziona…",
  disabled = false,
  accessibilityLabel,
}: ProfileSetupSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <YStack width="100%" gap="$2" flexShrink={0}>
      {label ? (
        <Label
          color={pillappColors.onPrimary}
          fontSize={14}
          fontWeight="600"
          lineHeight={20}
        >
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
        <Text
          style={[styles.triggerText, !selected && styles.triggerPlaceholder]}
          numberOfLines={1}
        >
          {selected?.label ?? placeholder}
        </Text>
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
              initialScrollIndex={
                selected
                  ? Math.max(
                      0,
                      options.findIndex((option) => option.value === value)
                    )
                  : undefined
              }
              getItemLayout={(_, index) => ({
                length: OPTION_ROW_HEIGHT,
                offset: OPTION_ROW_HEIGHT * index,
                index,
              })}
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
                    <AppText
                      variant="body"
                      color={isSelected ? "primary" : undefined}
                      fontWeight={isSelected ? "700" : undefined}
                      style={styles.optionText}
                    >
                      {item.label}
                    </AppText>
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
      </Modal>
    </YStack>
  );
}

const OPTION_ROW_HEIGHT = 52;

const styles = StyleSheet.create({
  trigger: {
    width: "100%",
    height: FIELD_HEIGHT,
    minHeight: FIELD_HEIGHT,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: pillappRadius[3],
    backgroundColor: "rgba(255,255,255,0.94)",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  triggerDisabled: {
    opacity: 0.55,
  },
  triggerPressed: {
    borderColor: pillappColors.surface,
    borderWidth: 2,
  },
  triggerText: {
    flex: 1,
    color: pillappColors.textPrimary,
    fontSize: 16,
    lineHeight: 22,
  },
  triggerPlaceholder: {
    color: pillappColors.textMuted,
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
    height: OPTION_ROW_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
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
});
