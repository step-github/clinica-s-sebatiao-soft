"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartFrame } from "@/components/report/chart-frame";
import { ChartTooltip } from "@/components/report/chart-tooltip";
import { Delta } from "@/components/report/delta";
import { Sparkline } from "@/components/report/sparkline";
import { cardClass } from "@/components/report/section";
import { useChartPalette } from "@/components/theme";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { formatNumberPT, formatPercentPT } from "@/lib/format";
import {
  getComparison,
  getSpecialtyNote,
  getSpecialtySeries,
  type ComparisonMode,
  type SpecialtyRow,
} from "@/lib/mock-data";

type SortKey = "name" | "consultas" | "delta" | "exames";

export function SpecialtyTable({ monthId, mode }: { monthId: string; mode: ComparisonMode }) {
  const comparison = getComparison(monthId, mode);
  const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" } | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = comparison.current.specialties.map((specialty) => ({
    ...specialty,
    delta: comparison.specialtyDelta[specialty.id],
    series: getSpecialtySeries(monthId, specialty.id).map((point) => point.consultas),
  }));

  const ranked = [...rows].sort((a, b) => (b.delta ?? -Infinity) - (a.delta ?? -Infinity));
  const rises = new Set(ranked.filter((row) => (row.delta ?? 0) > 0.05).slice(0, 3).map((row) => row.id));
  const drops = new Set(
    [...ranked]
      .sort((a, b) => (a.delta ?? Infinity) - (b.delta ?? Infinity))
      .filter((row) => (row.delta ?? 0) < -0.05)
      .slice(0, 3)
      .map((row) => row.id),
  );

  const sorted = [...rows].sort((a, b) => {
    if (!sort) return 0;
    const factor = sort.direction === "asc" ? 1 : -1;
    if (sort.key === "name") return a.name.localeCompare(b.name, "pt") * factor;
    const left = sort.key === "delta" ? (a.delta ?? 0) : a[sort.key];
    const right = sort.key === "delta" ? (b.delta ?? 0) : b[sort.key];
    return (left - right) * factor;
  });

  const selected = rows.find((row) => row.id === openId) ?? null;

  function toggleSort(key: SortKey) {
    setSort((current) => {
      if (current?.key !== key) return { key, direction: key === "name" ? "asc" : "desc" };
      if (current.direction === "desc") return { key, direction: "asc" };
      return null;
    });
  }

  return (
    <>
      <div className={`${cardClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <SortHeader label="Especialidade" sortKey="name" sort={sort} onSort={toggleSort} />
                <SortHeader label="Consultas" sortKey="consultas" sort={sort} onSort={toggleSort} align="right" />
                <SortHeader label="Variação" sortKey="delta" sort={sort} onSort={toggleSort} align="right" />
                <SortHeader label="Exames associados" sortKey="exames" sort={sort} onSort={toggleSort} align="right" />
                <th className="px-4 py-3 font-medium">12 meses</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer border-b border-border/70 transition-colors last:border-0 hover:bg-muted/60"
                  onClick={() => setOpenId(row.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setOpenId(row.id);
                    }
                  }}
                  tabIndex={0}
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{row.name}</span>
                      {rises.has(row.id) ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                          Maior subida
                        </span>
                      ) : null}
                      {drops.has(row.id) ? (
                        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-800 dark:bg-rose-950 dark:text-rose-200">
                          Maior descida
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatNumberPT(row.consultas)}</td>
                  <td className="px-4 py-3 text-right">
                    <Delta value={row.delta} className="justify-end text-sm" />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatNumberPT(row.exames)}</td>
                  <td className="px-4 py-3">
                    <Sparkline data={row.series} />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-border bg-muted/40 font-medium">
              <tr>
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatNumberPT(comparison.current.consultas)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Delta value={comparison.deltas.consultas} className="justify-end text-sm" />
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatNumberPT(comparison.current.exames)}
                </td>
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <Sheet open={selected !== null} onOpenChange={(open) => !open && setOpenId(null)}>
        {selected ? (
          <SheetContent title={selected.name}>
            <SpecialtyDetail monthId={monthId} mode={mode} specialty={selected} />
          </SheetContent>
        ) : null}
      </Sheet>
    </>
  );
}

function SortHeader({
  label,
  sortKey,
  sort,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  sort: { key: SortKey; direction: "asc" | "desc" } | null;
  onSort: (key: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = sort?.key === sortKey;
  const Icon = !active ? ArrowUpDown : sort.direction === "asc" ? ArrowUp : ArrowDown;
  return (
    <th className={`px-4 py-3 font-medium ${align === "right" ? "text-right" : ""}`}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 uppercase ${align === "right" ? "ml-auto" : ""}`}
      >
        {label}
        <Icon className="h-3.5 w-3.5" />
      </button>
    </th>
  );
}

function SpecialtyDetail({
  monthId,
  mode,
  specialty,
}: {
  monthId: string;
  mode: ComparisonMode;
  specialty: SpecialtyRow & { delta: number | null };
}) {
  const palette = useChartPalette();
  const comparison = getComparison(monthId, mode);
  const series = getSpecialtySeries(monthId, specialty.id);
  const doctors = comparison.current.doctors
    .filter((doctor) => doctor.specialtyId === specialty.id && doctor.active)
    .sort((a, b) => b.consultas - a.consultas);
  const note = getSpecialtyNote(monthId, specialty.id);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-muted/70 p-3">
          <p className="text-xs text-muted-foreground">Consultas</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{formatNumberPT(specialty.consultas)}</p>
          <Delta value={specialty.delta} className="mt-1 text-sm" />
        </div>
        <div className="rounded-xl bg-muted/70 p-3">
          <p className="text-xs text-muted-foreground">Taxa de faltas</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{formatPercentPT(specialty.faltas)}</p>
        </div>
      </div>

      {note ? (
        <p className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm leading-6 text-foreground">
          {note}
        </p>
      ) : null}

      <div>
        <h3 className="mb-2 text-sm font-medium">Evolução de 12 meses</h3>
        <ChartFrame height={192}>
          {({ width, height }) => (
            <LineChart width={width} height={height} data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={palette.grid} vertical={false} />
              <XAxis dataKey="tick" tick={{ fill: palette.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: palette.axis, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={40}
                tickFormatter={(value) => formatNumberPT(Number(value))}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="consultas"
                name="Consultas"
                stroke={palette.consultas}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          )}
        </ChartFrame>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">Médicos</h3>
        <ul className="divide-y divide-border">
          {doctors.map((doctor) => (
            <li key={doctor.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <div>
                <p className="font-medium">{doctor.name}</p>
                <p className="text-xs text-muted-foreground">
                  Ocupação da agenda {formatPercentPT(doctor.ocupacao, 0)}
                </p>
              </div>
              <p className="tabular-nums">{formatNumberPT(doctor.consultas)}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
