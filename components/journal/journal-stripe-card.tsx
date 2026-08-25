import type { ReactNode } from "react";

import { AppCard, AppCardActions, AppCardContent } from "@/components/ui";

export function JournalStripeCard({
  children,
  actions,
}: {
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <AppCard>
      <AppCardContent>{children}</AppCardContent>
      {actions ? <AppCardActions>{actions}</AppCardActions> : null}
    </AppCard>
  );
}
