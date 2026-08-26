import { LockKeyhole } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-[var(--line)] bg-white p-8 text-center">
        <LockKeyhole aria-hidden="true" className="mx-auto text-[var(--brand)]" size={36} />
        <h1 className="mt-5 text-2xl font-semibold">Autenticação necessária</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">Entre para continuar para a área privada.</p>
        <a className="mt-7 inline-flex rounded-xl bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white" href="/admin/login">
          Ir para o login
        </a>
      </div>
    </main>
  );
}
