import "server-only";

import { and, eq } from "drizzle-orm";

import {
  financialCategories,
  goals,
  tasks,
  transactions,
  type GoalStatus,
  type GoalType,
  type TaskPriority,
  type TaskStatus,
  type TransactionType,
} from "@/db/schema";
import { getDb } from "@/db";
import { requireAdmin } from "@/lib/auth/authorization";

export class CategoryInUseError extends Error {}
export class CategoryTypeMismatchError extends Error {}
export class ResourceNotFoundError extends Error {}

type TaskInput = {
  description: string | null;
  dueDate: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  title: string;
};

type CategoryInput = {
  name: string;
  type: TransactionType;
};

type TransactionInput = {
  amount: string;
  categoryId: string;
  date: string;
  description: string;
  notes: string | null;
  type: TransactionType;
};

type GoalInput = {
  currentValue: string;
  deadline: string | null;
  description: string | null;
  status: GoalStatus;
  targetValue: string;
  title: string;
  type: GoalType;
};

function completedAtForStatus(status: TaskStatus): Date | null {
  return status === "DONE" ? new Date() : null;
}

async function assertCategoryMatchesType(
  categoryId: string,
  type: TransactionType,
): Promise<void> {
  const [category] = await getDb()
    .select({ type: financialCategories.type })
    .from(financialCategories)
    .where(eq(financialCategories.id, categoryId))
    .limit(1);

  if (!category) throw new ResourceNotFoundError("Categoria não encontrada.");
  if (category.type !== type) {
    throw new CategoryTypeMismatchError("A categoria não corresponde ao tipo da movimentação.");
  }
}

export async function createTask(input: TaskInput): Promise<void> {
  await requireAdmin();
  await getDb().insert(tasks).values({
    ...input,
    completedAt: completedAtForStatus(input.status),
  });
}

export async function updateTask(id: string, input: TaskInput): Promise<void> {
  await requireAdmin();
  const rows = await getDb()
    .update(tasks)
    .set({
      ...input,
      completedAt: completedAtForStatus(input.status),
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, id))
    .returning({ id: tasks.id });
  if (!rows.length) throw new ResourceNotFoundError("Tarefa não encontrada.");
}

export async function completeTask(id: string): Promise<void> {
  await requireAdmin();
  const rows = await getDb()
    .update(tasks)
    .set({ status: "DONE", completedAt: new Date(), updatedAt: new Date() })
    .where(eq(tasks.id, id))
    .returning({ id: tasks.id });
  if (!rows.length) throw new ResourceNotFoundError("Tarefa não encontrada.");
}

export async function deleteTask(id: string): Promise<void> {
  await requireAdmin();
  const rows = await getDb().delete(tasks).where(eq(tasks.id, id)).returning({ id: tasks.id });
  if (!rows.length) throw new ResourceNotFoundError("Tarefa não encontrada.");
}

export async function createCategory(input: CategoryInput): Promise<void> {
  await requireAdmin();
  await getDb().insert(financialCategories).values(input);
}

export async function updateCategory(id: string, input: CategoryInput): Promise<void> {
  await requireAdmin();
  const rows = await getDb()
    .update(financialCategories)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(financialCategories.id, id))
    .returning({ id: financialCategories.id });
  if (!rows.length) throw new ResourceNotFoundError("Categoria não encontrada.");
}

export async function deleteCategory(id: string): Promise<void> {
  await requireAdmin();
  const [usage] = await getDb()
    .select({ id: transactions.id })
    .from(transactions)
    .where(eq(transactions.categoryId, id))
    .limit(1);
  if (usage) throw new CategoryInUseError("A categoria possui movimentações vinculadas.");

  const rows = await getDb()
    .delete(financialCategories)
    .where(eq(financialCategories.id, id))
    .returning({ id: financialCategories.id });
  if (!rows.length) throw new ResourceNotFoundError("Categoria não encontrada.");
}

export async function createTransaction(input: TransactionInput): Promise<void> {
  await requireAdmin();
  await assertCategoryMatchesType(input.categoryId, input.type);
  await getDb().insert(transactions).values(input);
}

export async function updateTransaction(id: string, input: TransactionInput): Promise<void> {
  await requireAdmin();
  await assertCategoryMatchesType(input.categoryId, input.type);
  const rows = await getDb()
    .update(transactions)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(transactions.id, id))
    .returning({ id: transactions.id });
  if (!rows.length) throw new ResourceNotFoundError("Movimentação não encontrada.");
}

export async function deleteTransaction(id: string): Promise<void> {
  await requireAdmin();
  const rows = await getDb()
    .delete(transactions)
    .where(eq(transactions.id, id))
    .returning({ id: transactions.id });
  if (!rows.length) throw new ResourceNotFoundError("Movimentação não encontrada.");
}

export async function createGoal(input: GoalInput): Promise<void> {
  await requireAdmin();
  await getDb().insert(goals).values(input);
}

export async function updateGoal(id: string, input: GoalInput): Promise<void> {
  await requireAdmin();
  const rows = await getDb()
    .update(goals)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(goals.id, id))
    .returning({ id: goals.id });
  if (!rows.length) throw new ResourceNotFoundError("Meta não encontrada.");
}

export async function updateGoalCurrentValue(id: string, currentValue: string): Promise<void> {
  await requireAdmin();
  const rows = await getDb()
    .update(goals)
    .set({ currentValue, updatedAt: new Date() })
    .where(and(eq(goals.id, id), eq(goals.status, "ACTIVE")))
    .returning({ id: goals.id });
  if (!rows.length) throw new ResourceNotFoundError("Meta ativa não encontrada.");
}

export async function deleteGoal(id: string): Promise<void> {
  await requireAdmin();
  const rows = await getDb().delete(goals).where(eq(goals.id, id)).returning({ id: goals.id });
  if (!rows.length) throw new ResourceNotFoundError("Meta não encontrada.");
}
