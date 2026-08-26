import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  ClockAlert,
  ListTodo,
  Target,
} from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { getDashboardData } from "@/lib/admin/queries";
import { taskPriorityLabels } from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/auth/authorization";
import { currentMonthInBrazil, formatMonthLabel } from "@/lib/date";
import { calculateGoalProgress } from "@/lib/finance";
import { formatCurrency, formatDate, formatPercentage } from "@/lib/format";

export default async function DashboardPage() {
  await requireAdmin();
  const month = currentMonthInBrazil();
  const data = await getDashboardData(month);

  return (
    <>
      <PageHeader
        description="Uma leitura rápida do que precisa de atenção hoje."
        eyebrow={formatMonthLabel(month)}
        title="Dashboard"
      />

      <section aria-label="Indicadores do mês" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard detail="Entradas no mês" icon={ArrowUpRight} label="Receitas" tone="positive" value={formatCurrency(data.summary.income)} />
        <StatCard detail="Saídas no mês" icon={ArrowDownRight} label="Despesas" tone="danger" value={formatCurrency(data.summary.expense)} />
        <StatCard detail="Receitas menos despesas" icon={CircleDollarSign} label="Saldo" value={formatCurrency(data.summary.balance)} />
        <StatCard detail={`${data.overdueTasks} vencida(s)`} icon={ListTodo} label="Tarefas pendentes" tone={data.overdueTasks ? "warning" : "default"} value={String(data.pendingTasks)} />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="panel p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Últimas movimentações</h2>
              <p className="mt-1 text-xs text-[var(--muted)]">Atividade financeira recente</p>
            </div>
            <Link className="text-sm font-semibold text-[var(--brand)]" href="/admin/financeiro">Ver todas</Link>
          </div>
          {data.recentTransactions.length ? (
            <ul className="mt-5 divide-y divide-[var(--line)]">
              {data.recentTransactions.map((transaction) => (
                <li className="flex items-center justify-between gap-4 py-3" key={transaction.id}>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{transaction.description}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{transaction.categoryName} · {formatDate(transaction.date)}</p>
                  </div>
                  <p className={`shrink-0 text-sm font-semibold ${transaction.type === "INCOME" ? "text-[var(--brand)]" : "text-[var(--danger)]"}`}>
                    {transaction.type === "INCOME" ? "+" : "−"} {formatCurrency(transaction.amount)}
                  </p>
                </li>
              ))}
            </ul>
          ) : <div className="mt-5"><EmptyState message="Nenhuma movimentação cadastrada." /></div>}
        </section>

        <section className="panel p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Próximas tarefas</h2>
              <p className="mt-1 text-xs text-[var(--muted)]">Compromissos com data definida</p>
            </div>
            <Link className="text-sm font-semibold text-[var(--brand)]" href="/admin/tarefas">Organizar</Link>
          </div>
          {data.upcomingTasks.length ? (
            <ul className="mt-5 space-y-3">
              {data.upcomingTasks.map((task) => (
                <li className="flex items-start gap-3 rounded-xl bg-[#f7f9f7] p-3" key={task.id}>
                  <ClockAlert aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--brand)]" size={17} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{formatDate(task.dueDate)} · Prioridade {taskPriorityLabels[task.priority].toLocaleLowerCase("pt-BR")}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : <div className="mt-5"><EmptyState message="Nenhuma tarefa próxima." /></div>}
        </section>
      </div>

      <section className="panel mt-6 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Progresso das metas</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">Metas ativas em andamento</p>
          </div>
          <Link className="text-sm font-semibold text-[var(--brand)]" href="/admin/metas">Ver metas</Link>
        </div>
        {data.goals.length ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.goals.map((goal) => {
              const progress = calculateGoalProgress(goal.currentValue, goal.targetValue);
              return (
                <article className="rounded-2xl border border-[var(--line)] p-4" key={goal.id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium">{goal.title}</p>
                    <Target aria-hidden="true" className="shrink-0 text-[var(--brand)]" size={17} />
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e7ebe8]">
                    <div className="h-full rounded-full bg-[var(--brand)]" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-[var(--muted)]">
                    <span>{formatCurrency(goal.currentValue)}</span>
                    <span>{formatPercentage(progress)}%</span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : <div className="mt-5"><EmptyState message="Nenhuma meta ativa." /></div>}
      </section>
    </>
  );
}
