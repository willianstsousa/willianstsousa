import { Menu } from "lucide-react";
import Link from "next/link";

import type { AdminIdentity } from "@/lib/auth/authorization";

import { AdminNav } from "./admin-nav";

type AdminShellProps = {
  children: React.ReactNode;
  user: AdminIdentity;
};

export function AdminShell({ children, user }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[#f6f7f5] lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-[var(--line)] bg-white p-5 lg:flex lg:flex-col">
        <Link className="flex items-center gap-3 px-2" href="/admin">
          <span className="grid size-9 place-items-center rounded-xl bg-[var(--foreground)] text-sm font-bold text-white">WT</span>
          <span>
            <span className="block text-sm font-semibold">Central pessoal</span>
            <span className="block text-xs text-[var(--muted)]">Área privada</span>
          </span>
        </Link>
        <div className="mt-9 flex-1"><AdminNav /></div>
        <div className="rounded-xl bg-[#f5f7f5] p-3">
          <p className="truncate text-sm font-medium">{user.name || "Administrador"}</p>
          <p className="mt-1 truncate text-xs text-[var(--muted)]">{user.email}</p>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-[var(--line)] bg-white/90 px-4 backdrop-blur lg:hidden">
          <Link className="font-semibold" href="/admin">Central pessoal</Link>
          <details className="relative">
            <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-xl border border-[var(--line)]" aria-label="Abrir menu">
              <Menu aria-hidden="true" size={19} />
            </summary>
            <div className="absolute right-0 top-12 w-64 rounded-2xl border border-[var(--line)] bg-white p-3 shadow-2xl">
              <AdminNav />
            </div>
          </details>
        </header>
        <main className="mx-auto w-full max-w-[92rem] px-4 py-6 sm:px-6 sm:py-8 xl:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
