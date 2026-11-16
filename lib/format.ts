export const MONTHS_LONG = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
] as const;

export const MONTHS_SHORT = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
] as const;

const NBSP = "\u00A0";

export function formatNumberPT(value: number): string {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "−" : "";
  const digits = Math.abs(rounded).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return sign + grouped;
}

export function formatPercentPT(value: number, digits = 1): string {
  const body = Math.abs(value).toFixed(digits).replace(".", ",");
  const sign = value < 0 ? "−" : "";
  return `${sign}${body}${NBSP}%`;
}

export function formatDeltaPT(value: number, digits = 1): string {
  if (Object.is(value, 0) || Math.abs(value) < 0.05) return formatPercentPT(0, digits);
  const sign = value > 0 ? "+" : "−";
  const body = Math.abs(value).toFixed(digits).replace(".", ",");
  return `${sign}${body}${NBSP}%`;
}

export function formatPointsPT(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  const body = Math.abs(value).toFixed(1).replace(".", ",");
  return `${sign}${body}${NBSP}p.p.`;
}

export function formatPercentSmart(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  const digits = Math.abs(rounded - Math.round(rounded)) < 0.05 ? 0 : 1;
  return formatPercentPT(rounded, digits);
}

export function formatMonthLong(year: number, month: number): string {
  return `${MONTHS_LONG[month - 1]} de ${year}`;
}

export function formatMonthTick(year: number, month: number): string {
  return `${MONTHS_SHORT[month - 1]} ${String(year).slice(2)}`;
}

export function formatGeneratedAt(year: number, month: number): string {
  const date = new Date(year, month, 1);
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatGeneratedShort(year: number, month: number): string {
  const date = new Date(year, month, 1);
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
}

export function formatLongDate(year: number, monthIndex: number, day: number): string {
  return `${day} de ${MONTHS_LONG[monthIndex]} de ${year}`;
}

export function formatClock(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function formatHoursPT(hours: number, digits?: number): string {
  const abs = Math.abs(hours);
  const tenths = Math.round(abs * 10) / 10;
  const useDigits = digits ?? (tenths >= 10 ? 0 : 1);
  const rounded = useDigits === 0 ? Math.round(abs) : tenths;
  const body = rounded.toFixed(useDigits).replace(".", ",");
  const sign = hours < 0 ? "−" : "";
  return `${sign}${body}${NBSP}h`;
}
