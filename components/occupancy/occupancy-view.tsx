"use client";

import Image from "next/image";
import {
  CalendarClock,
  CheckCircle2,
  CircleHelp,
  Clock,
  Download,
  Gauge,
  SlidersHorizontal,
  UserRound,
  UserRoundX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MonthSelect } from "@/components/dashboard/month-select";
import { DoctorBoard } from "@/components/occupancy/doctor-board";
import { Heatmap } from "@/components/occupancy/heatmap";
import { ResourceBoard } from "@/components/occupancy/resource-board";
import { ResourceDetail } from "@/components/occupancy/resource-detail";
import { WeekBoard, type WeekRow } from "@/components/occupancy/week-board";
import { KpiCard } from "@/components/report/kpi-card";
import { Section, cardClass } from "@/components/report/section";
import { useChartPalette } from "@/components/theme";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { formatHoursPT, formatPercentPT, formatPercentSmart } from "@/lib/format";
import { DEFAULT_MONTH_ID, getMonth } from "@/lib/mock-data";
import {
  DEFAULT_THRESHOLDS,
  defaultDay,
  defaultWeek,
  getAlerts,
  getDoctorOccupancy,
  getDoctorWeek,
  getOccupancy,
  getWeekTimeline,
  listWeeks,
  resourceMatches,
  type Thresholds,
  type ViewFilter,
} from "@/lib/occupancy-data";
import { cn } from "@/lib/utils";

const FILTERS: { id: ViewFilter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "equipamentos", label: "Equipamentos" },
  { id: "salas", label: "Salas" },
  { id: "medicos", label: "Médicos" },
];

const DAY_SHORT = ["", "seg", "ter", "qua", "qui", "sex", "sáb"];

const DEFINITIONS = [
  "Capacidade = minutos de funcionamento disponíveis do recurso.",
  "Ocupação = minutos marcados ÷ capacidade.",
  "Horas paradas = capacidade − minutos realizados. Inclui buracos na agenda e faltas.",
  "Faltas = marcações em que o doente não apareceu. Contam como tempo perdido.",
];

export function OccupancyView() {
  const [monthId, setMonthId] = useState(DEFAULT_MONTH_ID);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<ViewFilter>("todos");
  const [thresholds, setThresholds] = useState<Thresholds>(DEFAULT_THRESHOLDS);
  const [resourceId, setResourceId] = useState("tc");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState<string | null>(null);
  const [dayIso, setDayIso] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const palette = useChartPalette();
  const month = getMonth(monthId);
  const data = getOccupancy(monthId);
  const alerts = getAlerts(monthId, thresholds);
  const weeks = listWeeks(monthId);
  const week = weeks.find((item) => item.start === weekStart) ?? defaultWeek(monthId);
  const day = week.days.find((item) => item.iso === dayIso) ?? defaultDay(monthId, week);
  const visible = data.resources.filter((resource) => resourceMatches(resource.kind, resource.id, filter));
  const heatResource = visible.find((resource) => resource.id === resourceId) ?? visible[0];
  const focusDoctor = focusId ? getDoctorOccupancy(monthId).find((doctor) => doctor.id === focusId) : undefined;

  useEffect(() => {
    document.title = `Ocupação — ${month.label} · Clínica São Sebastião`;
  }, [month.label]);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  function changeMonth(next: string) {
    if (next === monthId) return;
    setMonthId(next);
    setDetailId(null);
    setFocusId(null);
    setWeekStart(null);
    setDayIso(null);
    setLoading(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setLoading(false), 400);
  }

  function openAlert(alert: (typeof alerts)[number]) {
    if (alert.doctorId) {
      setFilter("medicos");
      setFocusId(alert.doctorId);
      window.setTimeout(() => {
        document.getElementById("agendas-medicos")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
      return;
    }
    if (alert.resourceId) {
      setResourceId(alert.resourceId);
      setDetailId(alert.resourceId);
      if (filter === "medicos") setFilter("todos");
    }
  }

  const doctorRows: WeekRow[] = getDoctorOccupancy(monthId).map((doctor) => {
    const selected = getDoctorWeek(doctor.id, week.start).find((item) => item.iso === day.iso);
    return {
      id: doctor.id,
      name: doctor.name,
      blocks: selected?.blocks ?? [],
      emptyLabel: selected && !doctor.shiftDays.includes(selected.weekday) ? "Sem turno" : undefined,
    };
  });
  const resourceRows: WeekRow[] = visible.map((resource) => {
    const selected = getWeekTimeline(resource.id, week.start).find((item) => item.iso === day.iso);
    return {
      id: resource.id,
      name: resource.short,
      blocks: selected?.blocks ?? [],
      emptyLabel: selected?.empty ? "Sem cirurgias" : undefined,
    };
  });
  const blockedRows = doctorRows.filter((row) => {
    const doctor = getDoctorOccupancy(monthId).find((item) => item.id === row.id);
    return doctor?.blockedDays.some((number) => week.days.some((item) => item.day === number));
  });
  const rows = filter === "medicos" ? doctorRows : filter === "todos" ? [...blockedRows, ...resourceRows] : resourceRows;

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-[1180px] flex-col gap-8">
      <header className="print-only border-b border-slate-200 pb-4">
        <Image src="/logo2.png" alt="Clínica São Sebastião" width={640} height={77} className="mb-3 h-8 w-auto" />
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Painel de gestão</p>
        <h1 className="mt-2 text-2xl font-semibold">Ocupação — {month.label}</h1>
        <p className="mt-1 text-sm text-slate-600">
          Calculado a partir das agendas do software clínico · atualizado hoje às 06:00
        </p>
        <p className="mt-1 text-sm text-slate-600">Demonstração · dados fictícios</p>
      </header>

      <div className="no-print flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ocupação — {month.label}</h1>
            <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>Calculado a partir das agendas do software clínico · atualizado hoje às 06:00</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-3 text-sm font-medium hover:bg-muted"
                >
                  <CircleHelp className="h-4 w-4 text-primary" />
                  Como é calculado
                </button>
              </PopoverTrigger>
              <PopoverContent>
                <p className="font-medium">Definições</p>
                <ul className="mt-2 space-y-2 text-muted-foreground">
                  {DEFINITIONS.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>
            <ThresholdsPopover value={thresholds} onChange={setThresholds} />
            <Button variant="primary" disabled={loading} onClick={() => window.print()}>
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <MonthSelect monthId={monthId} onMonth={changeMonth} disabled={loading} />
          <div className="inline-flex flex-wrap rounded-xl bg-muted p-1">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={filter === item.id}
                onClick={() => setFilter(item.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  filter === item.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <OccupancySkeleton />
      ) : (
        <div key={monthId} className="fade-up flex min-w-0 flex-col gap-8">
          <section className="occ-kpi-grid grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Ocupação média dos equipamentos"
              value={formatPercentSmart(data.kpis.equipmentOccupancy)}
              delta={data.deltas.equipmentOccupancy}
              points
              phrase="face ao mês anterior"
              series={data.series.equipmentOccupancy}
              icon={Gauge}
              color={palette.consultas}
            />
            <KpiCard
              label="Horas paradas nos equipamentos"
              value={formatHoursPT(data.kpis.equipmentIdleHours)}
              delta={data.deltas.equipmentIdleHours}
              invert
              phrase="face ao mês anterior"
              series={data.series.equipmentIdleHours}
              icon={Clock}
              color={palette.exames}
            />
            <KpiCard
              label="Faltas nos exames"
              value={formatPercentPT(data.kpis.examNoShow, 1)}
              delta={data.deltas.examNoShow}
              points
              invert
              phrase="face ao mês anterior"
              series={data.series.examNoShow}
              icon={UserRoundX}
              color={palette.cirurgias}
            />
            <KpiCard
              label="Ocupação média das agendas"
              value={formatPercentSmart(data.kpis.doctorOccupancy)}
              delta={data.deltas.doctorOccupancy}
              points
              phrase="face ao mês anterior"
              series={data.series.doctorOccupancy}
              icon={CalendarClock}
              color={palette.consultas}
            />
          </section>

          <Section title="Alertas do mês" description="Regras simples sobre limiares. Não há texto gerado por IA.">
            {alerts.length === 0 ? (
              <p className={`${cardClass} px-4 py-6 text-sm text-muted-foreground`}>Nenhum alerta com estes limiares.</p>
            ) : (
              <ul className="space-y-3">
                {alerts.map((alert) => {
                  const Icon = alert.doctorId ? UserRound : alert.id.includes("faltas") ? UserRoundX : Clock;
                  return (
                    <li key={alert.id} className={`${cardClass} flex flex-col gap-3 p-4 sm:flex-row sm:items-center`}>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{alert.text}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{alert.rule}</p>
                      </div>
                      <Button size="sm" variant="outline" className="no-print shrink-0" onClick={() => openAlert(alert)}>
                        Ver detalhe
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>

          {filter !== "medicos" ? (
            <Section title="Ocupação por recurso" description="Barras por faixa: abaixo de 60 % âmbar, até 85 % teal, acima teal escuro.">
              <ResourceBoard
                resources={visible}
                threshold={thresholds.equipmentBelow}
                color={palette.consultas}
                onOpen={(id) => {
                  setResourceId(id);
                  setDetailId(id);
                }}
              />
            </Section>
          ) : null}

          {filter !== "medicos" && heatResource ? (
            <Section
              className="allow-break"
              title="Mapa de calor — quando ficam parados"
              description="Ocupação média do mês, por dia da semana e bloco de 30 min."
            >
              <div className="no-print mb-3">
                <label className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Recurso</span>
                  <select
                    value={heatResource.id}
                    onChange={(event) => setResourceId(event.target.value)}
                    aria-label="Recurso do mapa de calor"
                    className="h-10 rounded-xl border border-border bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    {visible.map((resource) => (
                      <option key={resource.id} value={resource.id}>
                        {resource.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="print-only mb-2 text-sm font-medium">{heatResource.name}</p>
              <Heatmap monthId={monthId} resourceId={heatResource.id} />
            </Section>
          ) : null}

          <Section
            className="allow-break"
            title="Agenda da semana"
            description="Marcação, falta, tempo livre e bloqueio. Sem nomes de doentes."
          >
            <div className="no-print mb-3 flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Semana</span>
                <select
                  value={week.start}
                  onChange={(event) => {
                    setWeekStart(event.target.value);
                    setDayIso(null);
                  }}
                  aria-label="Semana do mês"
                  className="h-10 rounded-xl border border-border bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  {weeks.map((item) => (
                    <option key={item.start} value={item.start}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="inline-flex flex-wrap rounded-xl bg-muted p-1">
                {week.days.map((item) => (
                  <button
                    key={item.iso}
                    type="button"
                    aria-pressed={item.iso === day.iso}
                    onClick={() => setDayIso(item.iso)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-sm font-medium",
                      item.iso === day.iso ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
                    )}
                  >
                    {DAY_SHORT[item.weekday]} {item.day}
                  </button>
                ))}
              </div>
            </div>
            <p className="print-only mb-2 text-sm">
              Semana de {week.label} · {DAY_SHORT[day.weekday]} {day.day}
            </p>
            <WeekBoard dayIso={day.iso} rows={rows} />
          </Section>

          {filter === "todos" || filter === "medicos" ? (
            <Section
              className="allow-break"
              title="Agendas dos médicos"
              description="A ocupação é a mesma da tabela de médicos do relatório de atividade."
            >
              <div id="agendas-medicos">
                <DoctorBoard
                  key={focusId ?? monthId}
                  doctors={getDoctorOccupancy(monthId)}
                  threshold={thresholds.doctorsBelow}
                  initialQuery={focusDoctor?.name ?? ""}
                />
              </div>
            </Section>
          ) : null}

          <Section title="Como é calculado">
            <div className="grid items-start gap-4 lg:grid-cols-2">
              <div className={`${cardClass} p-5`}>
                <ul className="space-y-2 text-sm">
                  {DEFINITIONS.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
              <div className={`${cardClass} p-5 text-sm`}>
                <p className="font-medium">Fonte</p>
                <p className="mt-2 text-muted-foreground">
                  Agendas do software clínico, atualizadas diariamente às 06:00. Sem dados de doentes.
                </p>
              </div>
            </div>
          </Section>
        </div>
      )}

      <Sheet open={detailId !== null} onOpenChange={(open) => !open && setDetailId(null)}>
        {detailId ? (
          <SheetContent
            className="max-w-lg"
            title={data.resources.find((resource) => resource.id === detailId)?.name ?? "Recurso"}
            description="Ocupação, horas paradas e faltas deste recurso."
          >
            <ResourceDetail resourceId={detailId} monthId={monthId} threshold={thresholds.equipmentBelow} />
          </SheetContent>
        ) : null}
      </Sheet>
    </div>
  );
}

function ThresholdsPopover({ value, onChange }: { value: Thresholds; onChange: (next: Thresholds) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-3 text-sm font-medium hover:bg-muted"
        >
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Limiares de alerta
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="font-medium">Limiares de alerta</p>
        <p className="mt-1 text-muted-foreground">Os alertas e os realces recalculam ao mudar um valor.</p>
        <div className="mt-3 space-y-3">
          <ThresholdField
            label="Equipamentos abaixo de"
            value={value.equipmentBelow}
            onChange={(equipmentBelow) => onChange({ ...value, equipmentBelow })}
          />
          <ThresholdField
            label="Faltas acima de"
            value={value.absencesAbove}
            onChange={(absencesAbove) => onChange({ ...value, absencesAbove })}
          />
          <ThresholdField
            label="Médicos abaixo de"
            value={value.doctorsBelow}
            onChange={(doctorsBelow) => onChange({ ...value, doctorsBelow })}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ThresholdField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      <span>{label}</span>
      <span className="inline-flex items-center gap-1">
        <input
          type="number"
          min={0}
          max={100}
          value={value}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (Number.isNaN(next)) return;
            onChange(Math.min(100, Math.max(0, next)));
          }}
          className="h-9 w-16 rounded-lg border border-border bg-card px-2 text-right tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        />
        <span className="text-muted-foreground">%</span>
      </span>
    </label>
  );
}

function OccupancySkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-hidden>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-40 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-2xl bg-muted" />
      <div className="h-80 animate-pulse rounded-2xl bg-muted" />
      <div className="h-72 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}
