const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatCurrency(value: number | string): string {
  const numericValue = typeof value === "number" ? value : Number(value);
  return currencyFormatter.format(Number.isFinite(numericValue) ? numericValue : 0);
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return "Sem data";
  const [year, month, day] = date.split("-");
  return year && month && day ? `${day}/${month}/${year}` : "Data inválida";
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(value);
}
