import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { YStack } from "tamagui";

import { pillappLayout, pillappSpace } from "@/theme/tokens";

type ProfileSetupLayoutProps = {
  hero: ReactNode;
  children: ReactNode;
};

export function ProfileSetupLayout({
  hero,
  children,
}: ProfileSetupLayoutProps) {
  const insets = useSafeAreaInsets();
  const horizontalPadding = pillappLayout.screenPaddingX;
  const bottomPadding = insets.bottom + pillappSpace[4];

  return (
    <YStack flex={1} width="100%">
      {hero}
      <KeyboardAvoidingView
        style={{ flex: 1, width: "100%" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "flex-start",
            alignItems: "center",
            paddingHorizontal: horizontalPadding,
            paddingTop: pillappSpace[3],
            paddingBottom: bottomPadding,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
        >
          <YStack width="100%" maxWidth={420} alignSelf="center">
            {children}
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </YStack>
  );
}
