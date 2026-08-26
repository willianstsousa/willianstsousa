export type ActionState = {
  message: string;
  status: "error" | "idle" | "success";
};

export const INITIAL_ACTION_STATE: ActionState = {
  message: "",
  status: "idle",
};

export type FormAction = (
  previousState: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export function actionError(message = "Não foi possível concluir a operação."): ActionState {
  return { status: "error", message };
}

export function actionSuccess(message: string): ActionState {
  return { status: "success", message };
}
