import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/authorization";
import { currentMonthInBrazil } from "@/lib/date";

export default async function ExpensesAliasPage() {
  await requireAdmin();
  redirect(`/admin/financeiro?mes=${currentMonthInBrazil()}&tipo=EXPENSE`);
}
