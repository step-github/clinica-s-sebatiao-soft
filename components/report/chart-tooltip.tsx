import { formatNumberPT, formatPercentPT } from "@/lib/format";

type Item = {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
};

export function ChartTooltip({
  active,
  payload,
  label,
  percent,
}: {
  active?: boolean;
  payload?: Item[];
  label?: string;
  percent?: boolean;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lg">
      {label ? <p className="mb-1 font-medium">{label}</p> : null}
      <div className="space-y-1">
        {payload
          .filter((item) => item.value !== undefined && item.value !== null)
          .map((item) => (
            <p key={String(item.dataKey)} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
              <span className="text-muted-foreground">{item.name}</span>
              <span className="ml-auto tabular-nums font-medium">
                {percent ? formatPercentPT(Number(item.value)) : formatNumberPT(Number(item.value))}
              </span>
            </p>
          ))}
      </div>
    </div>
  );
}
