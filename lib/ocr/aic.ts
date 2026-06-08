const AIC_REGEX =
  /\b(?:A\.?\s*I\.?\s*C\.?\s*(?:N\.?|N°|NUM(?:ERO)?)?\s*[:\-]?\s*)?(0?\d{9})\b/gi;

export function extractAicCodes(text: string): string[] {
  const matches = [...text.matchAll(AIC_REGEX)];
  const unique = new Set<string>();
  matches.forEach((match) => {
    if (match[1]) {
      unique.add(match[1]);
    }
  });
  return [...unique];
}
