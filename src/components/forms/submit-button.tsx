"use client";

import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

type SubmitButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  pendingLabel?: string;
};

export function SubmitButton({
  children,
  className,
  pendingLabel = "Salvando...",
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className={className}
      disabled={pending || props.disabled}
      type="submit"
      {...props}
    >
      {pending ? <LoaderCircle aria-hidden="true" className="animate-spin" size={16} /> : null}
      {pending ? pendingLabel : children}
    </button>
  );
}
