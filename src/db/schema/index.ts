import { relations } from "drizzle-orm";
import {
  date,
  index,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE", "CANCELLED"] as const;
export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;
export const TRANSACTION_TYPES = ["INCOME", "EXPENSE"] as const;
export const GOAL_TYPES = ["FINANCIAL", "PERSONAL", "PROJECT", "OTHER"] as const;
export const GOAL_STATUSES = ["ACTIVE", "COMPLETED", "CANCELLED"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type TransactionType = (typeof TRANSACTION_TYPES)[number];
export type GoalType = (typeof GOAL_TYPES)[number];
export type GoalStatus = (typeof GOAL_STATUSES)[number];

export const taskStatusEnum = pgEnum("task_status", TASK_STATUSES);
export const taskPriorityEnum = pgEnum("task_priority", TASK_PRIORITIES);
export const transactionTypeEnum = pgEnum("transaction_type", TRANSACTION_TYPES);
export const goalTypeEnum = pgEnum("goal_type", GOAL_TYPES);
export const goalStatusEnum = pgEnum("goal_status", GOAL_STATUSES);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 160 }).notNull(),
    description: text("description"),
    status: taskStatusEnum("status").default("TODO").notNull(),
    priority: taskPriorityEnum("priority").default("MEDIUM").notNull(),
    dueDate: date("due_date", { mode: "string" }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index("tasks_status_idx").on(table.status),
    index("tasks_due_date_idx").on(table.dueDate),
  ],
);

export const financialCategories = pgTable(
  "financial_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 80 }).notNull(),
    type: transactionTypeEnum("type").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("financial_categories_name_type_unique").on(table.name, table.type),
    index("financial_categories_type_idx").on(table.type),
  ],
);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    description: varchar("description", { length: 180 }).notNull(),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    type: transactionTypeEnum("type").notNull(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => financialCategories.id, { onDelete: "restrict" }),
    date: date("date", { mode: "string" }).notNull(),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [
    index("transactions_date_idx").on(table.date),
    index("transactions_type_idx").on(table.type),
    index("transactions_category_idx").on(table.categoryId),
  ],
);

export const goals = pgTable(
  "goals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 160 }).notNull(),
    description: text("description"),
    type: goalTypeEnum("type").notNull(),
    targetValue: numeric("target_value", { precision: 14, scale: 2 }).notNull(),
    currentValue: numeric("current_value", { precision: 14, scale: 2 }).default("0").notNull(),
    deadline: date("deadline", { mode: "string" }),
    status: goalStatusEnum("status").default("ACTIVE").notNull(),
    ...timestamps,
  },
  (table) => [
    index("goals_status_idx").on(table.status),
    index("goals_deadline_idx").on(table.deadline),
  ],
);

export const financialCategoriesRelations = relations(financialCategories, ({ many }) => ({
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  category: one(financialCategories, {
    fields: [transactions.categoryId],
    references: [financialCategories.id],
  }),
}));
