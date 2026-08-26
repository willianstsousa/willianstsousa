import { CalendarDays, Pencil, Plus, Target, Trash2 } from "lucide-react";

import { GOAL_STATUSES, GOAL_TYPES } from "@/db/schema";
import {
  createGoalAction,
  deleteGoalAction,
  updateGoalAction,
  updateGoalProgressAction,
} from "@/app/admin/_actions/goals";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { ActionForm } from "@/components/forms/action-form";
import { SubmitButton } from "@/components/forms/submit-button";
import { goalStatusLabels, goalTypeLabels } from "@/lib/admin/labels";
import { getGoals } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth/authorization";
import { calculateGoalProgress } from "@/lib/finance";
import { formatCurrency, formatDate, formatPercentage } from "@/lib/format";

type GoalRow = Awaited<ReturnType<typeof getGoals>>[number];

function GoalFields({ goal }: { goal?: GoalRow }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="sm:col-span-2">
        <span className="mb-1.5 block text-sm font-medium">Título</span>
        <input className="field" defaultValue={goal?.title} maxLength={160} name="title" placeholder="Ex.: Reserva de emergência" required />
      </label>
      <label className="sm:col-span-2">
        <span className="mb-1.5 block text-sm font-medium">Descrição</span>
        <textarea className="textarea" defaultValue={goal?.description ?? ""} maxLength={3000} name="description" placeholder="Por que esta meta importa?" />
      </label>
      <label>
        <span className="mb-1.5 block text-sm font-medium">Tipo</span>
        <select className="select" defaultValue={goal?.type ?? "PERSONAL"} name="type">
          {GOAL_TYPES.map((type) => <option key={type} value={type}>{goalTypeLabels[type]}</option>)}
        </select>
      </label>
      <label>
        <span className="mb-1.5 block text-sm font-medium">Status</span>
        <select className="select" defaultValue={goal?.status ?? "ACTIVE"} name="status">
          {GOAL_STATUSES.map((status) => <option key={status} value={status}>{goalStatusLabels[status]}</option>)}
        </select>
      </label>
      <label>
        <span className="mb-1.5 block text-sm font-medium">Valor alvo</span>
        <input className="field" defaultValue={goal?.targetValue} inputMode="decimal" name="targetValue" placeholder="0,00" required />
      </label>
      <label>
        <span className="mb-1.5 block text-sm font-medium">Valor atual</span>
        <input className="field" defaultValue={goal?.currentValue ?? "0.00"} inputMode="decimal" name="currentValue" placeholder="0,00" required />
      </label>
      <label className="sm:col-span-2">
        <span className="mb-1.5 block text-sm font-medium">Prazo</span>
        <input className="field" defaultValue={goal?.deadline ?? ""} name="deadline" type="date" />
      </label>
    </div>
  );
}

export default async function GoalsPage() {
  await requireAdmin();
  const goalRows = await getGoals();

  return (
    <>
      <PageHeader description="Transforme objetivos pessoais, financeiros e de projeto em progresso visível." title="Metas" />

      <details className="panel mb-6 p-5 sm:p-6">
        <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold">
          <Plus aria-hidden="true" className="text-[var(--brand)]" size={19} /> Nova meta
        </summary>
        <ActionForm action={createGoalAction} className="mt-6">
          <GoalFields />
          <SubmitButton className="button mt-5" pendingLabel="Criando...">Criar meta</SubmitButton>
        </ActionForm>
      </details>

      {goalRows.length ? (
        <section aria-label="Lista de metas" className="grid gap-4 xl:grid-cols-2">
          {goalRows.map((goal) => {
            const progress = calculateGoalProgress(goal.currentValue, goal.targetValue);
            return (
              <article className="panel p-5" key={goal.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{goal.title}</h2>
                      <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--brand)]">{goalTypeLabels[goal.type]}</span>
                      <span className="rounded-full bg-[#f1f3f2] px-2.5 py-1 text-xs text-[var(--muted)]">{goalStatusLabels[goal.status]}</span>
                    </div>
                    {goal.description ? <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--muted)]">{goal.description}</p> : null}
                  </div>
                  <Target aria-hidden="true" className="shrink-0 text-[var(--brand)]" size={21} />
                </div>

                <div className="mt-6">
                  <div className="h-2.5 overflow-hidden rounded-full bg-[#e8ece9]">
                    <div className="h-full rounded-full bg-[var(--brand)]" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                    <span><strong>{formatCurrency(goal.currentValue)}</strong> de {formatCurrency(goal.targetValue)}</span>
                    <span className="font-semibold text-[var(--brand)]">{formatPercentage(progress)}%</span>
                  </div>
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-[var(--muted)]"><CalendarDays aria-hidden="true" size={14} /> {goal.deadline ? `Prazo: ${formatDate(goal.deadline)}` : "Sem prazo definido"}</p>
                </div>

                {goal.status === "ACTIVE" ? (
                  <ActionForm action={updateGoalProgressAction.bind(null, goal.id)} className="mt-5 flex flex-col gap-2 rounded-xl bg-[#f6f8f6] p-3 sm:flex-row sm:items-end">
                    <label className="flex-1">
                      <span className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Atualizar valor atual</span>
                      <input className="field" defaultValue={goal.currentValue} inputMode="decimal" name="currentValue" required />
                    </label>
                    <SubmitButton className="button-secondary" pendingLabel="Atualizando...">Atualizar</SubmitButton>
                  </ActionForm>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--line)] pt-4">
                  <details className="w-full">
                    <summary className="button-ghost w-fit cursor-pointer list-none"><Pencil aria-hidden="true" size={15} /> Editar</summary>
                    <ActionForm action={updateGoalAction.bind(null, goal.id)} className="mt-4 rounded-xl bg-[#f7f9f7] p-4">
                      <GoalFields goal={goal} />
                      <SubmitButton className="button mt-4">Salvar alterações</SubmitButton>
                    </ActionForm>
                  </details>
                  <details>
                    <summary className="button-ghost cursor-pointer list-none text-[var(--danger)]"><Trash2 aria-hidden="true" size={15} /> Excluir</summary>
                    <ActionForm action={deleteGoalAction.bind(null, goal.id)} className="mt-2 rounded-xl border border-[#f3c7c3] bg-[#fff8f7] p-3">
                      <p className="mb-3 text-sm">Excluir esta meta permanentemente?</p>
                      <SubmitButton className="button-danger" pendingLabel="Excluindo...">Confirmar exclusão</SubmitButton>
                    </ActionForm>
                  </details>
                </div>
              </article>
            );
          })}
        </section>
      ) : <EmptyState message="Nenhuma meta cadastrada." />}
    </>
  );
}
