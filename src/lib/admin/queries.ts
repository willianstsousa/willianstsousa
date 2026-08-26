import "server-only";

import {
  and,
  asc,
  desc,
  eq,
  gte,
  lt,
  lte,
  notInArray,
  type SQL,
} from "drizzle-orm";

import {
  financialCategories,
  goals,
  tasks,
  transactions,
  type TaskPriority,
  type TaskStatus,
  type TransactionType,
} from "@/db/schema";
import { getDb } from "@/db";
import { requireAdmin } from "@/lib/auth/authorization";
import { getMonthRange, todayInBrazil } from "@/lib/date";
import {
  calculateFinancialSummary,
  centsToDecimal,
} from "@/lib/finance";
import { decimalToCents } from "@/lib/validation/admin";

export type TaskFilters = {
  dueDate?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
};

export type TransactionFilters = {
  categoryId?: string;
  month: string;
  type?: TransactionType;
};

function whereAll(conditions: SQL[]): SQL | undefined {
  return conditions.length ? and(...conditions) : undefined;
}

export async function getTasks(filters: TaskFilters = {}) {
  await requireAdmin();
  const conditions: SQL[] = [];

  if (filters.status) conditions.push(eq(tasks.status, filters.status));
  if (filters.priority) conditions.push(eq(tasks.priority, filters.priority));
  if (filters.dueDate) conditions.push(eq(tasks.dueDate, filters.dueDate));

  return getDb()
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
      completedAt: tasks.completedAt,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
    })
    .from(tasks)
    .where(whereAll(conditions))
    .orderBy(asc(tasks.status), asc(tasks.dueDate), desc(tasks.createdAt));
}

export async function getCategories(type?: TransactionType) {
  await requireAdmin();
  return getDb()
    .select({
      id: financialCategories.id,
      name: financialCategories.name,
      type: financialCategories.type,
      createdAt: financialCategories.createdAt,
    })
    .from(financialCategories)
    .where(type ? eq(financialCategories.type, type) : undefined)
    .orderBy(asc(financialCategories.type), asc(financialCategories.name));
}

export async function getTransactions(filters: TransactionFilters) {
  await requireAdmin();
  const { start, end } = getMonthRange(filters.month);
  const conditions: SQL[] = [
    gte(transactions.date, start),
    lt(transactions.date, end),
  ];

  if (filters.type) conditions.push(eq(transactions.type, filters.type));
  if (filters.categoryId) conditions.push(eq(transactions.categoryId, filters.categoryId));

  return getDb()
    .select({
      id: transactions.id,
      description: transactions.description,
      amount: transactions.amount,
      type: transactions.type,
      categoryId: transactions.categoryId,
      categoryName: financialCategories.name,
      date: transactions.date,
      notes: transactions.notes,
      createdAt: transactions.createdAt,
    })
    .from(transactions)
    .innerJoin(financialCategories, eq(financialCategories.id, transactions.categoryId))
    .where(whereAll(conditions))
    .orderBy(desc(transactions.date), desc(transactions.createdAt));
}

export async function getFinanceData(filters: TransactionFilters) {
  await requireAdmin();
  const { start, end } = getMonthRange(filters.month);
  const db = getDb();

  const [monthTransactions, filteredTransactions, categories] = await Promise.all([
    db
      .select({
        amount: transactions.amount,
        type: transactions.type,
        categoryId: transactions.categoryId,
        categoryName: financialCategories.name,
      })
      .from(transactions)
      .innerJoin(financialCategories, eq(financialCategories.id, transactions.categoryId))
      .where(and(gte(transactions.date, start), lt(transactions.date, end))),
    getTransactions(filters),
    getCategories(),
  ]);

  const categoryTotals = new Map<
    string,
    { amount: bigint; categoryId: string; categoryName: string; type: TransactionType }
  >();

  for (const transaction of monthTransactions) {
    const key = `${transaction.type}:${transaction.categoryId}`;
    const current = categoryTotals.get(key);
    const amount = decimalToCents(transaction.amount);
    categoryTotals.set(key, {
      amount: (current?.amount ?? 0n) + amount,
      categoryId: transaction.categoryId,
      categoryName: transaction.categoryName,
      type: transaction.type,
    });
  }

  const breakdown = Array.from(categoryTotals.values())
    .map((item) => ({ ...item, amount: centsToDecimal(item.amount) }))
    .sort((a, b) => Number(b.amount) - Number(a.amount));

  return {
    summary: calculateFinancialSummary(monthTransactions),
    transactions: filteredTransactions,
    categories,
    breakdown,
  };
}

export async function getGoals() {
  await requireAdmin();
  return getDb()
    .select({
      id: goals.id,
      title: goals.title,
      description: goals.description,
      type: goals.type,
      targetValue: goals.targetValue,
      currentValue: goals.currentValue,
      deadline: goals.deadline,
      status: goals.status,
      createdAt: goals.createdAt,
      updatedAt: goals.updatedAt,
    })
    .from(goals)
    .orderBy(asc(goals.status), asc(goals.deadline), desc(goals.createdAt));
}

export async function getDashboardData(month: string) {
  await requireAdmin();
  const db = getDb();
  const today = todayInBrazil();
  const { start, end } = getMonthRange(month);
  const openTaskCondition = notInArray(tasks.status, ["DONE", "CANCELLED"]);

  const [monthTransactions, openTasks, activeGoals, recentTransactions, upcomingTasks] =
    await Promise.all([
      db
        .select({ amount: transactions.amount, type: transactions.type })
        .from(transactions)
        .where(and(gte(transactions.date, start), lt(transactions.date, end))),
      db
        .select({ id: tasks.id, dueDate: tasks.dueDate })
        .from(tasks)
        .where(openTaskCondition),
      db
        .select({
          id: goals.id,
          title: goals.title,
          currentValue: goals.currentValue,
          targetValue: goals.targetValue,
        })
        .from(goals)
        .where(eq(goals.status, "ACTIVE"))
        .orderBy(asc(goals.deadline))
        .limit(5),
      db
        .select({
          id: transactions.id,
          description: transactions.description,
          amount: transactions.amount,
          type: transactions.type,
          date: transactions.date,
          categoryName: financialCategories.name,
        })
        .from(transactions)
        .innerJoin(financialCategories, eq(financialCategories.id, transactions.categoryId))
        .orderBy(desc(transactions.date), desc(transactions.createdAt))
        .limit(5),
      db
        .select({
          id: tasks.id,
          title: tasks.title,
          priority: tasks.priority,
          dueDate: tasks.dueDate,
          status: tasks.status,
        })
        .from(tasks)
        .where(and(openTaskCondition, gte(tasks.dueDate, today)))
        .orderBy(asc(tasks.dueDate))
        .limit(5),
    ]);

  return {
    summary: calculateFinancialSummary(monthTransactions),
    pendingTasks: openTasks.length,
    overdueTasks: openTasks.filter((task) => task.dueDate && task.dueDate < today).length,
    goals: activeGoals,
    recentTransactions,
    upcomingTasks,
  };
}

export async function getOverdueTaskCount(): Promise<number> {
  await requireAdmin();
  const today = todayInBrazil();
  const rows = await getDb()
    .select({ id: tasks.id })
    .from(tasks)
    .where(
      and(
        notInArray(tasks.status, ["DONE", "CANCELLED"]),
        lte(tasks.dueDate, today),
      ),
    );
  return rows.length;
}
