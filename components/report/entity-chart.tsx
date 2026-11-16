"use client";

import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { ChartFrame } from "@/components/report/chart-frame";
import { ChartTooltip } from "@/components/report/chart-tooltip";
import { Delta } from "@/components/report/delta";
import { cardClass } from "@/components/report/section";
import { useDark } from "@/components/theme";
import { formatNumberPT, formatPercentPT } from "@/lib/format";
import { atividade, getComparison, percentShares, type ComparisonMode } from "@/lib/mock-data";

const LIGHT = ["#0b3d4d", "#1a9b8e", "#d08a3a", "#3d5a99", "#7c8ea0", "#0ea5e9", "#155e75", "#c4b5a0", "#3f6f54", "#94a3b8"];
const DARK = ["#7dd3e8", "#2dd4bf", "#f0b429", "#93c5fd", "#cbd5e1", "#38bdf8", "#5eead4", "#e7d7c4", "#6ee7b7", "#94a3b8"];

export function EntityChart({ monthId, mode }: { monthId: string; mode: ComparisonMode }) {
  const dark = useDark();
  const colors = dark ? DARK : LIGHT;
  const comparison = getComparison(monthId, mode);
  const shares = percentShares(comparison.current.entities.map((entity) => entity.value));
  const rows = comparison.current.entities
    .map((entity, index) => ({
      ...entity,
      share: shares[index],
      delta: comparison.entityDelta[entity.id],
      color: colors[index % colors.length],
    }))
    .sort((a, b) => b.value - a.value);
  const total = atividade(comparison.current);

  return (
    <div className={`${cardClass} p-4 sm:p-5`}>
      <div className="grid items-center gap-6 lg:grid-cols-[260px_1fr]">
        <ChartFrame height={256}>
          {({ width, height }) => (
            <PieChart width={width} height={height}>
              <Pie data={rows} dataKey="value" nameKey="name" innerRadius={68} outerRadius={96} paddingAngle={2} stroke="none">
                {rows.map((row) => (
                  <Cell key={row.id} fill={row.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          )}
        </ChartFrame>
        <div>
          <p className="mb-3 text-sm text-muted-foreground">
            Total de atos:{" "}
            <span className="font-medium text-foreground tabular-nums">{formatNumberPT(total)}</span>
            <span className="ml-2">Consultas, exames e cirurgias de ambulatório.</span>
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {rows.map((row) => (
              <li key={row.id} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: row.color }} />
                <span className="min-w-0 flex-1 truncate">{row.name}</span>
                <span className="tabular-nums text-muted-foreground">{formatPercentPT(row.share)}</span>
                <Delta value={row.delta} className="text-xs" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
