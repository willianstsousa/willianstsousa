import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/authorization";

export default async function CategoriesAliasPage() {
  await requireAdmin();
  redirect("/admin/financeiro/categorias");
}
