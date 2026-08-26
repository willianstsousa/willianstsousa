import { CheckCircle2, CircleAlert, Database, KeyRound, Mail, UserRound } from "lucide-react";

import { logoutAction } from "@/app/admin/_actions/auth";
import { PageHeader } from "@/components/admin/page-header";
import { getSystemConfigurationStatus } from "@/lib/admin/system";
import { requireAdmin } from "@/lib/auth/authorization";

export default async function SettingsPage() {
  const user = await requireAdmin();
  const status = await getSystemConfigurationStatus();
  const checks = [
    { label: "Banco PostgreSQL", ready: status.databaseConfigured, icon: Database },
    { label: "Google OAuth", ready: status.googleConfigured, icon: KeyRound },
    { label: "E-mail administrador", ready: status.adminEmailConfigured, icon: Mail },
    { label: "Segredo de sessão", ready: status.authSecretConfigured, icon: KeyRound },
  ];

  return (
    <>
      <PageHeader description="Conta conectada e estado seguro das integrações do sistema." title="Configurações" />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]"><UserRound aria-hidden="true" size={21} /></span>
            <div>
              <h2 className="font-semibold">Conta conectada</h2>
              <p className="text-xs text-[var(--muted)]">Provider Google</p>
            </div>
          </div>
          <dl className="mt-6 space-y-4 text-sm">
            <div className="flex justify-between gap-4 border-b border-[var(--line)] pb-3"><dt className="text-[var(--muted)]">Nome</dt><dd className="text-right font-medium">{user.name || "Não informado"}</dd></div>
            <div className="flex justify-between gap-4 border-b border-[var(--line)] pb-3"><dt className="text-[var(--muted)]">E-mail</dt><dd className="truncate text-right font-medium">{user.email}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-[var(--muted)]">Autenticação</dt><dd className="font-medium">Google OAuth</dd></div>
          </dl>
          <form action={logoutAction} className="mt-7">
            <button className="button-danger" type="submit">Sair da conta</button>
          </form>
        </section>

        <section className="panel p-5 sm:p-6">
          <h2 className="font-semibold">Configuração do ambiente</h2>
          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">Somente a presença das variáveis é verificada; nenhum valor sensível é exibido.</p>
          <ul className="mt-6 space-y-3">
            {checks.map(({ label, ready, icon: Icon }) => (
              <li className="flex items-center justify-between gap-3 rounded-xl bg-[#f7f9f7] p-3" key={label}>
                <span className="flex items-center gap-3 text-sm font-medium"><Icon aria-hidden="true" className="text-[var(--muted)]" size={17} /> {label}</span>
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${ready ? "text-[var(--brand)]" : "text-[var(--warning)]"}`}>
                  {ready ? <CheckCircle2 aria-hidden="true" size={15} /> : <CircleAlert aria-hidden="true" size={15} />}
                  {ready ? "Configurado" : "Pendente"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
