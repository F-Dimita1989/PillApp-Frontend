import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { YStack } from "tamagui";

import { SectionHeader } from "@/components/ui/section-header";

type PillSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** @deprecated Usa SectionHeader + YStack */
export function PillSection({ title, description, children, style }: PillSectionProps) {
  return (
    <YStack width="100%" gap="$3" style={style}>
      <SectionHeader title={title} subtitle={description} />
      {children}
    </YStack>
  );
}
