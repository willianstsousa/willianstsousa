import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateFinancialSummary,
  calculateGoalProgress,
  centsToDecimal,
} from "@/lib/finance";

test("calculateFinancialSummary preserva centavos sem ponto flutuante", () => {
  assert.deepEqual(
    calculateFinancialSummary([
      { amount: "1000.10", type: "INCOME" },
      { amount: "0.20", type: "INCOME" },
      { amount: "499.99", type: "EXPENSE" },
    ]),
    { balance: "500.31", expense: "499.99", income: "1000.30" },
  );
});

test("centsToDecimal e progresso de meta tratam limites", () => {
  assert.equal(centsToDecimal(-105n), "-1.05");
  assert.equal(calculateGoalProgress("250.00", "1000.00"), 25);
  assert.equal(calculateGoalProgress("1200.00", "1000.00"), 100);
  assert.equal(calculateGoalProgress("1.00", "0.00"), 0);
});
