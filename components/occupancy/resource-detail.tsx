"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";
import { ChartFrame } from "@/components/report/chart-frame";
import { ChartTooltip } from "@/components/report/chart-tooltip";
import { useChartPalette } from "@/components/theme";
import { formatHoursPT, formatNumberPT, formatPercentPT, formatPercentSmart } from "@/lib/format";
import { getResourceDetail } from "@/lib/occupancy-data";

export function ResourceDetail({
  resourceId,
  monthId,
  threshold,
}: {
  resourceId: string;
  monthId: string;
  threshold: number;
}) {
  const palette = useChartPalette();
  const resource = getResourceDetail(resourceId, monthId);
  const weekdays = resource.weekdays.map((day) => ({
    ...day,
    value: day.occupancy ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Ocupação" value={formatPercentSmart(resource.occupancy)} />
        <Stat label="Horas paradas" value={formatHoursPT(resource.idleHours)} />
        <Stat label="Faltas" value={formatPercentPT(Math.round(resource.noshowRate * 10) / 10, 1)} />
      </div>
      {resource.duration ? (
        <p className="text-sm text-muted-foreground">Duração-padrão de um exame: {resource.duration} min.</p>
      ) : (
        <p className="text-sm text-muted-foreground">Ocupação pelas horas reservadas na agenda.</p>
      )}
      {resource.note ? (
        <p className="rounded-xl bg-primary/10 px-3 py-2 text-sm font-medium text-primary">{resource.note}</p>
      ) : null}

      <div>
        <h3 className="text-sm font-medium">Ocupação, 12 meses</h3>
        <p className="mt-1 text-xs text-muted-foreground">A linha tracejada é o limiar de alerta ({formatPercentPT(threshold, 0)}).</p>
        <ChartFrame height={220}>
          {({ width, height }) => (
            <LineChart width={width} height={height} data={resource.series} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={palette.grid} />
              <XAxis dataKey="tick" tick={{ fill: palette.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: palette.axis, fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<ChartTooltip percent />} />
              <ReferenceLine y={threshold} stroke={palette.cirurgias} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="occupancy" name="Ocupação" stroke={palette.consultas} strokeWidth={2} dot={false} />
            </LineChart>
          )}
        </ChartFrame>
      </div>

      <div>
        <h3 className="text-sm font-medium">Por dia da semana</h3>
        <ChartFrame height={180}>
          {({ width, height }) => (
            <BarChart width={width} height={height} data={weekdays} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={palette.grid} />
              <XAxis dataKey="label" tick={{ fill: palette.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} hide />
              <Tooltip content={<ChartTooltip percent />} />
              <Bar dataKey="value" name="Ocupação" fill={palette.consultas} radius={[6, 6, 0, 0]} barSize={18} />
            </BarChart>
          )}
        </ChartFrame>
      </div>

      {resource.exams.length > 0 ? (
        <div>
          <h3 className="text-sm font-medium">Exames realizados no mês</h3>
          <ul className="mt-2 divide-y divide-border text-sm">
            {resource.exams.map((exam) => (
              <li key={exam.name} className="flex items-center justify-between py-2">
                <span>{exam.name}</span>
                <span className="tabular-nums font-medium">{formatNumberPT(exam.value)}</span>
              </li>
            ))}
          </ul>
          {resource.id === "eco1" || resource.id === "eco2" ? (
            <p className="mt-2 text-xs text-muted-foreground">
              A soma dos dois ecógrafos é o total de ecografias do relatório de atividade.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}
