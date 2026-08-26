"use server";

import { signIn } from "@/auth";
import { safeAdminCallbackUrl } from "@/lib/auth/authorization";

export async function loginWithGoogle(formData: FormData): Promise<void> {
  const redirectTo = safeAdminCallbackUrl(formData.get("callbackUrl"));
  await signIn("google", { redirectTo });
}
