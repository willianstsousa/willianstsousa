"use server";

import { signOut } from "@/auth";
import { requireAdmin } from "@/lib/auth/authorization";

export async function logoutAction(): Promise<void> {
  await requireAdmin();
  await signOut({ redirectTo: "/" });
}
