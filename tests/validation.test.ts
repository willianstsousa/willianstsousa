import assert from "node:assert/strict";
import test from "node:test";

import {
  decimalToCents,
  normalizeMoneyInput,
  transactionInputSchema,
} from "@/lib/validation/admin";

test("normaliza formatos monetários brasileiros e decimais", () => {
  assert.equal(normalizeMoneyInput("R$ 1.234,56"), "1234.56");
  assert.equal(normalizeMoneyInput("42"), "42.00");
  assert.equal(normalizeMoneyInput("12.345"), "");
  assert.equal(decimalToCents("1234.56"), 123456n);
});

test("transação exige valor positivo, categoria UUID e data ISO", () => {
  const valid = transactionInputSchema.safeParse({
    amount: "19,90",
    categoryId: "ca923b9c-1e65-4f66-b3a8-4a62d9a77f55",
    date: "2026-08-26",
    description: "Almoço",
    notes: "",
    type: "EXPENSE",
  });
  assert.equal(valid.success, true);
  if (valid.success) assert.equal(valid.data.amount, "19.90");

  const invalid = transactionInputSchema.safeParse({
    amount: "0",
    categoryId: "não-é-uuid",
    date: "26/08/2026",
    description: "",
    notes: "",
    type: "EXPENSE",
  });
  assert.equal(invalid.success, false);
});
