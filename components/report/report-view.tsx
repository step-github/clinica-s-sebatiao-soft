"use client";

import Image from "next/image";
import {
  CalendarCheck,
  ScanLine,
  Scissors,
  UserPlus,
  UserRoundX,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getSummaryScripts } from "@/lib/ai-scripts";
import { formatNumberPT, formatPercentPT } from "@/lib/format";
import {
  DEFAULT_MONTH_ID,
  getComparison,
  getGeneratedLabel,
  getMonth,
  getTrend,
  type ComparisonMode,
} from "@/lib/mock-data";
import { useChartPalette } from "@/components/theme";
import { AiSummary } from "@/components/report/ai-summary";
import { AskTheNumbers } from "@/components/report/ask-the-numbers";
import { DoctorTable } from "@/components/report/doctor-table";
import { EmailModal } from "@/components/report/email-modal";
import { EntityChart } from "@/components/report/entity-chart";
import { ExamsChart } from "@/components/report/exams-chart";
import { KpiCard } from "@/components/report/kpi-card";
import { ReportFooter } from "@/components/report/report-footer";
import { ReportHeader } from "@/components/report/report-header";
import { Section } from "@/components/report/section";
import { SpecialtyTable } from "@/components/report/specialty-table";
import { TrendChart } from "@/components/report/trend-chart";

export function ReportView() {
  const [monthId, setMonthId] = useState(DEFAULT_MONTH_ID);
  const [mode, setMode] = useState<ComparisonMode>("previous");
  const [loading, setLoading] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [version, setVersion] = useState(0);
  const [custom, setCustom] = useState<string[] | null>(null);
  const [streaming, setStreaming] = useState(false);
  const timer = useRef<number | null>(null);
  const finishStream = useCallback(() => setStreaming(false), []);
  const palette = useChartPalette();
  const month = getMonth(monthId);
  const comparison = getComparison(monthId, mode);
  const scripts = getSummaryScripts(monthId, mode);
  const bullets = custom ?? scripts[version % scripts.length].bullets;

  useEffect(() => {
    document.title = `Relatório de atividade — ${month.label} · Clínica São Sebastião`;
  }, [month.label]);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  function changeMode(next: ComparisonMode) {
    setMode(next);
    setCustom(null);
    setVersion(0);
    setStreaming(false);
  }

  function changeMonth(next: string) {
    if (next === monthId) return;
    setMonthId(next);
    setVersion(0);
    setCustom(null);
    setStreaming(false);
    setLoading(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setLoading(false), 400);
  }

  const previousName = comparison.previous.label.split(" de ")[0];

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-8">
      <header className="print-only border-b border-slate-200 pb-4">
        <Image
          src="/logo2.png"
          alt="Clínica São Sebastião"
          width={640}
          height={77}
          className="mb-3 h-8 w-auto"
        />
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
          Painel de gestão
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Relatório de atividade — {month.label}</h1>
        <p className="mt-1 text-sm text-slate-600">
          Gerado automaticamente a {getGeneratedLabel(monthId)}, 07:00 · Fonte: exportação do software clínico
        </p>
        <p className="mt-1 text-sm text-slate-600">Demonstração · dados fictícios</p>
      </header>

      <ReportHeader
        monthId={monthId}
        mode={mode}
        loading={loading}
        onMonth={changeMonth}
        onMode={changeMode}
        onEmail={() => setEmailOpen(true)}
      />

      {loading ? (
        <ReportSkeleton />
      ) : (
        <div key={monthId} className="fade-up flex flex-col gap-8">
          <section className="kpi-grid grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <KpiCard
              label="Consultas"
              value={formatNumberPT(month.consultas)}
              delta={comparison.deltas.consultas}
              phrase={comparison.label}
              series={getTrend("consultas", 12, monthId).map((point) => point.value)}
              icon={CalendarCheck}
              color={palette.consultas}
              hint={`${formatNumberPT(comparison.previous.consultas)} em ${previousName}`}
            />
            <KpiCard
              label="Exames"
              value={formatNumberPT(month.exames)}
              delta={comparison.deltas.exames}
              phrase={comparison.label}
              series={getTrend("exames", 12, monthId).map((point) => point.value)}
              icon={ScanLine}
              color={palette.exames}
              hint={`${formatNumberPT(comparison.previous.exames)} em ${previousName}`}
            />
            <KpiCard
              label="Cirurgias de ambulatório"
              value={formatNumberPT(month.cirurgias)}
              delta={comparison.deltas.cirurgias}
              phrase={comparison.label}
              series={getTrend("cirurgias", 12, monthId).map((point) => point.value)}
              icon={Scissors}
              color={palette.cirurgias}
              hint={`${formatNumberPT(comparison.previous.cirurgias)} em ${previousName}`}
            />
            <KpiCard
              label="Novos doentes"
              value={formatNumberPT(month.novos)}
              delta={comparison.deltas.novos}
              phrase={comparison.label}
              series={getTrend("novos", 12, monthId).map((point) => point.value)}
              icon={UserPlus}
              color={palette.consultas}
              hint={`${formatNumberPT(comparison.previous.novos)} em ${previousName}`}
            />
            <KpiCard
              label="Taxa de faltas"
              value={formatPercentPT(month.faltas)}
              delta={comparison.deltas.faltasPp}
              phrase={comparison.label}
              series={getTrend("faltas", 12, monthId).map((point) => point.value)}
              icon={UserRoundX}
              invert
              points
              color={palette.cirurgias}
              hint={`${formatPercentPT(comparison.previous.faltas)} em ${previousName}`}
            />
          </section>

          <AiSummary
            bullets={bullets}
            streaming={streaming}
            onRegenerate={() => {
              setCustom(null);
              setStreaming(true);
              setVersion((current) => current + 1);
            }}
            onSave={(next) => {
              setCustom(next);
              setStreaming(false);
            }}
            onStreamDone={finishStream}
          />

          <Section
            title="Evolução dos últimos 12 meses"
            description="Consultas e exames no gráfico principal. Cirurgias de ambulatório no gráfico de baixo, à sua escala."
          >
            <TrendChart monthId={monthId} mode={mode} />
          </Section>

          <Section title="Atividade por especialidade" description={`Variação ${comparison.label}.`}>
            <SpecialtyTable monthId={monthId} mode={mode} />
          </Section>

          <Section title="Exames por tipo" description={`Variação ${comparison.label}.`}>
            <ExamsChart monthId={monthId} mode={mode} />
          </Section>

          <Section
            className="allow-break"
            title="Atividade por médico"
            description={`Variação ${comparison.label}. Nomes fictícios, para esta demonstração.`}
          >
            <DoctorTable monthId={monthId} mode={mode} />
          </Section>

          <Section title="Atividade por entidade" description={`Volume de atos e variação ${comparison.label}.`}>
            <EntityChart monthId={monthId} mode={mode} />
          </Section>

          <AskTheNumbers key={monthId} monthId={monthId} />
          <ReportFooter monthId={monthId} />
        </div>
      )}

      <EmailModal open={emailOpen} onOpenChange={setEmailOpen} monthLabel={month.label} bullets={bullets} />
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-hidden>
      <div className="kpi-grid grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="h-40 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="h-56 animate-pulse rounded-2xl bg-muted" />
      <div className="h-80 animate-pulse rounded-2xl bg-muted" />
      <div className="h-96 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}
