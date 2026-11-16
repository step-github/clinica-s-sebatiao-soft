"use client";

import { useSyncExternalStore } from "react";
import { cardClass } from "@/components/report/section";
import { formatClock } from "@/lib/format";
import type { TimelineBlock } from "@/lib/occupancy-data";
import { cn } from "@/lib/utils";

const FROM = 7 * 60 + 30;
const TO = 20 * 60;
const SPAN = TO - FROM;
const STATE_LABEL = {
  marcado: "Marcado",
  falta: "Falta",
  livre: "Livre",
  bloqueado: "Bloqueado",
} as const;

export type WeekRow = {
  id: string;
  name: string;
  blocks: TimelineBlock[];
  emptyLabel?: string;
};

function useNow() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const id = window.setInterval(onStoreChange, 30000);
      return () => window.clearInterval(id);
    },
    () => {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      return `${now.getFullYear()}-${month}-${day}T${now.getHours() * 60 + now.getMinutes()}`;
    },
    () => "",
  );
}

function blockStyle(state: TimelineBlock["state"]) {
  if (state === "marcado") return "bg-primary text-primary-foreground";
  if (state === "falta") return "border border-dashed border-down bg-down/15 text-down";
  if (state === "bloqueado") {
    return "border border-border text-foreground";
  }
  return "text-transparent";
}

export function WeekBoard({
  dayIso,
  rows,
}: {
  dayIso: string;
  rows: WeekRow[];
}) {
  const now = useNow();
  const [today, minutes] = now.split("T");
  const minute = Number(minutes);
  const showNow = today === dayIso && minute >= FROM && minute <= TO;
  const ticks = [8, 10, 12, 14, 16, 18, 20].map((hour) => hour * 60);

  return (
    <div className={`${cardClass} min-w-0 p-4 sm:p-5`}>
      <div className="gantt-scroll overflow-x-auto">
        <div className="gantt-track min-w-[720px]">
          <div className="mb-2 flex">
            <div className="w-28 shrink-0 sm:w-36" />
            <div className="relative h-5 flex-1 text-[10px] text-muted-foreground">
              <span className="absolute left-0">07:30</span>
              {ticks.map((tick) => (
                <span key={tick} className="absolute" style={{ left: `${((tick - FROM) / SPAN) * 100}%` }}>
                  {formatClock(tick).replace(":00", "h")}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            {rows.map((row) => (
              <div key={row.id} className="flex items-center gap-2">
                <p className="w-28 shrink-0 truncate text-xs font-medium sm:w-36">{row.name}</p>
                <div
                  className="relative h-9 flex-1 rounded-md"
                  style={{
                    backgroundColor: "var(--muted)",
                    backgroundImage:
                      "repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(100,116,139,0.28) 4px, rgba(100,116,139,0.28) 5px)",
                  }}
                >
                  {row.blocks.map((block, index) => (
                    <span
                      key={`${block.start}-${block.state}-${index}`}
                      title={`${formatClock(block.start)}–${formatClock(block.end)} · ${block.label} · ${STATE_LABEL[block.state]}`}
                      className={cn(
                        "absolute top-1 flex h-7 items-center overflow-hidden rounded px-1 text-[10px] font-medium",
                        blockStyle(block.state),
                        block.state === "livre" && "bg-card",
                      )}
                      style={{
                        left: `${((block.start - FROM) / SPAN) * 100}%`,
                        width: `${((block.end - block.start) / SPAN) * 100}%`,
                        ...(block.state === "bloqueado"
                          ? {
                              backgroundColor: "var(--muted)",
                              backgroundImage:
                                "repeating-linear-gradient(135deg, transparent, transparent 3px, rgba(100,116,139,0.55) 3px, rgba(100,116,139,0.55) 4px)",
                            }
                          : null),
                      }}
                    >
                      <span className="truncate">
                        {block.state === "bloqueado" ? "Ausência" : block.state === "falta" ? "Falta" : block.state === "marcado" ? block.label : ""}
                      </span>
                    </span>
                  ))}
                  {row.emptyLabel ? (
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-muted-foreground">
                      {row.emptyLabel}
                    </span>
                  ) : null}
                  {showNow ? (
                    <span
                      className="absolute inset-y-0 w-px bg-down"
                      style={{ left: `${((minute - FROM) / SPAN) * 100}%` }}
                      aria-hidden
                    />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <li className="inline-flex items-center gap-2">
          <span className="h-3 w-5 rounded-sm bg-primary" aria-hidden /> Marcado
        </li>
        <li className="inline-flex items-center gap-2">
          <span className="h-3 w-5 rounded-sm border border-dashed border-down bg-down/15" aria-hidden /> Falta
        </li>
        <li className="inline-flex items-center gap-2">
          <span className="h-3 w-5 rounded-sm border border-border bg-card" aria-hidden /> Livre
        </li>
        <li className="inline-flex items-center gap-2">
          <span
            className="h-3 w-5 rounded-sm border border-border"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, transparent, transparent 2px, rgba(100,116,139,0.7) 2px, rgba(100,116,139,0.7) 3px)",
            }}
            aria-hidden
          />{" "}
          Bloqueado
        </li>
      </ul>
    </div>
  );
}
