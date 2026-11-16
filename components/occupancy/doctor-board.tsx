"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { useState } from "react";
import { Delta } from "@/components/report/delta";
import { cardClass } from "@/components/report/section";
import { Button } from "@/components/ui/button";
import { formatHoursPT, formatPercentPT } from "@/lib/format";
import { listSpecialties } from "@/lib/mock-data";
import type { DoctorOccupancy } from "@/lib/occupancy-data";

const PAGE_SIZE = 10;

type SortKey = "name" | "specialty" | "available" | "booked" | "occupancy" | "noshow" | "delta";

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function DoctorBoard({
  doctors,
  threshold,
  initialQuery = "",
}: {
  doctors: DoctorOccupancy[];
  threshold: number;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [specialtyId, setSpecialtyId] = useState("todas");
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" }>({
    key: "name",
    direction: "asc",
  });
  const needle = normalize(query.trim());
  const filtered = doctors
    .filter((doctor) => (specialtyId === "todas" ? true : doctor.specialtyId === specialtyId))
    .filter((doctor) => (needle ? normalize(doctor.name).includes(needle) : true))
    .slice()
    .sort((a, b) => {
      const dir = sort.direction === "asc" ? 1 : -1;
      if (sort.key === "name") return a.name.localeCompare(b.name, "pt") * dir;
      if (sort.key === "specialty") return a.specialty.localeCompare(b.specialty, "pt") * dir;
      if (sort.key === "available") return (a.availableHours - b.availableHours) * dir;
      if (sort.key === "booked") return (a.bookedHours - b.bookedHours) * dir;
      if (sort.key === "occupancy") return (a.occupancy - b.occupancy) * dir;
      if (sort.key === "noshow") return (a.noshowRate - b.noshowRate) * dir;
      return ((a.delta ?? 0) - (b.delta ?? 0)) * dir;
    });
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const start = currentPage * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  function toggle(key: SortKey) {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: key === "name" || key === "specialty" ? "asc" : "desc" },
    );
  }

  return (
    <div className={`${cardClass} overflow-hidden`}>
      <div className="no-print flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
            placeholder="Pesquisar médico"
            aria-label="Pesquisar médico"
            className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </label>
        <select
          value={specialtyId}
          onChange={(event) => {
            setSpecialtyId(event.target.value);
            setPage(0);
          }}
          aria-label="Filtrar por especialidade"
          className="h-10 rounded-xl border border-border bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <option value="todas">Todas as especialidades</option>
          {listSpecialties().map((specialty) => (
            <option key={specialty.id} value={specialty.id}>
              {specialty.name}
            </option>
          ))}
        </select>
      </div>
      <DoctorTable
        className="no-print"
        rows={pageRows}
        sort={sort}
        onSort={toggle}
        threshold={threshold}
        empty={filtered.length === 0}
      />
      <div className="print-only">
        <DoctorTable rows={doctors} sort={sort} onSort={toggle} threshold={threshold} empty={false} />
      </div>
      <div className="no-print flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm">
        <p className="text-muted-foreground">
          {filtered.length === 0
            ? "0 médicos"
            : `A mostrar ${start + 1}–${Math.min(start + PAGE_SIZE, filtered.length)} de ${filtered.length}`}
        </p>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>
            Anterior
          </Button>
          <span className="tabular-nums text-muted-foreground">
            {currentPage + 1} / {pageCount}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage >= pageCount - 1}
            onClick={() => setPage(currentPage + 1)}
          >
            Seguinte
          </Button>
        </div>
      </div>
    </div>
  );
}

function DoctorTable({
  rows,
  sort,
  onSort,
  threshold,
  empty,
  className,
}: {
  rows: DoctorOccupancy[];
  sort: { key: SortKey; direction: "asc" | "desc" };
  onSort: (key: SortKey) => void;
  threshold: number;
  empty: boolean;
  className?: string;
}) {
  return (
    <div className={className ? `${className} overflow-x-auto` : "overflow-x-auto"}>
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <SortHead label="Médico" sortKey="name" sort={sort} onSort={onSort} />
            <SortHead label="Especialidade" sortKey="specialty" sort={sort} onSort={onSort} />
            <SortHead label="Horas disponíveis" sortKey="available" sort={sort} onSort={onSort} align="right" />
            <SortHead label="Horas marcadas" sortKey="booked" sort={sort} onSort={onSort} align="right" />
            <SortHead label="Ocupação" sortKey="occupancy" sort={sort} onSort={onSort} align="right" />
            <SortHead label="Faltas" sortKey="noshow" sort={sort} onSort={onSort} align="right" />
            <SortHead label="Variação" sortKey="delta" sort={sort} onSort={onSort} align="right" />
          </tr>
        </thead>
        <tbody>
          {empty ? (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                Nenhum médico corresponde à pesquisa.
              </td>
            </tr>
          ) : (
            rows.map((doctor) => {
              const below = doctor.occupancy < threshold;
              return (
                <tr key={doctor.id} className="border-b border-border/70 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{doctor.name}</p>
                    {doctor.blockedLabel ? (
                      <p className="mt-1 inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                        {doctor.blockedLabel}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{doctor.specialty}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatHoursPT(doctor.availableHours, 1)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatHoursPT(doctor.bookedHours, 1)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="tabular-nums font-medium">{formatPercentPT(doctor.occupancy, 0)}</span>
                    {below ? <p className="text-xs font-medium text-down">Abaixo do limiar</p> : null}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatPercentPT(doctor.noshowRate, 1)}</td>
                  <td className="px-4 py-3 text-right">
                    <Delta value={doctor.delta} points className="justify-end text-sm" />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function SortHead({
  label,
  sortKey,
  sort,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  sort: { key: SortKey; direction: "asc" | "desc" };
  onSort: (key: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = sort.key === sortKey;
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
