import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

import { TRANSACTION_TYPES } from "@/db/schema";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/app/admin/_actions/categories";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { ActionForm } from "@/components/forms/action-form";
import { SubmitButton } from "@/components/forms/submit-button";
import { transactionTypeLabels } from "@/lib/admin/labels";
import { getCategories } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth/authorization";

type CategoryRow = Awaited<ReturnType<typeof getCategories>>[number];

function CategoryFields({ category }: { category?: CategoryRow }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label>
        <span className="mb-1.5 block text-sm font-medium">Nome</span>
        <input className="field" defaultValue={category?.name} maxLength={80} name="name" placeholder="Ex.: Alimentação" required />
      </label>
      <label>
        <span className="mb-1.5 block text-sm font-medium">Tipo</span>
        <select className="select" defaultValue={category?.type ?? "EXPENSE"} name="type">
          {TRANSACTION_TYPES.map((type) => <option key={type} value={type}>{transactionTypeLabels[type]}</option>)}
        </select>
      </label>
    </div>
  );
}

export default async function CategoriesPage() {
  await requireAdmin();
  const categories = await getCategories();

  return (
    <>
      <PageHeader
        actions={<Link className="button-secondary" href="/admin/financeiro">Voltar ao financeiro</Link>}
        description="Organize receitas e despesas em grupos úteis para análise."
        title="Categorias financeiras"
      />

      <details className="panel mb-6 p-5 sm:p-6">
        <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold">
          <Plus aria-hidden="true" className="text-[var(--brand)]" size={19} /> Nova categoria
        </summary>
        <ActionForm action={createCategoryAction} className="mt-6">
          <CategoryFields />
          <SubmitButton className="button mt-5" pendingLabel="Criando...">Criar categoria</SubmitButton>
        </ActionForm>
      </details>

      {categories.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {TRANSACTION_TYPES.map((type) => (
            <section className="panel p-5" key={type}>
              <h2 className="font-semibold">{type === "INCOME" ? "Receitas" : "Despesas"}</h2>
              <ul className="mt-4 divide-y divide-[var(--line)]">
                {categories.filter((category) => category.type === type).map((category) => (
                  <li className="py-3" key={category.id}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium">{category.name}</span>
                      <div className="flex items-center gap-1">
                        <details>
                          <summary aria-label={`Editar ${category.name}`} className="grid size-9 cursor-pointer list-none place-items-center rounded-lg text-[var(--muted)] hover:bg-[#f1f3f2]"><Pencil aria-hidden="true" size={15} /></summary>
                          <ActionForm action={updateCategoryAction.bind(null, category.id)} className="mt-3 rounded-xl bg-[#f7f9f7] p-4">
                            <CategoryFields category={category} />
                            <SubmitButton className="button mt-4">Salvar</SubmitButton>
                          </ActionForm>
                        </details>
                        <details>
                          <summary aria-label={`Excluir ${category.name}`} className="grid size-9 cursor-pointer list-none place-items-center rounded-lg text-[var(--danger)] hover:bg-[#fff1ef]"><Trash2 aria-hidden="true" size={15} /></summary>
                          <ActionForm action={deleteCategoryAction.bind(null, category.id)} className="mt-3 rounded-xl border border-[#f3c7c3] bg-[#fff8f7] p-3">
                            <p className="mb-3 text-sm">Só é possível excluir categorias sem movimentações.</p>
                            <SubmitButton className="button-danger" pendingLabel="Excluindo...">Confirmar</SubmitButton>
                          </ActionForm>
                        </details>
                      </div>
                    </div>
                  </li>
                ))}
                {!categories.some((category) => category.type === type) ? (
                  <li className="py-5 text-sm text-[var(--muted)]">Nenhuma categoria.</li>
                ) : null}
              </ul>
            </section>
          ))}
        </div>
      ) : <EmptyState message="Nenhuma categoria cadastrada." />}
    </>
  );
}
