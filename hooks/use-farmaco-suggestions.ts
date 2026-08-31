"use no memo";

import { useEffect, useState } from "react";

import {
  FARMACO_SEARCH_MIN_CHARS,
  searchFarmaciByName,
  type FarmacoSuggestion,
} from "@/lib/farmaci/search";

/** Pausa dall'ultimo tasto premuto: non si inseguono le singole lettere. */
const DEBOUNCE_MS = 400;

export type FarmacoSuggestionsStatus = "idle" | "loading" | "ready" | "error";

export type FarmacoSuggestionsResult = {
  suggestions: FarmacoSuggestion[];
  status: FarmacoSuggestionsStatus;
};

export function useFarmacoSuggestions(
  query: string,
  enabled = true,
): FarmacoSuggestionsResult {
  const text = query.trim();
  const [result, setResult] = useState<FarmacoSuggestionsResult>({
    suggestions: [],
    status: "idle",
  });

  useEffect(() => {
    if (!enabled || text.length < FARMACO_SEARCH_MIN_CHARS) {
      setResult({ suggestions: [], status: "idle" });
      return;
    }

    let cancelled = false;
    setResult({ suggestions: [], status: "loading" });

    const timer = setTimeout(() => {
      searchFarmaciByName(text)
        .then((suggestions) => {
          if (!cancelled) {
            setResult({ suggestions, status: "ready" });
          }
        })
        .catch(() => {
          if (!cancelled) {
            setResult({ suggestions: [], status: "error" });
          }
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [enabled, text]);

  return result;
}
