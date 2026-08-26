import { LogIn, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { forbidden, redirect } from "next/navigation";

import { getAdminAccessState, safeAdminCallbackUrl } from "@/lib/auth/authorization";

import { loginWithGoogle } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const access = await getAdminAccessState();
  if (access.status === "authenticated") redirect("/admin");
  if (access.status === "forbidden") forbidden();

  const params = await searchParams;
  const rawCallback = Array.isArray(params.callbackUrl)
    ? params.callbackUrl[0]
    : params.callbackUrl;
  const callbackUrl = safeAdminCallbackUrl(rawCallback ?? null);

  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-[var(--line)] bg-white p-7 shadow-xl shadow-[#17352b]/5 sm:p-9">
        <div className="grid size-12 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]">
          <LockKeyhole aria-hidden="true" size={22} />
        </div>
        <p className="mt-8 text-sm font-medium text-[var(--brand)]">Área privada</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Seu espaço pessoal.</h1>
        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
          Esta área é de acesso restrito. Continue com a única conta Google
          autorizada para administrar tarefas, finanças e metas.
        </p>
        <form action={loginWithGoogle} className="mt-8">
          <input name="callbackUrl" type="hidden" value={callbackUrl} />
          <button
            className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#26332f]"
            type="submit"
          >
            <LogIn aria-hidden="true" size={18} /> Continuar com Google
          </button>
        </form>
        <Link
          className="mt-5 block text-center text-sm text-[var(--muted)] underline-offset-4 hover:underline"
          href="/"
        >
          Voltar ao portfólio
        </Link>
      </div>
    </main>
  );
}
