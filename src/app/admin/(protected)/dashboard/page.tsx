import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/authorization";

export default async function DashboardAliasPage() {
  await requireAdmin();
  redirect("/admin");
}
