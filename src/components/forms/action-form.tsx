"use client";

import { useActionState } from "react";

import {
  INITIAL_ACTION_STATE,
  type FormAction,
} from "@/lib/forms/action-state";

type ActionFormProps = Omit<React.ComponentPropsWithoutRef<"form">, "action"> & {
  action: FormAction;
};

export function ActionForm({ action, children, className, ...props }: ActionFormProps) {
  const [state, formAction] = useActionState(action, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className={className} {...props}>
      {children}
      {state.status !== "idle" ? (
        <p
          aria-live="polite"
          className={
            state.status === "error"
              ? "mt-3 text-sm text-[var(--danger)]"
              : "mt-3 text-sm text-[var(--brand)]"
          }
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
