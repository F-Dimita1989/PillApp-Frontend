import type { ReactNode } from "react";
import { YStack } from "tamagui";

import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { BrandGradientCard } from "@/components/ui/brand-gradient-card";
import { CardSurfaceProvider } from "@/components/ui/card-surface";

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
    tone === "error" ? "$errorSoft" : tone === "success" ? "$successSoft" : undefined;

  const body = (
    <YStack
      width="100%"
      backgroundColor={backgroundColor}
      borderRadius={tone === "neutral" ? undefined : "$4"}
      borderWidth={tone === "neutral" ? 0 : 1}
      borderColor={tone === "error" ? "$error" : tone === "success" ? "$success" : undefined}
      padding={tone === "neutral" ? 0 : "$6"}
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

  if (tone !== "neutral") {
    return body;
  }

  return (
    <CardSurfaceProvider surface="brand">
      <BrandGradientCard>{body}</BrandGradientCard>
    </CardSurfaceProvider>
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
