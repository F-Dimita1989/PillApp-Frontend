import { useRouter } from "expo-router";

import { AppScreen, AppText, AppTopBar, SecondaryButton } from "@/components/ui";

export default function ModalScreen() {
  const router = useRouter();

  return (
    <AppScreen scroll={false}>
      <AppTopBar title="Informazioni" onBack={() => router.back()} />
      <AppText variant="body" muted>
        Questa schermata modale è un placeholder. Puoi chiuderla per tornare all&apos;app.
      </AppText>
      <SecondaryButton fullWidth onPress={() => router.back()}>
        Chiudi
      </SecondaryButton>
    </AppScreen>
  );
}
