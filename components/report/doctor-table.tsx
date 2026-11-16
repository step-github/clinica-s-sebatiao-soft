"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { Delta } from "@/components/report/delta";
import { cardClass } from "@/components/report/section";
import { Button } from "@/components/ui/button";
import { formatNumberPT, formatPercentPT } from "@/lib/format";
import { getComparison, listSpecialties, type ComparisonMode } from "@/lib/mock-data";

const PAGE_SIZE = 10;

type DoctorLine = {
  id: string;
  name: string;
  specialty: string;
  consultas: number;
  exames: number;
  ocupacao: number;
  delta: number | null;
};

function DoctorHead() {
  return (
    <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
      <tr>
        <th className="px-4 py-3 font-medium">Médico</th>
        <th className="px-4 py-3 font-medium">Especialidade</th>
        <th className="px-4 py-3 text-right font-medium">Consultas</th>
        <th className="px-4 py-3 text-right font-medium">Exames</th>
        <th className="px-4 py-3 text-right font-medium">Variação</th>
        <th className="px-4 py-3 font-medium">Ocupação da agenda</th>
      </tr>
    </thead>
  );
}

function DoctorLineRow({ doctor }: { doctor: DoctorLine }) {
  return (
    <tr className="border-b border-border/70 last:border-0">
      <td className="px-4 py-3 font-medium">{doctor.name}</td>
      <td className="px-4 py-3 text-muted-foreground">{doctor.specialty}</td>
      <td className="px-4 py-3 text-right tabular-nums">{formatNumberPT(doctor.consultas)}</td>
      <td className="px-4 py-3 text-right tabular-nums">{formatNumberPT(doctor.exames)}</td>
      <td className="px-4 py-3 text-right">
        <Delta value={doctor.delta} className="justify-end text-sm" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${doctor.ocupacao < 50 ? "bg-down" : "bg-primary"}`}
              style={{ width: `${doctor.ocupacao}%` }}
            />
          </div>
          <span className="tabular-nums">{formatPercentPT(doctor.ocupacao, 0)}</span>
        </div>
      </td>
    </tr>
  );
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function DoctorTable({ monthId, mode }: { monthId: string; mode: ComparisonMode }) {
  const comparison = getComparison(monthId, mode);
  const [query, setQuery] = useState("");
  const [specialtyId, setSpecialtyId] = useState("todas");
  const [page, setPage] = useState(0);

  const needle = normalize(query.trim());
  const active = comparison.current.doctors
    .filter((doctor) => doctor.active)
    .map((doctor) => ({ ...doctor, delta: comparison.doctorDelta[doctor.id] }));
  const filtered = active
    .filter((doctor) => (specialtyId === "todas" ? true : doctor.specialtyId === specialtyId))
    .filter((doctor) => (needle ? normalize(doctor.name).includes(needle) : true));
  const printConsultas = active.reduce((total, doctor) => total + doctor.consultas, 0);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const start = currentPage * PAGE_SIZE;
  const totalConsultas = filtered.reduce((total, doctor) => total + doctor.consultas, 0);

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
            className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="Pesquisar médico"
          />
        </label>
        <select
          value={specialtyId}
          onChange={(event) => {
            setSpecialtyId(event.target.value);
            setPage(0);
          }}
          className="h-10 rounded-xl border border-border bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label="Filtrar por especialidade"
        >
          <option value="todas">Todas as especialidades</option>
          {listSpecialties().map((specialty) => (
            <option key={specialty.id} value={specialty.id}>
              {specialty.name}
            </option>
          ))}
        </select>
      </div>

      <div className="no-print overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <DoctorHead />
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  Nenhum médico corresponde à pesquisa.
                </td>
              </tr>
            ) : (
              filtered.slice(start, start + PAGE_SIZE).map((doctor) => <DoctorLineRow key={doctor.id} doctor={doctor} />)
            )}
          </tbody>
        </table>
      </div>

      <div className="print-only">
        <table className="w-full text-left text-sm">
          <DoctorHead />
          <tbody>
            {active.map((doctor) => (
              <DoctorLineRow key={doctor.id} doctor={doctor} />
            ))}
          </tbody>
        </table>
        <p className="border-t border-border px-4 py-3 text-sm text-slate-600">
          {active.length} médicos
          <span className="mx-2">·</span>
          <span className="tabular-nums">{formatNumberPT(printConsultas)} consultas</span>
        </p>
      </div>

      <div className="no-print flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm">
        <p className="text-muted-foreground">
          {filtered.length === 0
            ? "0 médicos"
            : `A mostrar ${start + 1}–${Math.min(start + PAGE_SIZE, filtered.length)} de ${filtered.length}`}
          <span className="mx-2">·</span>
          <span className="tabular-nums">{formatNumberPT(totalConsultas)} consultas</span>
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
