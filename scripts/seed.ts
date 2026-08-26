import "./load-env";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { financialCategories } from "../src/db/schema";
import { DEFAULT_FINANCIAL_CATEGORIES } from "./seed-data";

async function seed(): Promise<void> {
  const databaseUrl =
    process.env.DATABASE_URL_UNPOOLED?.trim() ||
    process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error(
      "Defina DATABASE_URL_UNPOOLED ou DATABASE_URL antes de executar o seed.",
    );
  }

  const db = drizzle(neon(databaseUrl));
  await db
    .insert(financialCategories)
    .values([...DEFAULT_FINANCIAL_CATEGORIES])
    .onConflictDoNothing();
  console.log("Categorias financeiras padrão inseridas com sucesso.");
}

seed().catch(() => {
  console.error(
    "Não foi possível executar o seed. Verifique a configuração e a conexão; detalhes foram suprimidos para proteger credenciais.",
  );
  process.exitCode = 1;
});
