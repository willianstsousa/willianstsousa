import { ShieldX } from "lucide-react";

import { signOut } from "@/auth";

export default function ForbiddenPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-[var(--line)] bg-white p-8 text-center">
        <ShieldX aria-hidden="true" className="mx-auto text-[var(--danger)]" size={38} />
        <p className="mt-5 text-sm font-semibold text-[var(--danger)]">403 Forbidden</p>
        <h1 className="mt-2 text-2xl font-semibold">Conta sem autorização</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          Esta conta Google não tem permissão para acessar a área administrativa.
        </p>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
          className="mt-7"
        >
          <button className="inline-flex min-h-11 items-center rounded-xl bg-[var(--foreground)] px-5 py-2.5 text-sm font-semibold text-white" type="submit">
            Sair e voltar ao portfólio
          </button>
        </form>
      </div>
    </main>
  );
}
