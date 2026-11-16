import type { LucideIcon } from "lucide-react";
import { Delta } from "@/components/report/delta";
import { Sparkline } from "@/components/report/sparkline";
import { cardClass } from "@/components/report/section";

export function KpiCard({
  label,
  value,
  delta,
  phrase,
  series,
  icon: Icon,
  invert = false,
  points = false,
  hint,
  color,
}: {
  label: string;
  value: string;
  delta: number | null;
  phrase: string;
  series: number[];
  icon: LucideIcon;
  invert?: boolean;
  points?: boolean;
  hint?: string;
  color: string;
}) {
  return (
    <article className={`${cardClass} flex flex-col p-4 sm:p-5`}>
      <div className="flex items-start justify-between gap-3">
        <p className="min-h-10 text-sm font-medium leading-5 text-muted-foreground">{label}</p>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="kpi-value mt-3 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <Delta value={delta} invert={invert} points={points} title={hint} className="text-sm" />
          <p className="mt-0.5 text-xs text-muted-foreground">{phrase}</p>
        </div>
        <Sparkline data={series} color={color} />
      </div>
    </article>
  );
}
