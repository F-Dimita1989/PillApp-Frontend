import { AppHeader } from "@/components/ui/app-header";

type PillScreenHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
};

/** @deprecated Usa AppHeader */
export function PillScreenHeader({ title, subtitle, eyebrow }: PillScreenHeaderProps) {
  return <AppHeader title={title} subtitle={subtitle} eyebrow={eyebrow} />;
}
