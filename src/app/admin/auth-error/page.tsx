import { CircleAlert } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-[var(--line)] bg-white p-8 text-center">
        <CircleAlert aria-hidden="true" className="mx-auto text-[var(--danger)]" size={34} />
        <h1 className="mt-5 text-2xl font-semibold">Não foi possível entrar</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          A autenticação não foi concluída. Tente novamente com a conta Google autorizada.
        </p>
        <a className="mt-7 inline-flex min-h-11 items-center rounded-xl bg-[var(--foreground)] px-5 py-2.5 text-sm font-semibold text-white" href="/admin/login">
          Tentar novamente
        </a>
      </div>
    </main>
  );
}
