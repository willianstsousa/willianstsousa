import type { TransactionType } from "../src/db/schema";

export const DEFAULT_FINANCIAL_CATEGORIES = [
  { name: "Alimentação", type: "EXPENSE" },
  { name: "Moradia", type: "EXPENSE" },
  { name: "Transporte", type: "EXPENSE" },
  { name: "Assinaturas", type: "EXPENSE" },
  { name: "Lazer", type: "EXPENSE" },
  { name: "Saúde", type: "EXPENSE" },
  { name: "Educação", type: "EXPENSE" },
  { name: "Compras", type: "EXPENSE" },
  { name: "Outros", type: "EXPENSE" },
  { name: "Salário", type: "INCOME" },
  { name: "Freelance", type: "INCOME" },
  { name: "Investimentos", type: "INCOME" },
  { name: "Outros", type: "INCOME" },
] as const satisfies ReadonlyArray<{
  name: string;
  type: TransactionType;
}>;
