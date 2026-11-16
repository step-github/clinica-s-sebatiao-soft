"use client";

import { Bar, BarChart, Cell, LabelList, Tooltip, XAxis, YAxis } from "recharts";
import { ChartFrame } from "@/components/report/chart-frame";
import { ChartTooltip } from "@/components/report/chart-tooltip";
import { cardClass } from "@/components/report/section";
import { useChartPalette } from "@/components/theme";
import { formatDeltaPT, formatNumberPT } from "@/lib/format";
import { getComparison, type ComparisonMode } from "@/lib/mock-data";

export function ExamsChart({ monthId, mode }: { monthId: string; mode: ComparisonMode }) {
  const palette = useChartPalette();
  const comparison = getComparison(monthId, mode);
  const data = comparison.current.exams.map((exam) => ({
    ...exam,
    delta: comparison.examDelta[exam.id],
  }));
  const note = data.find((exam) => exam.note)?.note;

  return (
    <div className={`${cardClass} p-4 sm:p-5`}>
      <ChartFrame height={440}>
        {({ width, height }) => (
          <BarChart width={width} height={height} data={data} layout="vertical" margin={{ top: 0, right: 108, left: 8, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={148}
              tick={{ fill: palette.axis, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,104,137,0.08)" }} />
            <Bar dataKey="value" name="Exames" radius={[0, 6, 6, 0]} barSize={14}>
              {data.map((exam) => (
                <Cell key={exam.id} fill={exam.note ? palette.barStrong : palette.bar} />
              ))}
              <LabelList
                dataKey="value"
                content={(props) => {
                  const index = typeof props.index === "number" ? props.index : 0;
                  const exam = data[index];
                  if (!exam || props.x == null || props.y == null || props.width == null || props.height == null) {
                    return null;
                  }
                  const x = Number(props.x) + Number(props.width) + 8;
                  const y = Number(props.y) + Number(props.height) / 2;
                  return (
                    <text x={x} y={y} dominantBaseline="middle" fontSize={12} fill={palette.axis}>
                      {formatNumberPT(exam.value)}
                      {exam.delta === null ? "" : `  ${formatDeltaPT(exam.delta)}`}
                    </text>
                  );
                }}
              />
            </Bar>
          </BarChart>
        )}
      </ChartFrame>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="text-muted-foreground">
          Total de exames:{" "}
          <span className="font-medium text-foreground tabular-nums">
            {formatNumberPT(comparison.current.exames)}
          </span>
        </p>
        {note ? (
          <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            RX · {note}
          </p>
        ) : null}
      </div>
    </div>
  );
}
