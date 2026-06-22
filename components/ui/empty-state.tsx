import type { ReactNode } from "react";
import { YStack } from "tamagui";

import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  tone?: "neutral" | "error" | "success";
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  tone = "neutral",
}: EmptyStateProps) {
  const backgroundColor =
    tone === "error" ? "$errorSoft" : tone === "success" ? "$successSoft" : "$surfaceMuted";

  return (
    <YStack
      width="100%"
      backgroundColor={backgroundColor}
      borderRadius="$3"
      borderWidth={1}
      borderColor="$border"
      padding="$6"
      alignItems="center"
      gap="$3"
      accessibilityRole="text"
    >
      {icon}
      <YStack gap="$2" alignItems="center" maxWidth={320}>
        <AppText variant="title" textAlign="center">
          {title}
        </AppText>
        <AppText variant="body" muted textAlign="center">
          {description}
        </AppText>
      </YStack>
      {actionLabel && onAction ? (
        <AppButton fullWidth onPress={onAction} marginTop="$2">
          {actionLabel}
        </AppButton>
      ) : null}
    </YStack>
  );
}

export function LoadingState({ message = "Caricamento in corso…" }: { message?: string }) {
  return (
    <YStack padding="$6" alignItems="center" gap="$3">
      <AppText variant="body" muted>
        {message}
      </AppText>
    </YStack>
  );
}

export function ErrorState({
  title = "Qualcosa non ha funzionato",
  description,
  actionLabel = "Riprova",
  onAction,
}: {
  title?: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <EmptyState
      tone="error"
      title={title}
      description={description}
      actionLabel={onAction ? actionLabel : undefined}
      onAction={onAction}
    />
  );
}

export function SuccessState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return <EmptyState tone="success" title={title} description={description} />;
}
