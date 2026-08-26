"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";

import {
  CategoryInUseError,
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/admin/mutations";
import { requireAdmin } from "@/lib/auth/authorization";
import { actionError, actionSuccess, type ActionState } from "@/lib/forms/action-state";
import {
  categoryInputSchema,
  firstValidationMessage,
  idSchema,
} from "@/lib/validation/admin";

function categoryData(formData: FormData) {
  return { name: formData.get("name"), type: formData.get("type") };
}

function categoryPaths(): void {
  revalidatePath("/admin/financeiro");
  revalidatePath("/admin/financeiro/categorias");
}

export async function createCategoryAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = categoryInputSchema.safeParse(categoryData(formData));
  if (!parsed.success) return actionError(firstValidationMessage(parsed.error));

  try {
    await createCategory(parsed.data);
    categoryPaths();
    return actionSuccess("Categoria criada.");
  } catch (error) {
    unstable_rethrow(error);
    return actionError("Não foi possível criar. Verifique se a categoria já existe.");
  }
}

export async function updateCategoryAction(
  id: string,
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsedId = idSchema.safeParse(id);
  const parsed = categoryInputSchema.safeParse(categoryData(formData));
  if (!parsedId.success) return actionError(firstValidationMessage(parsedId.error));
  if (!parsed.success) return actionError(firstValidationMessage(parsed.error));

  try {
    await updateCategory(parsedId.data, parsed.data);
    categoryPaths();
    return actionSuccess("Categoria atualizada.");
  } catch (error) {
    unstable_rethrow(error);
    return actionError("Não foi possível atualizar a categoria.");
  }
}

export async function deleteCategoryAction(
  id: string,
  _previousState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return actionError(firstValidationMessage(parsedId.error));

  try {
    await deleteCategory(parsedId.data);
    categoryPaths();
    return actionSuccess("Categoria excluída.");
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof CategoryInUseError) return actionError(error.message);
    return actionError("Não foi possível excluir a categoria.");
  }
}
