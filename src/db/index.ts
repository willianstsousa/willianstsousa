import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "./schema";

let cachedDatabase: NeonHttpDatabase<typeof schema> | null = null;

export function getDb(): NeonHttpDatabase<typeof schema> {
  if (cachedDatabase) return cachedDatabase;

  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error("DATABASE_URL não está configurada.");
  }

  const client = neon(databaseUrl);
  cachedDatabase = drizzle(client, { schema });
  return cachedDatabase;
}

export * from "./schema";
