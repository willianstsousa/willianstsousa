import { Inbox } from "lucide-react";

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="panel grid min-h-44 place-items-center p-8 text-center">
      <div>
        <Inbox aria-hidden="true" className="mx-auto text-[#9aa59f]" size={30} />
        <p className="mt-3 text-sm text-[var(--muted)]">{message}</p>
      </div>
    </div>
  );
}
