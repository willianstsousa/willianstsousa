"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";

import { requireAdmin } from "@/lib/auth/authorization";
import {
  completeTask,
  createTask,
  deleteTask,
  updateTask,
} from "@/lib/admin/mutations";
import {
  actionError,
  actionSuccess,
  type ActionState,
} from "@/lib/forms/action-state";
import {
  firstValidationMessage,
  idSchema,
  taskInputSchema,
} from "@/lib/validation/admin";

function taskData(formData: FormData) {
  return {
    title: formData.get("title"),
    description: formData.get("description"),
    status: formData.get("status"),
    priority: formData.get("priority"),
    dueDate: formData.get("dueDate"),
  };
}

function taskPaths(): void {
  revalidatePath("/admin");
  revalidatePath("/admin/tarefas");
}

export async function createTaskAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = taskInputSchema.safeParse(taskData(formData));
  if (!parsed.success) return actionError(firstValidationMessage(parsed.error));

  try {
    await createTask(parsed.data);
    taskPaths();
    return actionSuccess("Tarefa criada.");
  } catch (error) {
    unstable_rethrow(error);
    return actionError();
  }
}

export async function updateTaskAction(
  id: string,
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsedId = idSchema.safeParse(id);
  const parsed = taskInputSchema.safeParse(taskData(formData));
  if (!parsedId.success) return actionError(firstValidationMessage(parsedId.error));
  if (!parsed.success) return actionError(firstValidationMessage(parsed.error));

  try {
    await updateTask(parsedId.data, parsed.data);
    taskPaths();
    return actionSuccess("Tarefa atualizada.");
  } catch (error) {
    unstable_rethrow(error);
    return actionError();
  }
}

export async function completeTaskAction(
  id: string,
  _previousState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return actionError(firstValidationMessage(parsedId.error));

  try {
    await completeTask(parsedId.data);
    taskPaths();
    return actionSuccess("Tarefa concluída.");
  } catch (error) {
    unstable_rethrow(error);
    return actionError();
  }
}

export async function deleteTaskAction(
  id: string,
  _previousState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return actionError(firstValidationMessage(parsedId.error));

  try {
    await deleteTask(parsedId.data);
    taskPaths();
    return actionSuccess("Tarefa excluída.");
  } catch (error) {
    unstable_rethrow(error);
    return actionError();
  }
}
