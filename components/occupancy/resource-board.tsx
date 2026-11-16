"use client";

import { useState } from "react";
import { cardClass } from "@/components/report/section";
import { Delta } from "@/components/report/delta";
import { Sparkline } from "@/components/report/sparkline";
import { useDark } from "@/components/theme";
import { formatHoursPT, formatPercentPT, formatPercentSmart } from "@/lib/format";
import type { ResourceMonth } from "@/lib/occupancy-data";
import { cn } from "@/lib/utils";

type SortKey = "idle" | "occupancy" | "name";

function barColor(occupancy: number, dark: boolean) {
  if (occupancy < 60) return dark ? "#f0b429" : "#d08a3a";
  if (occupancy <= 85) return dark ? "#5ec4dc" : "#006889";
  return dark ? "#dff6fb" : "#043844";
}

export function ResourceBoard({
  resources,
  threshold,
  color,
  onOpen,
}: {
  resources: (ResourceMonth & { spark: number[] })[];
  threshold: number;
  color: string;
  onOpen: (id: string) => void;
}) {
  const dark = useDark();
  const [sort, setSort] = useState<SortKey>("idle");
  const ordered = resources.slice().sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name, "pt");
    if (sort === "occupancy") return a.occupancy - b.occupancy || b.idleHours - a.idleHours;
    return b.idleHours - a.idleHours || a.occupancy - b.occupancy;
  });

  return (
    <div>
      <div className="no-print mb-3 flex flex-wrap gap-2">
        {(
          [
            ["idle", "Mais horas paradas"],
            ["occupancy", "Menor ocupação"],
            ["name", "Nome"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={sort === key}
            onClick={() => setSort(key)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium",
              sort === key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ordered.map((resource) => {
          const below = !resource.id.startsWith("gab-") && resource.occupancy < threshold;
          return (
            <button
              key={resource.id}
              type="button"
              onClick={() => onOpen(resource.id)}
              className={`${cardClass} flex flex-col p-4 text-left transition-colors hover:border-primary/40`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{resource.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {resource.kind === "equipamento" ? "Equipamento" : "Sala"}
                    {resource.duration ? ` · ${resource.duration} min` : " · horas reservadas"}
                  </p>
                </div>
                <Delta value={resource.delta} points className="text-sm" />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, resource.occupancy)}%`,
                      background: barColor(resource.occupancy, dark),
                    }}
                  />
                </div>
                <span className="tabular-nums text-sm font-medium">{formatPercentSmart(resource.occupancy)}</span>
              </div>
              {below ? <p className="mt-1 text-xs font-medium text-down">Abaixo do limiar</p> : null}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>
                  Horas paradas{" "}
                  <span className="font-medium text-foreground tabular-nums">{formatHoursPT(resource.idleHours)}</span>
                </span>
                <span>
                  Faltas{" "}
                  <span className="font-medium text-foreground tabular-nums">
                    {formatPercentPT(Math.round(resource.noshowRate * 10) / 10, 1)}
                  </span>
                </span>
              </div>
              {resource.note ? <p className="mt-2 text-xs font-medium text-primary">{resource.note}</p> : null}
              <div className="mt-3 flex justify-end">
                <Sparkline data={resource.spark} color={color} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
