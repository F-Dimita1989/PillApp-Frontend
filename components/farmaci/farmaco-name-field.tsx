"use no memo";

import { useState } from "react";
import { ActivityIndicator, Keyboard } from "react-native";
import { XStack, YStack } from "tamagui";

import { AppDivider, AppInput, AppListItem, AppText } from "@/components/ui";
import {
  useFarmacoSuggestions,
  type FarmacoSuggestionsStatus,
} from "@/hooks/use-farmaco-suggestions";
import {
  FARMACO_SEARCH_MIN_CHARS,
  type FarmacoSuggestion,
} from "@/lib/farmaci/search";
import { pillappColors } from "@/theme/tokens";

type FarmacoNameFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSelectSuggestion: (suggestion: FarmacoSuggestion) => void;
  error?: string;
};

function hintText(
  status: FarmacoSuggestionsStatus,
  count: number,
  typedLength: number,
  fromCatalog: boolean,
): string {
  if (fromCatalog) {
    return "Dati presi dal catalogo: puoi correggere ogni campo.";
  }

  switch (status) {
    case "loading":
      return "Cerco nel catalogo…";
    case "error":
      return "Suggerimenti non disponibili ora: scrivi il nome a mano.";
    case "ready":
      return count > 0
        ? "Tocca un farmaco per compilare gli altri campi."
        : "Nessun farmaco trovato: scrivi il nome come preferisci.";
    default:
      return typedLength > 0
        ? `Scrivi almeno ${FARMACO_SEARCH_MIN_CHARS} lettere per i suggerimenti.`
        : "Mentre scrivi ti suggerisco i farmaci del catalogo.";
  }
}

export function FarmacoNameField({
  value,
  onChangeText,
  onSelectSuggestion,
  error,
}: FarmacoNameFieldProps) {
  /* Dopo una scelta la ricerca si ferma: il nome in campo è già quello giusto. */
  const [fromCatalog, setFromCatalog] = useState(false);
  const { suggestions, status } = useFarmacoSuggestions(value, !fromCatalog);
  const showPanel =
    !fromCatalog && (status === "loading" || status === "ready" || status === "error");

  const handleChangeText = (text: string) => {
    setFromCatalog(false);
    onChangeText(text);
  };

  const handleSelect = (suggestion: FarmacoSuggestion) => {
    setFromCatalog(true);
    Keyboard.dismiss();
    onSelectSuggestion(suggestion);
  };

  return (
    <YStack width="100%" gap="$2">
      <AppInput
        label="Nome farmaco"
        value={value}
        onChangeText={handleChangeText}
        placeholder="Es. Brufen"
        autoCapitalize="characters"
        autoCorrect={false}
        autoComplete="off"
        error={error}
        accessibilityLabel="Nome farmaco"
        returnKeyType="search"
      />

      {error ? null : (
        <XStack width="100%" alignItems="center" gap="$2">
          {status === "loading" ? (
            <ActivityIndicator size="small" color={pillappColors.secondary} />
          ) : null}
          <AppText variant="caption" muted>
            {hintText(status, suggestions.length, value.trim().length, fromCatalog)}
          </AppText>
        </XStack>
      )}

      {showPanel && status === "loading" && suggestions.length === 0 ? (
        <YStack
          width="100%"
          backgroundColor={pillappColors.surfaceMuted}
          borderWidth={1}
          borderColor="$border"
          borderRadius="$3"
          padding="$3"
        >
          <AppText variant="caption" muted>
            Cerco corrispondenze nel catalogo AIFA…
          </AppText>
        </YStack>
      ) : null}

      {showPanel && suggestions.length > 0 ? (
        <YStack
          width="100%"
          backgroundColor={pillappColors.surface}
          borderWidth={1}
          borderColor="$border"
          borderRadius="$3"
          paddingHorizontal="$3"
        >
          {suggestions.map((suggestion, index) => (
            <YStack key={suggestion.key} width="100%">
              {index > 0 ? <AppDivider marginVertical={0} /> : null}
              <AppListItem
                icon="pill"
                title={suggestion.nome}
                description={suggestion.dettaglio}
                onPress={() => handleSelect(suggestion)}
                accessibilityLabel={`${suggestion.nome}. ${suggestion.dettaglio}`}
                accessibilityHint="Compila i campi con i dati di questo farmaco"
              />
            </YStack>
          ))}
        </YStack>
      ) : null}
    </YStack>
  );
}
