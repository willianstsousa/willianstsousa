function normalizeEmail(email: string): string {
  return email.trim().toLocaleLowerCase("en-US");
}

export type AdminAccessStatus =
  | "authenticated"
  | "forbidden"
  | "unauthenticated";

export function isAdminEmail(
  email: string | null | undefined,
  configuredAdminEmail: string | null | undefined = process.env.ADMIN_EMAIL,
): boolean {
  if (!email || !configuredAdminEmail) return false;
  return normalizeEmail(email) === normalizeEmail(configuredAdminEmail);
}

export function getAdminAccessStatus(
  email: string | null | undefined,
  configuredAdminEmail: string | null | undefined = process.env.ADMIN_EMAIL,
): AdminAccessStatus {
  if (!email) return "unauthenticated";
  return isAdminEmail(email, configuredAdminEmail)
    ? "authenticated"
    : "forbidden";
}

export function safeAdminCallbackUrl(
  value: FormDataEntryValue | string | null,
): string {
  if (typeof value !== "string") return "/admin";

  const candidate = value.trim();
  if (!candidate.startsWith("/admin") || candidate.startsWith("//")) {
    return "/admin";
  }

  try {
    const parsed = new URL(candidate, "http://localhost");
    return parsed.origin === "http://localhost"
      ? `${parsed.pathname}${parsed.search}`
      : "/admin";
  } catch {
    return "/admin";
  }
}
