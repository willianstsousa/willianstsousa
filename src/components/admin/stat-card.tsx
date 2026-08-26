import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  detail?: string;
  icon: LucideIcon;
  label: string;
  tone?: "danger" | "default" | "positive" | "warning";
  value: string;
};

const tones = {
  default: "bg-[#edf1ef] text-[var(--foreground)]",
  positive: "bg-[var(--brand-soft)] text-[var(--brand)]",
  danger: "bg-[#fff0ee] text-[var(--danger)]",
  warning: "bg-[#fff7e8] text-[var(--warning)]",
};

export function StatCard({ detail, icon: Icon, label, tone = "default", value }: StatCardProps) {
  return (
    <article className="panel p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
        <span className={`grid size-9 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon aria-hidden="true" size={18} />
        </span>
      </div>
      <p className="mt-5 text-2xl font-semibold tracking-tight">{value}</p>
      {detail ? <p className="mt-2 text-xs text-[var(--muted)]">{detail}</p> : null}
    </article>
  );
}
