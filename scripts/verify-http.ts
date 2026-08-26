import "./load-env";

let failed = false;

function ok(label: string): void {
  console.log(`[OK] ${label}`);
}

function fail(label: string): void {
  failed = true;
  console.error(`[FAIL] ${label}`);
}

async function request(path: string, redirect: RequestRedirect = "follow") {
  return fetch(`http://localhost:3000${path}`, {
    redirect,
    signal: AbortSignal.timeout(5_000),
  });
}

async function main(): Promise<void> {
  console.log("Secret-safe local HTTP verification\n");

  try {
    const home = await request("/");
    if (home.status === 200) ok("Public portfolio returns 200.");
    else fail("Public portfolio did not return 200.");

    const admin = await request("/admin", "manual");
    const adminLocation = admin.headers.get("location") ?? "";
    if (
      admin.status >= 300 &&
      admin.status < 400 &&
      adminLocation.startsWith("/admin/login")
    ) {
      ok("Anonymous /admin access redirects to the login page.");
    } else {
      fail("Anonymous /admin access did not redirect to the login page.");
    }

    const login = await request("/admin/login");
    if (login.status === 200) ok("Google login page returns 200.");
    else fail("Google login page did not return 200.");

    const providers = await request("/api/auth/providers");
    if (providers.status !== 200) {
      fail("Auth.js provider discovery did not return 200.");
    } else {
      const body = (await providers.json()) as {
        google?: { callbackUrl?: string; signinUrl?: string };
      };
      if (
        body.google?.callbackUrl ===
        "http://localhost:3000/api/auth/callback/google" &&
        body.google.signinUrl === "http://localhost:3000/api/auth/signin/google"
      ) {
        ok("Google provider and exact local callback are registered.");
      } else {
        fail("Google provider registration or callback is incorrect.");
      }
    }

    const summary = await request("/api/admin/summary");
    if (summary.status !== 401) {
      fail("Anonymous private summary request did not return 401.");
    } else {
      const body = (await summary.json()) as Record<string, unknown>;
      if (Object.keys(body).length === 1 && typeof body.error === "string") {
        ok("Private summary returns a minimal 401 JSON response.");
      } else {
        fail("Private summary 401 response contains unexpected fields.");
      }
    }
  } catch {
    fail("HTTP verification could not reach the local app. Start it with npm run dev.");
  }

  console.log("\nNo secret or session cookie was printed.");
  if (failed) process.exitCode = 1;
}

void main();
