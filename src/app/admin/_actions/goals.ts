"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";

import {
  createGoal,
  deleteGoal,
  updateGoal,
  updateGoalCurrentValue,
} from "@/lib/admin/mutations";
import { requireAdmin } from "@/lib/auth/authorization";
import { actionError, actionSuccess, type ActionState } from "@/lib/forms/action-state";
import {
  firstValidationMessage,
  goalInputSchema,
  goalProgressInputSchema,
  idSchema,
} from "@/lib/validation/admin";

function goalData(formData: FormData) {
  return {
    title: formData.get("title"),
    description: formData.get("description"),
    type: formData.get("type"),
    targetValue: formData.get("targetValue"),
    currentValue: formData.get("currentValue"),
    deadline: formData.get("deadline"),
    status: formData.get("status"),
  };
}

function goalPaths(): void {
  revalidatePath("/admin");
  revalidatePath("/admin/metas");
}

export async function createGoalAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = goalInputSchema.safeParse(goalData(formData));
  if (!parsed.success) return actionError(firstValidationMessage(parsed.error));

  try {
    await createGoal(parsed.data);
    goalPaths();
    return actionSuccess("Meta criada.");
  } catch (error) {
    unstable_rethrow(error);
    return actionError("Não foi possível criar a meta.");
  }
}

export async function updateGoalAction(
  id: string,
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsedId = idSchema.safeParse(id);
  const parsed = goalInputSchema.safeParse(goalData(formData));
  if (!parsedId.success) return actionError(firstValidationMessage(parsedId.error));
  if (!parsed.success) return actionError(firstValidationMessage(parsed.error));

  try {
    await updateGoal(parsedId.data, parsed.data);
    goalPaths();
    return actionSuccess("Meta atualizada.");
  } catch (error) {
    unstable_rethrow(error);
    return actionError("Não foi possível atualizar a meta.");
  }
}

export async function updateGoalProgressAction(
  id: string,
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsedId = idSchema.safeParse(id);
  const parsed = goalProgressInputSchema.safeParse({
    currentValue: formData.get("currentValue"),
  });
  if (!parsedId.success) return actionError(firstValidationMessage(parsedId.error));
  if (!parsed.success) return actionError(firstValidationMessage(parsed.error));

  try {
    await updateGoalCurrentValue(parsedId.data, parsed.data.currentValue);
    goalPaths();
    return actionSuccess("Progresso atualizado.");
  } catch (error) {
    unstable_rethrow(error);
    return actionError("Não foi possível atualizar o progresso.");
  }
}

export async function deleteGoalAction(
  id: string,
  _previousState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return actionError(firstValidationMessage(parsedId.error));

  try {
    await deleteGoal(parsedId.data);
    goalPaths();
    return actionSuccess("Meta excluída.");
  } catch (error) {
    unstable_rethrow(error);
    return actionError("Não foi possível excluir a meta.");
  }
}
