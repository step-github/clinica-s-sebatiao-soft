"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { ChartFrame } from "@/components/report/chart-frame";
import { ChartTooltip } from "@/components/report/chart-tooltip";
import { cardClass } from "@/components/report/section";
import { useChartPalette } from "@/components/theme";
import { formatNumberPT } from "@/lib/format";
import { getSeries, type ComparisonMode } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const SERIES = [
  { key: "consultas", label: "Consultas" },
  { key: "exames", label: "Exames" },
  { key: "cirurgias", label: "Cirurgias" },
] as const;

export function TrendChart({ monthId, mode }: { monthId: string; mode: ComparisonMode }) {
  const palette = useChartPalette();
  const data = getSeries(monthId);
  const homologous = mode === "homologous";
  const [visible, setVisible] = useState({ consultas: true, exames: true, cirurgias: true });
  const colors = {
    consultas: palette.consultas,
    exames: palette.exames,
    cirurgias: palette.cirurgias,
  };
  const axisTick = { fill: palette.axis, fontSize: 12 };

  return (
    <div className={`${cardClass} p-4 sm:p-5`}>
      <div className="mb-4 flex flex-wrap gap-2">
        {SERIES.map((series) => {
          const on = visible[series.key];
          return (
            <button
              key={series.key}
              type="button"
              aria-pressed={on}
              onClick={() => setVisible((current) => ({ ...current, [series.key]: !current[series.key] }))}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                on ? "border-transparent bg-muted text-foreground" : "border-border text-muted-foreground",
              )}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: colors[series.key] }} />
              {series.label}
            </button>
          );
        })}
        {homologous ? (
          <span className="inline-flex items-center text-xs text-muted-foreground">
            Tracejado: mesmo mês do ano anterior
          </span>
        ) : null}
      </div>
      <ChartFrame height={280}>
        {({ width, height }) => (
          <AreaChart width={width} height={height} data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={palette.grid} vertical={false} />
            <XAxis dataKey="tick" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis
              tick={axisTick}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => formatNumberPT(Number(value))}
              width={48}
            />
            <Tooltip content={<ChartTooltip />} />
            {visible.consultas ? (
              <Area
                type="monotone"
                dataKey="consultas"
                name="Consultas"
                stroke={palette.consultas}
                fill={palette.consultas}
                fillOpacity={0.12}
                strokeWidth={2}
                dot={false}
              />
            ) : null}
            {visible.exames ? (
              <Area
                type="monotone"
                dataKey="exames"
                name="Exames"
                stroke={palette.exames}
                fill={palette.exames}
                fillOpacity={0.08}
                strokeWidth={2}
                dot={false}
              />
            ) : null}
            {homologous && visible.consultas ? (
              <Line
                type="monotone"
                dataKey="consultasPrev"
                name="Consultas (ano anterior)"
                stroke={palette.consultas}
                strokeDasharray="5 4"
                strokeWidth={1.5}
                dot={false}
                connectNulls={false}
              />
            ) : null}
            {homologous && visible.exames ? (
              <Line
                type="monotone"
                dataKey="examesPrev"
                name="Exames (ano anterior)"
                stroke={palette.exames}
                strokeDasharray="5 4"
                strokeWidth={1.5}
                dot={false}
                connectNulls={false}
              />
            ) : null}
          </AreaChart>
        )}
      </ChartFrame>
      {visible.cirurgias ? (
        <div className="mt-5 border-t border-border pt-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Cirurgias de ambulatório</p>
          <ChartFrame height={148}>
            {({ width, height }) => (
              <LineChart width={width} height={height} data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={palette.grid} vertical={false} />
                <XAxis dataKey="tick" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis
                  tick={axisTick}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => formatNumberPT(Number(value))}
                  width={48}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="cirurgias"
                  name="Cirurgias"
                  stroke={palette.cirurgias}
                  strokeWidth={2}
                  dot={false}
                />
                {homologous ? (
                  <Line
                    type="monotone"
                    dataKey="cirurgiasPrev"
                    name="Cirurgias (ano anterior)"
                    stroke={palette.cirurgias}
                    strokeDasharray="5 4"
                    strokeWidth={1.5}
                    dot={false}
                    connectNulls={false}
                  />
                ) : null}
              </LineChart>
            )}
          </ChartFrame>
        </div>
      ) : null}
    </div>
  );
}
