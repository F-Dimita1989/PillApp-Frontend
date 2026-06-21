export function capitalizeItalian(label: string): string {
  if (!label) return label;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatItalianDate(date: Date): string {
  const label = date.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return capitalizeItalian(label);
}

export function formatItalianTime(date: Date, includeSeconds = true): string {
  return date.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
    second: includeSeconds ? "2-digit" : undefined,
  });
}

export function formatItalianDateTime(date: Date, includeSeconds = true): string {
  return `${formatItalianDate(date)} · ${formatItalianTime(date, includeSeconds)}`;
}
