"use client";

import {
  LayoutDashboard,
  ListTodo,
  LogOut,
  Settings,
  Target,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logoutAction } from "@/app/admin/_actions/auth";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/tarefas", label: "Tarefas", icon: ListTodo },
  { href: "/admin/financeiro", label: "Financeiro", icon: WalletCards },
  { href: "/admin/metas", label: "Metas", icon: Target },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

type AdminNavProps = {
  compact?: boolean;
};

export function AdminNav({ compact = false }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação administrativa" className="flex flex-col gap-1">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${
              active
                ? "bg-[var(--brand-soft)] text-[var(--brand-dark)]"
                : "text-[var(--muted)] hover:bg-[#f0f3f1] hover:text-[var(--foreground)]"
            }`}
            href={href}
            key={href}
          >
            <Icon aria-hidden="true" size={18} />
            <span className={compact ? "sr-only sm:not-sr-only" : undefined}>{label}</span>
          </Link>
        );
      })}
      <form action={logoutAction} className="mt-2 border-t border-[var(--line)] pt-2">
        <button className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[#fff1ef] hover:text-[var(--danger)]" type="submit">
          <LogOut aria-hidden="true" size={18} /> Sair
        </button>
      </form>
    </nav>
  );
}
