const FALLBACK_URL = "http://localhost:3000";

function normalizeUrl(value: string): string {
  const withProtocol = value.startsWith("http") ? value : `https://${value}`;
  return new URL(withProtocol).origin;
}

export function getSiteUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const vercelUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;

  try {
    return normalizeUrl(configuredUrl || vercelUrl || FALLBACK_URL);
  } catch {
    return FALLBACK_URL;
  }
}
