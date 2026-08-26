import assert from "node:assert/strict";
import test from "node:test";

import { createAdminSummaryResponse } from "@/lib/admin/summary-response";

const dashboardData = {
  overdueTasks: 1,
  pendingTasks: 2,
  summary: {
    balance: "70.00",
    expense: "30.00",
    income: "100.00",
  },
};

test("summary privada responde 401 e 403 sem consultar o banco", async () => {
  let queryCount = 0;
  const getDashboardData = async () => {
    queryCount += 1;
    return dashboardData;
  };

  const unauthenticated = await createAdminSummaryResponse({
    getAccessStatus: async () => "unauthenticated",
    getDashboardData,
    month: "2026-08",
    rethrow: () => undefined,
  });
  assert.equal(unauthenticated.status, 401);
  assert.deepEqual(await unauthenticated.json(), { error: "Não autenticado." });

  const forbidden = await createAdminSummaryResponse({
    getAccessStatus: async () => "forbidden",
    getDashboardData,
    month: "2026-08",
    rethrow: () => undefined,
  });
  assert.equal(forbidden.status, 403);
  assert.deepEqual(await forbidden.json(), { error: "Acesso negado." });
  assert.equal(queryCount, 0);
});

test("summary privada autenticada expõe somente os cinco campos previstos", async () => {
  const response = await createAdminSummaryResponse({
    getAccessStatus: async () => "authenticated",
    getDashboardData: async () => dashboardData,
    month: "2026-08",
    rethrow: () => undefined,
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    balance: "70.00",
    expense: "30.00",
    income: "100.00",
    overdueTasks: 1,
    pendingTasks: 2,
  });
});
