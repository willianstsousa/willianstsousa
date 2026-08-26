import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  Filter,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";

import {
  TRANSACTION_TYPES,
  type TransactionType,
} from "@/db/schema";
import {
  createTransactionAction,
  deleteTransactionAction,
  updateTransactionAction,
} from "@/app/admin/_actions/transactions";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { ActionForm } from "@/components/forms/action-form";
import { SubmitButton } from "@/components/forms/submit-button";
import { transactionTypeLabels } from "@/lib/admin/labels";
import { getFinanceData } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth/authorization";
import {
  formatMonthLabel,
  normalizeMonth,
  todayInBrazil,
} from "@/lib/date";
import { formatCurrency, formatDate } from "@/lib/format";
import { idSchema } from "@/lib/validation/admin";

type FinancePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type FinanceData = Awaited<ReturnType<typeof getFinanceData>>;
type TransactionRow = FinanceData["transactions"][number];

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function validType(value?: string): TransactionType | undefined {
  return TRANSACTION_TYPES.find((item) => item === value);
}

function TransactionFields({
  categories,
  transaction,
}: {
  categories: FinanceData["categories"];
  transaction?: TransactionRow;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="sm:col-span-2">
        <span className="mb-1.5 block text-sm font-medium">Descrição</span>
        <input className="field" defaultValue={transaction?.description} maxLength={180} name="description" placeholder="Ex.: Mercado da semana" required />
      </label>
      <label>
        <span className="mb-1.5 block text-sm font-medium">Valor</span>
        <input className="field" defaultValue={transaction?.amount} inputMode="decimal" name="amount" placeholder="0,00" required />
      </label>
      <label>
        <span className="mb-1.5 block text-sm font-medium">Tipo</span>
        <select className="select" defaultValue={transaction?.type ?? "EXPENSE"} name="type">
          {TRANSACTION_TYPES.map((type) => <option key={type} value={type}>{transactionTypeLabels[type]}</option>)}
        </select>
      </label>
      <label>
        <span className="mb-1.5 block text-sm font-medium">Categoria</span>
        <select className="select" defaultValue={transaction?.categoryId ?? ""} name="categoryId" required>
          <option disabled value="">Selecione</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name} · {transactionTypeLabels[category.type]}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="mb-1.5 block text-sm font-medium">Data</span>
        <input className="field" defaultValue={transaction?.date ?? todayInBrazil()} name="date" required type="date" />
      </label>
      <label className="sm:col-span-2">
        <span className="mb-1.5 block text-sm font-medium">Observação</span>
        <textarea className="textarea" defaultValue={transaction?.notes ?? ""} maxLength={3000} name="notes" placeholder="Detalhes opcionais" />
      </label>
    </div>
  );
}

export default async function FinancePage({ searchParams }: FinancePageProps) {
  await requireAdmin();
  const params = await searchParams;
  const month = normalizeMonth(single(params.mes));
  const type = validType(single(params.tipo));
  const rawCategoryId = single(params.categoria);
  const categoryId = idSchema.safeParse(rawCategoryId).success ? rawCategoryId : undefined;
  const data = await getFinanceData({ month, type, categoryId });

  return (
    <>
      <PageHeader
        actions={<input aria-label="Mês exibido" className="field" form="finance-filters" name="mes" type="month" defaultValue={month} />}
        description="Receitas, despesas e decisões do mês em um único lugar."
        eyebrow={formatMonthLabel(month)}
        title="Financeiro"
      />

      <nav aria-label="Seções financeiras" className="mb-6 flex flex-wrap gap-2">
        <Link className="button-secondary" href={`/admin/financeiro?mes=${month}`}>Visão geral</Link>
        <Link className="button-ghost" href={`/admin/financeiro/receitas?mes=${month}`}>Receitas</Link>
        <Link className="button-ghost" href={`/admin/financeiro/despesas?mes=${month}`}>Despesas</Link>
        <Link className="button-ghost" href="/admin/financeiro/categorias">Categorias</Link>
      </nav>

      <section aria-label="Resumo financeiro" className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={ArrowUpRight} label="Receitas" tone="positive" value={formatCurrency(data.summary.income)} />
        <StatCard icon={ArrowDownRight} label="Despesas" tone="danger" value={formatCurrency(data.summary.expense)} />
        <StatCard icon={CircleDollarSign} label="Saldo" value={formatCurrency(data.summary.balance)} />
      </section>

      <details className="panel my-6 p-5 sm:p-6">
        <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold">
          <Plus aria-hidden="true" className="text-[var(--brand)]" size={19} /> Nova movimentação
        </summary>
        {data.categories.length ? (
          <ActionForm action={createTransactionAction} className="mt-6">
            <TransactionFields categories={data.categories} />
            <SubmitButton className="button mt-5" pendingLabel="Adicionando...">Adicionar movimentação</SubmitButton>
          </ActionForm>
        ) : (
          <p className="mt-5 text-sm text-[var(--warning)]">
            Crie ao menos uma <Link className="font-semibold underline" href="/admin/financeiro/categorias">categoria</Link> antes de adicionar movimentações.
          </p>
        )}
      </details>

      <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <section className="panel p-5">
          <h2 className="font-semibold">Por categoria</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">Distribuição no mês selecionado</p>
          {data.breakdown.length ? (
            <ul className="mt-5 space-y-4">
              {data.breakdown.map((item) => {
                const max = Math.max(...data.breakdown.filter((row) => row.type === item.type).map((row) => Number(row.amount)), 1);
                const width = Math.max(4, (Number(item.amount) / max) * 100);
                return (
                  <li key={`${item.type}:${item.categoryId}`}>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="truncate">{item.categoryName}</span>
                      <span className="shrink-0 font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#edf0ee]">
                      <div className={`h-full rounded-full ${item.type === "INCOME" ? "bg-[var(--brand)]" : "bg-[#d87669]"}`} style={{ width: `${width}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : <div className="mt-5"><EmptyState message="Sem dados para este mês." /></div>}
        </section>

        <section>
          <form className="panel mb-4 grid gap-3 p-4 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end" id="finance-filters" method="get">
            <label>
              <span className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Tipo</span>
              <select className="select" defaultValue={type ?? ""} name="tipo">
                <option value="">Todos</option>
                {TRANSACTION_TYPES.map((item) => <option key={item} value={item}>{transactionTypeLabels[item]}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Categoria</span>
              <select className="select" defaultValue={categoryId ?? ""} name="categoria">
                <option value="">Todas</option>
                {data.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>
            <button className="button-secondary" type="submit"><Filter aria-hidden="true" size={16} /> Filtrar</button>
            <Link className="button-ghost" href={`/admin/financeiro?mes=${month}`}>Limpar</Link>
          </form>

          {data.transactions.length ? (
            <div className="space-y-3">
              {data.transactions.map((transaction) => (
                <article className="panel p-4" key={transaction.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{transaction.description}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">{transaction.categoryName} · {formatDate(transaction.date)}</p>
                      {transaction.notes ? <p className="mt-2 text-sm text-[var(--muted)]">{transaction.notes}</p> : null}
                    </div>
                    <p className={`shrink-0 font-semibold ${transaction.type === "INCOME" ? "text-[var(--brand)]" : "text-[var(--danger)]"}`}>
                      {transaction.type === "INCOME" ? "+" : "−"} {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--line)] pt-3">
                    <details className="w-full">
                      <summary className="button-ghost w-fit cursor-pointer list-none"><Pencil aria-hidden="true" size={15} /> Editar</summary>
                      <ActionForm action={updateTransactionAction.bind(null, transaction.id)} className="mt-4 rounded-xl bg-[#f7f9f7] p-4">
                        <TransactionFields categories={data.categories} transaction={transaction} />
                        <SubmitButton className="button mt-4">Salvar alterações</SubmitButton>
                      </ActionForm>
                    </details>
                    <details>
                      <summary className="button-ghost cursor-pointer list-none text-[var(--danger)]"><Trash2 aria-hidden="true" size={15} /> Excluir</summary>
                      <ActionForm action={deleteTransactionAction.bind(null, transaction.id)} className="mt-2 rounded-xl border border-[#f3c7c3] bg-[#fff8f7] p-3">
                        <p className="mb-3 text-sm">Excluir esta movimentação permanentemente?</p>
                        <SubmitButton className="button-danger" pendingLabel="Excluindo...">Confirmar exclusão</SubmitButton>
                      </ActionForm>
                    </details>
                  </div>
                </article>
              ))}
            </div>
          ) : <EmptyState message="Nenhuma movimentação encontrada." />}
        </section>
      </div>
    </>
  );
}
