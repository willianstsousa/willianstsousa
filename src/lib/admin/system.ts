import "server-only";

import { requireAdmin } from "@/lib/auth/authorization";

export async function getSystemConfigurationStatus() {
  await requireAdmin();
  return {
    databaseConfigured: Boolean(process.env.DATABASE_URL),
    googleConfigured: Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
    adminEmailConfigured: Boolean(process.env.ADMIN_EMAIL),
    authSecretConfigured: Boolean(process.env.AUTH_SECRET),
  };
}
