export function formatSalary(min: number | null, max: number | null): string {
  if (min === null && max === null) return "—";
  const fmt = (n: number) => n.toLocaleString("en-US");
  if (min !== null && max !== null) return `${fmt(min)}–${fmt(max)}`;
  return fmt((min ?? max) as number);
}

export function formatDate(value: string | null, lang: "th" | "en" = "en"): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(lang === "th" ? "th-TH" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function truncate(value: string | null, length = 120): string {
  if (!value) return "";
  return value.length > length ? `${value.slice(0, length).trimEnd()}…` : value;
}
