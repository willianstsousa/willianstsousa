import { decimalToCents } from "@/lib/validation/admin";

export type FinancialValue = {
  amount: string;
  type: "EXPENSE" | "INCOME";
};

export function centsToDecimal(value: bigint): string {
  const isNegative = value < 0n;
  const absolute = isNegative ? -value : value;
  const whole = absolute / 100n;
  const decimals = absolute % 100n;
  return `${isNegative ? "-" : ""}${whole}.${decimals.toString().padStart(2, "0")}`;
}

export function calculateFinancialSummary(values: FinancialValue[]) {
  let income = 0n;
  let expense = 0n;

  for (const value of values) {
    const amount = decimalToCents(value.amount);
    if (value.type === "INCOME") income += amount;
    if (value.type === "EXPENSE") expense += amount;
  }

  return {
    income: centsToDecimal(income),
    expense: centsToDecimal(expense),
    balance: centsToDecimal(income - expense),
  };
}

export function calculateGoalProgress(currentValue: string, targetValue: string): number {
  const target = decimalToCents(targetValue);
  if (target <= 0n) return 0;
  const current = decimalToCents(currentValue);
  return Math.min(100, Math.max(0, Number((current * 1000n) / target) / 10));
}
