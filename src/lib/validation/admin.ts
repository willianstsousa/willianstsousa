import { z } from "zod";

import {
  GOAL_STATUSES,
  GOAL_TYPES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TRANSACTION_TYPES,
} from "@/db/schema";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const requiredText = (max: number, field: string) =>
  z.preprocess(
    (value) => String(value ?? "").trim(),
    z.string().min(1, `${field} é obrigatório.`).max(max, `${field} é muito longo.`),
  );

const optionalText = (max: number) =>
  z.preprocess(
    (value) => {
      const normalized = String(value ?? "").trim();
      return normalized || null;
    },
    z.string().max(max, "Texto muito longo.").nullable(),
  );

const optionalDate = z.preprocess(
  (value) => {
    const normalized = String(value ?? "").trim();
    return normalized || null;
  },
  z.string().regex(datePattern, "Data inválida.").nullable(),
);

const requiredDate = z.preprocess(
  (value) => String(value ?? "").trim(),
  z.string().regex(datePattern, "Data inválida."),
);

export function normalizeMoneyInput(value: unknown): string {
  const raw = String(value ?? "")
    .trim()
    .replace(/R\$/gi, "")
    .replace(/\s/g, "");

  const normalized = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw;

  if (!/^\d{1,12}(\.\d{1,2})?$/.test(normalized)) return "";

  const [whole, decimals = ""] = normalized.split(".");
  return `${whole}.${decimals.padEnd(2, "0")}`;
}

const money = (allowZero: boolean) =>
  z.preprocess(
    normalizeMoneyInput,
    z
      .string()
      .regex(/^\d{1,12}\.\d{2}$/, "Informe um valor monetário válido.")
      .refine(
        (value) => (allowZero ? decimalToCents(value) >= 0n : decimalToCents(value) > 0n),
        allowZero ? "O valor não pode ser negativo." : "O valor deve ser maior que zero.",
      ),
  );

export function decimalToCents(value: string): bigint {
  const [whole, decimals = ""] = value.split(".");
  return BigInt(whole || "0") * 100n + BigInt(decimals.padEnd(2, "0").slice(0, 2));
}

export const idSchema = z.string().uuid("Identificador inválido.");

export const taskInputSchema = z.object({
  title: requiredText(160, "Título"),
  description: optionalText(3000),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(TASK_PRIORITIES),
  dueDate: optionalDate,
});

export const categoryInputSchema = z.object({
  name: requiredText(80, "Nome"),
  type: z.enum(TRANSACTION_TYPES),
});

export const transactionInputSchema = z.object({
  description: requiredText(180, "Descrição"),
  amount: money(false),
  type: z.enum(TRANSACTION_TYPES),
  categoryId: idSchema,
  date: requiredDate,
  notes: optionalText(3000),
});

export const goalInputSchema = z.object({
  title: requiredText(160, "Título"),
  description: optionalText(3000),
  type: z.enum(GOAL_TYPES),
  targetValue: money(false),
  currentValue: money(true),
  deadline: optionalDate,
  status: z.enum(GOAL_STATUSES),
});

export const goalProgressInputSchema = z.object({
  currentValue: money(true),
});

export function firstValidationMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Revise os dados informados.";
}
