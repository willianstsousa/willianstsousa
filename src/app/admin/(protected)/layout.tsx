import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth/authorization";

export default async function ProtectedAdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireAdmin();
  return <AdminShell user={user}>{children}</AdminShell>;
}
