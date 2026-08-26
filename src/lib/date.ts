const BRAZIL_TIME_ZONE = "America/Sao_Paulo";

function datePartsInBrazil(date = new Date()): { day: string; month: string; year: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BRAZIL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return {
    year: parts.find((part) => part.type === "year")?.value ?? "1970",
    month: parts.find((part) => part.type === "month")?.value ?? "01",
    day: parts.find((part) => part.type === "day")?.value ?? "01",
  };
}

export function todayInBrazil(date = new Date()): string {
  const { day, month, year } = datePartsInBrazil(date);
  return `${year}-${month}-${day}`;
}

export function currentMonthInBrazil(date = new Date()): string {
  const { month, year } = datePartsInBrazil(date);
  return `${year}-${month}`;
}

export function normalizeMonth(value?: string): string {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value ?? "") ? value! : currentMonthInBrazil();
}

export function getMonthRange(monthValue: string): { end: string; start: string } {
  const month = normalizeMonth(monthValue);
  const [year, monthNumber] = month.split("-").map(Number);
  const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1;
  const nextYear = monthNumber === 12 ? year + 1 : year;

  return {
    start: `${year}-${String(monthNumber).padStart(2, "0")}-01`,
    end: `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`,
  };
}

export function formatMonthLabel(monthValue: string): string {
  const [year, month] = normalizeMonth(monthValue).split("-").map(Number);
  const label = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  );
  return label.charAt(0).toLocaleUpperCase("pt-BR") + label.slice(1);
}
