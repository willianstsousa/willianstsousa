import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/authorization";
import { normalizeMonth } from "@/lib/date";

export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string | string[] }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const rawMonth = Array.isArray(params.mes) ? params.mes[0] : params.mes;
  redirect(`/admin/financeiro?mes=${normalizeMonth(rawMonth)}&tipo=INCOME`);
}
