"use client";

import { CalendarClock, CheckCircle2, Download, Mail } from "lucide-react";
import { MonthSelect } from "@/components/dashboard/month-select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  comparisonPhrase,
  getGeneratedLabel,
  getMonth,
  getNextSend,
  type ComparisonMode,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function ReportHeader({
  monthId,
  mode,
  loading,
  onMonth,
  onMode,
  onEmail,
}: {
  monthId: string;
  mode: ComparisonMode;
  loading: boolean;
  onMonth: (monthId: string) => void;
  onMode: (mode: ComparisonMode) => void;
  onEmail: () => void;
}) {
  const month = getMonth(monthId);
  const generated = getGeneratedLabel(monthId);

  return (
    <div className="no-print flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Relatório de atividade — {month.label}
          </h1>
          <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              Gerado automaticamente a {generated}, 07:00 · Fonte: exportação do software clínico
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-3 text-sm font-medium hover:bg-muted"
              >
                <CalendarClock className="h-4 w-4 text-primary" />
                <span className="hidden sm:inline">Envio automático: dia 1 de cada mês, 07:00</span>
                <span className="sm:hidden">Envio automático</span>
              </button>
            </PopoverTrigger>
            <PopoverContent>
              <p className="font-medium">Agendamento</p>
              <p className="mt-1 text-muted-foreground">
                O relatório do mês anterior sai no dia 1, às 07:00, sem intervenção manual.
              </p>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Destinatários
              </p>
              <ul className="mt-1 space-y-1">
                <li>Direção geral</li>
                <li>Holding Marques SGPS</li>
              </ul>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Próximo envio
              </p>
              <p className="mt-1">{getNextSend(monthId)}</p>
            </PopoverContent>
          </Popover>
          <Button variant="outline" disabled={loading} onClick={onEmail}>
            <Mail className="h-4 w-4" />
            Enviar por email
          </Button>
          <Button variant="primary" disabled={loading} onClick={() => window.print()}>
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <MonthSelect monthId={monthId} onMonth={onMonth} disabled={loading} />

        <div className="inline-flex rounded-xl bg-muted p-1">
          {(["previous", "homologous"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={mode === option}
              onClick={() => onMode(option)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                mode === option ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              {option === "previous" ? "Mês anterior" : "Mesmo mês do ano anterior"}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">{comparisonPhrase(mode)}</p>
      </div>
    </div>
  );
}
