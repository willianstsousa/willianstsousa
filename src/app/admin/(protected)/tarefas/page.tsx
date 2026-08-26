import { CalendarDays, Check, Filter, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskPriority,
  type TaskStatus,
} from "@/db/schema";
import {
  completeTaskAction,
  createTaskAction,
  deleteTaskAction,
  updateTaskAction,
} from "@/app/admin/_actions/tasks";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { ActionForm } from "@/components/forms/action-form";
import { SubmitButton } from "@/components/forms/submit-button";
import {
  taskPriorityLabels,
  taskStatusClass,
  taskStatusLabels,
} from "@/lib/admin/labels";
import { getTasks } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth/authorization";
import { todayInBrazil } from "@/lib/date";
import { formatDate } from "@/lib/format";

type TasksPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type TaskRow = Awaited<ReturnType<typeof getTasks>>[number];

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function validStatus(value?: string): TaskStatus | undefined {
  return TASK_STATUSES.find((item) => item === value);
}

function validPriority(value?: string): TaskPriority | undefined {
  return TASK_PRIORITIES.find((item) => item === value);
}

function TaskFields({ task }: { task?: TaskRow }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="sm:col-span-2">
        <span className="mb-1.5 block text-sm font-medium">Título</span>
        <input className="field" defaultValue={task?.title} maxLength={160} name="title" placeholder="O que precisa ser feito?" required />
      </label>
      <label className="sm:col-span-2">
        <span className="mb-1.5 block text-sm font-medium">Descrição</span>
        <textarea className="textarea" defaultValue={task?.description ?? ""} maxLength={3000} name="description" placeholder="Contexto opcional" />
      </label>
      <label>
        <span className="mb-1.5 block text-sm font-medium">Status</span>
        <select className="select" defaultValue={task?.status ?? "TODO"} name="status">
          {TASK_STATUSES.map((status) => <option key={status} value={status}>{taskStatusLabels[status]}</option>)}
        </select>
      </label>
      <label>
        <span className="mb-1.5 block text-sm font-medium">Prioridade</span>
        <select className="select" defaultValue={task?.priority ?? "MEDIUM"} name="priority">
          {TASK_PRIORITIES.map((priority) => <option key={priority} value={priority}>{taskPriorityLabels[priority]}</option>)}
        </select>
      </label>
      <label className="sm:col-span-2">
        <span className="mb-1.5 block text-sm font-medium">Data limite</span>
        <input className="field" defaultValue={task?.dueDate ?? ""} name="dueDate" type="date" />
      </label>
    </div>
  );
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const status = validStatus(single(params.status));
  const priority = validPriority(single(params.priority));
  const rawDate = single(params.data);
  const dueDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDate ?? "") ? rawDate : undefined;
  const taskRows = await getTasks({ status, priority, dueDate });
  const today = todayInBrazil();

  return (
    <>
      <PageHeader description="Capture, priorize e conclua o que move o dia adiante." title="Tarefas" />

      <details className="panel mb-6 p-5 sm:p-6">
        <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold">
          <Plus aria-hidden="true" className="text-[var(--brand)]" size={19} /> Nova tarefa
        </summary>
        <ActionForm action={createTaskAction} className="mt-6">
          <TaskFields />
          <SubmitButton className="button mt-5" pendingLabel="Criando...">Criar tarefa</SubmitButton>
        </ActionForm>
      </details>

      <form className="panel mb-6 grid gap-3 p-4 sm:grid-cols-[1fr_1fr_1fr_auto_auto] sm:items-end" method="get">
        <label>
          <span className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Status</span>
          <select className="select" defaultValue={status ?? ""} name="status">
            <option value="">Todos</option>
            {TASK_STATUSES.map((item) => <option key={item} value={item}>{taskStatusLabels[item]}</option>)}
          </select>
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Prioridade</span>
          <select className="select" defaultValue={priority ?? ""} name="priority">
            <option value="">Todas</option>
            {TASK_PRIORITIES.map((item) => <option key={item} value={item}>{taskPriorityLabels[item]}</option>)}
          </select>
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Data</span>
          <input className="field" defaultValue={dueDate} name="data" type="date" />
        </label>
        <button className="button-secondary" type="submit"><Filter aria-hidden="true" size={16} /> Filtrar</button>
        <Link className="button-ghost" href="/admin/tarefas">Limpar</Link>
      </form>

      {taskRows.length ? (
        <section aria-label="Lista de tarefas" className="space-y-3">
          {taskRows.map((task) => {
            const overdue = Boolean(task.dueDate && task.dueDate < today && !["DONE", "CANCELLED"].includes(task.status));
            return (
              <article className="panel p-4 sm:p-5" key={task.id}>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{task.title}</h2>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${taskStatusClass(task.status, overdue)}`}>
                        {overdue ? "Atrasada" : taskStatusLabels[task.status]}
                      </span>
                      <span className="rounded-full bg-[#f1f3f2] px-2.5 py-1 text-xs text-[var(--muted)]">{taskPriorityLabels[task.priority]}</span>
                    </div>
                    {task.description ? <p className="mt-2 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-[var(--muted)]">{task.description}</p> : null}
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-[var(--muted)]"><CalendarDays aria-hidden="true" size={14} /> {formatDate(task.dueDate)}</p>
                  </div>
                  {!["DONE", "CANCELLED"].includes(task.status) ? (
                    <ActionForm action={completeTaskAction.bind(null, task.id)}>
                      <SubmitButton className="button-secondary whitespace-nowrap" pendingLabel="Concluindo..."><Check aria-hidden="true" size={16} /> Concluir</SubmitButton>
                    </ActionForm>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--line)] pt-4">
                  <details className="w-full">
                    <summary className="button-ghost w-fit cursor-pointer list-none"><Pencil aria-hidden="true" size={15} /> Editar</summary>
                    <ActionForm action={updateTaskAction.bind(null, task.id)} className="mt-4 rounded-xl bg-[#f7f9f7] p-4">
                      <TaskFields task={task} />
                      <SubmitButton className="button mt-4">Salvar alterações</SubmitButton>
                    </ActionForm>
                  </details>
                  <details>
                    <summary className="button-ghost cursor-pointer list-none text-[var(--danger)]"><Trash2 aria-hidden="true" size={15} /> Excluir</summary>
                    <ActionForm action={deleteTaskAction.bind(null, task.id)} className="mt-2 rounded-xl border border-[#f3c7c3] bg-[#fff8f7] p-3">
                      <p className="mb-3 text-sm">Excluir esta tarefa permanentemente?</p>
                      <SubmitButton className="button-danger" pendingLabel="Excluindo...">Confirmar exclusão</SubmitButton>
                    </ActionForm>
                  </details>
                </div>
              </article>
            );
          })}
        </section>
      ) : <EmptyState message="Nenhuma tarefa encontrada para estes filtros." />}
    </>
  );
}
