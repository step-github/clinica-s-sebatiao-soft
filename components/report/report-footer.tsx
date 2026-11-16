import { cardClass } from "@/components/report/section";
import { getGeneratedLabel, getSendHistory } from "@/lib/mock-data";

export function ReportFooter({ monthId }: { monthId: string }) {
  const history = getSendHistory(monthId);
  const exportedAt = getGeneratedLabel(monthId);

  return (
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <article className={`${cardClass} p-5`}>
        <h2 className="text-lg font-semibold tracking-tight">Fontes de dados</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          O relatório sai da exportação do software clínico. Não inclui valores em euros.
        </p>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
            <dt className="text-muted-foreground">O que entra</dt>
            <dd className="text-right">Agendas e atos</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
            <dt className="text-muted-foreground">Atualização</dt>
            <dd className="text-right">Todos os dias, 06:00</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted-foreground">Exportação deste relatório</dt>
            <dd className="text-right tabular-nums">{exportedAt}, 07:00</dd>
          </div>
        </dl>
      </article>
      <article className={`${cardClass} p-5`}>
        <h2 className="text-lg font-semibold tracking-tight">Histórico de envios</h2>
        <ul className="mt-3 divide-y divide-border">
          {history.map((item) => (
            <li key={item.dateLabel} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <div>
                <p className="font-medium tabular-nums">{item.dateLabel}</p>
                <p className="text-xs text-muted-foreground">{item.recipients}</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                {item.status}
              </span>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}
