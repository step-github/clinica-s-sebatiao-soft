"use client";

import { useState } from "react";
import { cardClass } from "@/components/report/section";
import { useDark } from "@/components/theme";
import { formatClock, formatHoursPT, formatPercentSmart } from "@/lib/format";
import { HEAT_COLUMNS, WEEKDAY_LABELS, getHeatmap, type HeatCell } from "@/lib/occupancy-data";

const PLURAL = ["", "Segundas", "Terças", "Quartas", "Quintas", "Sextas", "Sábados"];

function mix(occupancy: number, dark: boolean) {
  const t = Math.min(1, Math.max(0, occupancy / 100));
  const stops = dark
    ? [
        [15, 36, 48],
        [26, 106, 125],
        [94, 196, 220],
        [223, 246, 252],
      ]
    : [
        [244, 251, 252],
        [150, 210, 220],
        [0, 104, 137],
        [4, 56, 68],
      ];
  const scaled = t * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.floor(scaled));
  const local = scaled - index;
  const rgb = stops[index].map((channel, channelIndex) =>
    Math.round(channel + (stops[index + 1][channelIndex] - channel) * local),
  );
  return `rgb(${rgb.join(",")})`;
}

function cellText(cell: HeatCell) {
  const end = formatClock(cell.start + 30);
  const start = formatClock(cell.start);
  const when = `${PLURAL[cell.weekday]}, ${start}–${end}`;
  if (cell.closed) return `${when} · sem funcionamento`;
  return `${when} · ${formatPercentSmart(cell.occupancy ?? 0)} ocupado · ${formatHoursPT(cell.idleHours)} paradas no mês`;
}

export function Heatmap({ monthId, resourceId }: { monthId: string; resourceId: string }) {
  const dark = useDark();
  const map = getHeatmap(resourceId, monthId);
  const [hint, setHint] = useState("Passe sobre um bloco para ver a ocupação.");
  const lookup = new Map(map.cells.map((cell) => [`${cell.weekday}:${cell.start}`, cell]));

  return (
    <div className={`${cardClass} min-w-0 p-4 sm:p-5`}>
      <div className="heatmap-scroll overflow-x-auto">
        <div className="heatmap-grid min-w-[760px]">
          <div className="grid" style={{ gridTemplateColumns: `4.5rem repeat(${HEAT_COLUMNS.length}, minmax(1.35rem, 1fr))` }}>
            <div />
            {HEAT_COLUMNS.map((start) => (
              <div key={start} className="pb-1 text-center text-[10px] text-muted-foreground">
                {start % 60 === 0 || start === 7 * 60 + 30 ? formatClock(start).replace(":00", "h").replace(":30", "h30") : ""}
              </div>
            ))}
            {([1, 2, 3, 4, 5, 6] as const).map((weekday) => (
              <div key={weekday} className="contents">
                <div className="flex items-center text-xs font-medium text-muted-foreground">{WEEKDAY_LABELS[weekday]}</div>
                {HEAT_COLUMNS.map((start) => {
                  const cell = lookup.get(`${weekday}:${start}`);
                  const closed = !cell || cell.closed;
                  const label = cell ? cellText(cell) : `${PLURAL[weekday]}, ${formatClock(start)} · sem funcionamento`;
                  return (
                    <button
                      key={`${weekday}-${start}`}
                      type="button"
                      className="m-px h-7 rounded-sm border border-transparent focus-visible:border-foreground focus-visible:outline-none"
                      style={
                        closed
                          ? {
                              backgroundColor: dark ? "#1e293b" : "#e8eef2",
                              backgroundImage:
                                "repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(100,116,139,0.45) 3px, rgba(100,116,139,0.45) 4px)",
                            }
                          : { backgroundColor: mix(cell.occupancy ?? 0, dark) }
                      }
                      aria-label={label}
                      onMouseEnter={() => setHint(label)}
                      onFocus={() => setHint(label)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span>0 %</span>
        <span
          className="h-2 w-28 rounded-full"
          style={{
            background: dark
              ? "linear-gradient(90deg, #0f2430, #1a6a7d, #5ec4dc, #dff6fc)"
              : "linear-gradient(90deg, #f4fbfc, #96d2dc, #006889, #043844)",
          }}
          aria-hidden
        />
        <span>100 %</span>
        <span className="inline-flex items-center gap-2">
          <span
            className="h-4 w-4 rounded-sm"
            style={{
              backgroundColor: dark ? "#1e293b" : "#e8eef2",
              backgroundImage:
                "repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(100,116,139,0.45) 3px, rgba(100,116,139,0.45) 4px)",
            }}
            aria-hidden
          />
          Sem funcionamento
        </span>
      </div>
      <p className="mt-3 min-h-5 text-sm text-muted-foreground" aria-live="polite">
        {hint}
      </p>
      <p className="mt-2 text-sm">{map.reading}</p>
    </div>
  );
}
