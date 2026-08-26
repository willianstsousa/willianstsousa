import assert from "node:assert/strict";
import test from "node:test";

import {
  getAdminAccessStatus,
  isAdminEmail,
  safeAdminCallbackUrl,
} from "@/lib/auth/policy";

test("isAdminEmail exige correspondência exata e ignora caixa e espaços", () => {
  assert.equal(isAdminEmail(" Admin@Example.com ", "admin@example.com"), true);
  assert.equal(isAdminEmail("other@example.com", "admin@example.com"), false);
  assert.equal(isAdminEmail(null, "admin@example.com"), false);
  assert.equal(isAdminEmail("admin@example.com", undefined), false);
});

test("getAdminAccessStatus separa ausência de sessão de conta proibida", () => {
  assert.equal(getAdminAccessStatus(null, "admin@example.com"), "unauthenticated");
  assert.equal(
    getAdminAccessStatus("other@example.com", "admin@example.com"),
    "forbidden",
  );
  assert.equal(
    getAdminAccessStatus("ADMIN@example.com", "admin@example.com"),
    "authenticated",
  );
});

test("safeAdminCallbackUrl aceita apenas caminhos locais da área admin", () => {
  assert.equal(safeAdminCallbackUrl("/admin/tarefas?status=TODO"), "/admin/tarefas?status=TODO");
  assert.equal(safeAdminCallbackUrl("/"), "/admin");
  assert.equal(safeAdminCallbackUrl("//evil.example/admin"), "/admin");
  assert.equal(safeAdminCallbackUrl("https://evil.example/admin"), "/admin");
});
