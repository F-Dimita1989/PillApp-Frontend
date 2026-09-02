const AIC_REGEX =
  /\b(?:A\.?\s*I\.?\s*C\.?\s*(?:N\.?|N°|NUM(?:ERO)?)?\s*[:\-]?\s*)?(0?\d{9})\b/gi;

function collapseSpacedDigits(text: string): string {
  return text.replace(/\d(?:[\s.\-]*\d){8,11}/g, (chunk) =>
    chunk.replace(/[\s.\-]/g, ""),
  );
}

export function extractAicCodes(text: string): string[] {
  const unique = new Set<string>();
  const sources = [text, collapseSpacedDigits(text)];

  sources.forEach((source) => {
    AIC_REGEX.lastIndex = 0;
    const matches = [...source.matchAll(AIC_REGEX)];
    matches.forEach((match) => {
      if (match[1]) {
        unique.add(match[1]);
      }
    });
  });

  return [...unique];
}
