"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";

import {
  CategoryTypeMismatchError,
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "@/lib/admin/mutations";
import { requireAdmin } from "@/lib/auth/authorization";
import { actionError, actionSuccess, type ActionState } from "@/lib/forms/action-state";
import {
  firstValidationMessage,
  idSchema,
  transactionInputSchema,
} from "@/lib/validation/admin";

function transactionData(formData: FormData) {
  return {
    description: formData.get("description"),
    amount: formData.get("amount"),
    type: formData.get("type"),
    categoryId: formData.get("categoryId"),
    date: formData.get("date"),
    notes: formData.get("notes"),
  };
}

function transactionPaths(): void {
  revalidatePath("/admin");
  revalidatePath("/admin/financeiro");
}

function transactionFailure(error: unknown): ActionState {
  if (error instanceof CategoryTypeMismatchError) return actionError(error.message);
  return actionError("Não foi possível salvar a movimentação.");
}

export async function createTransactionAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = transactionInputSchema.safeParse(transactionData(formData));
  if (!parsed.success) return actionError(firstValidationMessage(parsed.error));

  try {
    await createTransaction(parsed.data);
    transactionPaths();
    return actionSuccess("Movimentação criada.");
  } catch (error) {
    unstable_rethrow(error);
    return transactionFailure(error);
  }
}

export async function updateTransactionAction(
  id: string,
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsedId = idSchema.safeParse(id);
  const parsed = transactionInputSchema.safeParse(transactionData(formData));
  if (!parsedId.success) return actionError(firstValidationMessage(parsedId.error));
  if (!parsed.success) return actionError(firstValidationMessage(parsed.error));

  try {
    await updateTransaction(parsedId.data, parsed.data);
    transactionPaths();
    return actionSuccess("Movimentação atualizada.");
  } catch (error) {
    unstable_rethrow(error);
    return transactionFailure(error);
  }
}

export async function deleteTransactionAction(
  id: string,
  _previousState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return actionError(firstValidationMessage(parsedId.error));

  try {
    await deleteTransaction(parsedId.data);
    transactionPaths();
    return actionSuccess("Movimentação excluída.");
  } catch (error) {
    unstable_rethrow(error);
    return actionError("Não foi possível excluir a movimentação.");
  }
}
