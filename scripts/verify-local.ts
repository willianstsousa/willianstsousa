import "./load-env";

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { neon } from "@neondatabase/serverless";

import { DEFAULT_FINANCIAL_CATEGORIES } from "./seed-data";

let failed = false;

function ok(label: string): void {
  console.log(`[OK] ${label}`);
}

function warn(label: string): void {
  console.warn(`[WARN] ${label}`);
}

function fail(label: string): void {
  failed = true;
  console.error(`[FAIL] ${label}`);
}

function required(name: string): string | null {
  const value = process.env[name]?.trim();
  if (!value) {
    fail(`${name} is missing.`);
    return null;
  }
  ok(`${name} is present.`);
  return value;
}

function parsePostgresUrl(name: string, value: string | null): URL | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (!url.username || !url.password || !url.hostname || !url.pathname.slice(1)) {
      fail(`${name} is not a complete PostgreSQL connection string.`);
      return null;
    }
    if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
      fail(`${name} must use the postgresql:// or postgres:// scheme.`);
      return null;
    }
    if (url.searchParams.get("sslmode") !== "require") {
      warn(`${name} should include sslmode=require.`);
    }
    return url;
  } catch {
    fail(`${name} is not a valid URL.`);
    return null;
  }
}

async function expectedMigrationCount(): Promise<number> {
  const journalPath = resolve(
    process.cwd(),
    "src/db/migrations/meta/_journal.json",
  );
  const journal = JSON.parse(await readFile(journalPath, "utf8")) as {
    entries?: unknown[];
  };
  return journal.entries?.length ?? 0;
}

async function verifyDatabase(databaseUrl: string): Promise<void> {
  try {
    const sql = neon(databaseUrl);
    await sql`select 1 as connected`;
    ok("Neon connection succeeds.");

    const migrationTableRows = await sql`
      select count(*)::int as count
      from information_schema.tables
      where table_schema = 'drizzle'
        and table_name = '__drizzle_migrations'
    `;
    const migrationTableCount = Number(migrationTableRows[0]?.count ?? 0);

    if (migrationTableCount !== 1) {
      fail("Drizzle migration history is missing; run npm run db:migrate.");
    } else {
      const migrationRows = await sql`
        select count(*)::int as count
        from drizzle.__drizzle_migrations
      `;
      const appliedCount = Number(migrationRows[0]?.count ?? 0);
      const expectedCount = await expectedMigrationCount();

      if (appliedCount < expectedCount) {
        fail("The Neon database has unapplied migrations; run npm run db:migrate.");
      } else if (appliedCount > expectedCount) {
        warn("The Neon database contains migrations newer than this checkout.");
      } else {
        ok(`All ${expectedCount} versioned migration(s) are applied.`);
      }
    }

    const tableRows = await sql`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
        and table_name in ('tasks', 'financial_categories', 'transactions', 'goals')
    `;
    const tables = new Set(tableRows.map((row) => String(row.table_name)));
    const requiredTables = [
      "tasks",
      "financial_categories",
      "transactions",
      "goals",
    ];
    const missingTables = requiredTables.filter((table) => !tables.has(table));

    if (missingTables.length) {
      fail("One or more application tables are missing; run npm run db:migrate.");
      return;
    }
    ok("All four application tables exist.");

    const categoryRows = await sql`
      select name, type::text as type
      from financial_categories
    `;
    const categories = new Set(
      categoryRows.map((row) => `${String(row.type)}:${String(row.name)}`),
    );
    const missingDefaults = DEFAULT_FINANCIAL_CATEGORIES.filter(
      (category) => !categories.has(`${category.type}:${category.name}`),
    );

    if (missingDefaults.length) {
      fail("Default financial categories are incomplete; run npm run db:seed.");
    } else {
      ok(`All ${DEFAULT_FINANCIAL_CATEGORIES.length} seed categories exist.`);
    }
  } catch {
    fail(
      "Neon verification failed. Check the connection strings and network access; details were intentionally suppressed.",
    );
  }
}

async function main(): Promise<void> {
  console.log("Secret-safe local setup verification\n");

  const pooledValue = required("DATABASE_URL");
  const directValue = process.env.DATABASE_URL_UNPOOLED?.trim() || null;
  if (directValue) ok("DATABASE_URL_UNPOOLED is present.");
  else warn("DATABASE_URL_UNPOOLED is missing; migrations will fall back to DATABASE_URL.");

  const pooledUrl = parsePostgresUrl("DATABASE_URL", pooledValue);
  const directUrl = parsePostgresUrl("DATABASE_URL_UNPOOLED", directValue);

  if (pooledUrl && !pooledUrl.hostname.includes("-pooler.")) {
    warn("DATABASE_URL does not look like a Neon pooled endpoint.");
  }
  if (directUrl?.hostname.includes("-pooler.")) {
    fail("DATABASE_URL_UNPOOLED must use the Neon direct endpoint, without -pooler.");
  }
  if (
    pooledUrl &&
    directUrl &&
    (pooledUrl.username !== directUrl.username ||
      pooledUrl.pathname !== directUrl.pathname ||
      pooledUrl.hostname.replace("-pooler.", ".") !== directUrl.hostname)
  ) {
    fail("The pooled and direct URLs do not point to the same Neon database.");
  }

  const authSecret = required("AUTH_SECRET");
  if (authSecret && authSecret.length < 32) {
    fail("AUTH_SECRET must contain at least 32 characters.");
  }

  const googleId = required("AUTH_GOOGLE_ID");
  if (googleId && !googleId.endsWith(".apps.googleusercontent.com")) {
    fail("AUTH_GOOGLE_ID is not a Google OAuth Web client ID.");
  }

  const googleSecret = required("AUTH_GOOGLE_SECRET");
  if (googleSecret && googleSecret.length < 16) {
    fail("AUTH_GOOGLE_SECRET is unexpectedly short.");
  }

  const adminEmail = required("ADMIN_EMAIL");
  if (adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
    fail("ADMIN_EMAIL is not a valid email address.");
  }

  const siteUrl = required("NEXT_PUBLIC_SITE_URL");
  if (siteUrl && siteUrl !== "http://localhost:3000") {
    fail("NEXT_PUBLIC_SITE_URL must be exactly http://localhost:3000 for this local check.");
  }

  const databaseUrl = directValue ?? pooledValue;
  if (databaseUrl && (directUrl || pooledUrl)) {
    await verifyDatabase(databaseUrl);
  }

  console.log(
    "\nNo environment value, credential, connection string, or account address was printed.",
  );
  if (failed) process.exitCode = 1;
}

void main();
