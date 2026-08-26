import type {
  GoalStatus,
  GoalType,
  TaskPriority,
  TaskStatus,
  TransactionType,
} from "@/db/schema";

export const taskStatusLabels: Record<TaskStatus, string> = {
  TODO: "Pendente",
  IN_PROGRESS: "Em andamento",
  DONE: "Concluída",
  CANCELLED: "Cancelada",
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
};

export const transactionTypeLabels: Record<TransactionType, string> = {
  INCOME: "Receita",
  EXPENSE: "Despesa",
};

export const goalTypeLabels: Record<GoalType, string> = {
  FINANCIAL: "Financeira",
  PERSONAL: "Pessoal",
  PROJECT: "Projeto",
  OTHER: "Outra",
};

export const goalStatusLabels: Record<GoalStatus, string> = {
  ACTIVE: "Ativa",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
};

export function taskStatusClass(status: TaskStatus, overdue = false): string {
  if (overdue) return "bg-[#fff0ee] text-[var(--danger)]";
  if (status === "DONE") return "bg-[var(--brand-soft)] text-[var(--brand)]";
  if (status === "IN_PROGRESS") return "bg-[#eef3ff] text-[#3159a7]";
  if (status === "CANCELLED") return "bg-[#f1f2f1] text-[#6f7773]";
  return "bg-[#fff7e8] text-[var(--warning)]";
}
