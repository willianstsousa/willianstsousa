import "./load-env";

import { encode } from "next-auth/jwt";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
const authSecret = process.env.AUTH_SECRET;
const adminEmail = process.env.ADMIN_EMAIL;
const cookieName = "authjs.session-token";
const expectedSummaryFields = [
  "balance",
  "expense",
  "income",
  "overdueTasks",
  "pendingTasks",
];

async function requestSummaryAs(email: string): Promise<Response> {
  const token = await encode({
    maxAge: 60,
    salt: cookieName,
    secret: authSecret!,
    token: { email, name: "Local verification", sub: "local-verification" },
  });

  return fetch(`${baseUrl}/api/admin/summary`, {
    headers: { cookie: `${cookieName}=${token}` },
    redirect: "manual",
    signal: AbortSignal.timeout(5_000),
  });
}

async function main(): Promise<void> {
  console.log("Secret-safe authenticated HTTP verification\n");

  if (baseUrl !== "http://localhost:3000" || !authSecret || !adminEmail) {
    console.error(
      "[FAIL] Local URL, AUTH_SECRET, and ADMIN_EMAIL must be configured.",
    );
    process.exitCode = 1;
    return;
  }

  try {
    const adminResponse = await requestSummaryAs(adminEmail);
    const adminBody = (await adminResponse.json()) as Record<string, unknown>;
    const adminFields = Object.keys(adminBody).sort();

    if (
      adminResponse.status === 200 &&
      JSON.stringify(adminFields) === JSON.stringify(expectedSummaryFields)
    ) {
      console.log("[OK] Configured admin receives the five-field summary (200).");
    } else {
      console.error("[FAIL] Configured admin did not receive the expected summary.");
      process.exitCode = 1;
    }

    const forbiddenResponse = await requestSummaryAs(
      "not-the-configured-admin@example.invalid",
    );
    const forbiddenBody = (await forbiddenResponse.json()) as Record<
      string,
      unknown
    >;

    if (
      forbiddenResponse.status === 403 &&
      Object.keys(forbiddenBody).length === 1 &&
      typeof forbiddenBody.error === "string"
    ) {
      console.log("[OK] A different authenticated email receives minimal JSON (403).");
    } else {
      console.error("[FAIL] Non-admin authorization did not return the expected 403.");
      process.exitCode = 1;
    }
  } catch {
    console.error("[FAIL] Authenticated HTTP verification could not reach the local app.");
    process.exitCode = 1;
  }

  console.log(
    "\nNo secret, token, cookie, account address, or private summary value was printed.",
  );
}

void main();
