import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/authorization";
import { currentMonthInBrazil } from "@/lib/date";

export default async function IncomeAliasPage() {
  await requireAdmin();
  redirect(`/admin/financeiro?mes=${currentMonthInBrazil()}&tipo=INCOME`);
}
