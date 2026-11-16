import { formatNumberPT, formatPercentPT, formatPercentSmart } from "@/lib/format";
import {
  atividade,
  getComparison,
  getExamSeries,
  getMonth,
  getSourceLine,
  getYtdSpecialtyGrowth,
  listSpecialties,
  percentChange,
  type ComparisonMode,
  type MonthReport,
} from "@/lib/mock-data";

export type SummaryScript = {
  id: string;
  bullets: string[];
};

export type AiTable = {
  columns: string[];
  rows: string[][];
};

export type AiBar = {
  label: string;
  value: number;
};

export type AiAnswer = {
  text: string;
  table?: AiTable;
  bars?: AiBar[];
};

const OCTOBER_QUESTIONS = [
  "Porque caiu a ortopedia em outubro?",
  "Qual foi a especialidade que mais cresceu este ano?",
  "Como está a taxa de faltas face ao ano passado?",
  "Quantos exames de TC fizemos este mês?",
];

function monthName(report: MonthReport) {
  return report.label.split(" de ")[0];
}

function specialty(report: MonthReport, id: string) {
  const row = report.specialties.find((item) => item.id === id);
  if (!row) throw new Error(`Especialidade em falta: ${id}`);
  return row;
}

function exam(report: MonthReport, id: string) {
  const row = report.exams.find((item) => item.id === id);
  if (!row) throw new Error(`Exame em falta: ${id}`);
  return row;
}

function clause(delta: number) {
  if (Math.abs(delta) < 0.05) return "em linha com";
  if (delta < 0) return `menos ${formatPercentSmart(Math.abs(delta))} do que em`;
  return `mais ${formatPercentSmart(delta)} do que em`;
}

function direction(delta: number) {
  if (Math.abs(delta) < 0.05) return "manteve-se";
  if (delta > 0) return `subiu ${formatPercentSmart(delta)}`;
  return `desceu ${formatPercentSmart(Math.abs(delta))}`;
}

export function getSummaryScripts(monthId: string, mode: ComparisonMode = "previous"): SummaryScript[] {
  if (monthId === "2026-10") return octoberScripts(mode);
  if (monthId === "2026-09") return septemberScripts(mode);
  return genericScripts(monthId, mode);
}

function octoberScripts(mode: ComparisonMode): SummaryScript[] {
  if (mode === "homologous") return octoberHomologousScripts();
  const oct = getMonth("2026-10");
  const sep = getMonth("2026-09");
  const blocked = oct.doctors.find((doctor) => doctor.id === "melo");
  const activityDelta = percentChange(atividade(oct), atividade(sep)) ?? 0;
  const rxDelta = percentChange(exam(oct, "rx").value, exam(sep, "rx").value) ?? 0;
  const ortoDelta = percentChange(specialty(oct, "orto").consultas, specialty(sep, "orto").consultas) ?? 0;
  const cardioDelta =
    percentChange(specialty(oct, "cardio").consultas, specialty(sep, "cardio").consultas) ?? 0;
  const gastro = specialty(oct, "gastro");

  return [
    {
      id: "out-1",
      bullets: [
        `A atividade total subiu ${formatPercentSmart(activityDelta)} face a setembro, puxada pelos exames.`,
        `O RX subiu ${formatPercentSmart(rxDelta)} no segundo mês completo do novo equipamento.`,
        `A ortopedia caiu ${formatPercentSmart(Math.abs(ortoDelta))}: um dos ortopedistas teve a agenda bloqueada de 13 a 24 de outubro.`,
        `A cardiologia cresceu ${formatPercentSmart(cardioDelta)} com a entrada de um novo cardiologista em setembro.`,
        `A taxa de faltas subiu para ${formatPercentPT(oct.faltas)} (${formatPercentPT(sep.faltas)} em setembro), concentrada na gastrenterologia, nos exames com preparação.`,
      ],
    },
    {
      id: "out-2",
      bullets: [
        `Outubro fechou com ${formatNumberPT(oct.consultas)} consultas, ${formatNumberPT(oct.exames)} exames e ${formatNumberPT(oct.cirurgias)} cirurgias de ambulatório. No conjunto, a atividade subiu ${formatPercentSmart(activityDelta)} face a setembro.`,
        `Os exames explicam a maior parte do acréscimo. O RX passou de ${formatNumberPT(exam(sep, "rx").value)} para ${formatNumberPT(exam(oct, "rx").value)}, mais ${formatPercentSmart(rxDelta)}, no segundo mês do equipamento novo.`,
        `A cardiologia cresceu ${formatPercentSmart(cardioDelta)}. O Dr. Miguel Serpa, que entrou em setembro, fez o primeiro mês com a agenda próxima da dos colegas.`,
        `A ortopedia caiu ${formatPercentSmart(Math.abs(ortoDelta))}: o ${blocked?.name ?? "ortopedista bloqueado"} teve a agenda bloqueada de 13 a 24 de outubro. Os outros ortopedistas mantiveram o volume.`,
        `As faltas passaram de ${formatPercentPT(sep.faltas)} para ${formatPercentPT(oct.faltas)}. Na gastrenterologia a taxa chegou a ${formatPercentPT(gastro.faltas)}, nos exames com preparação.`,
      ],
    },
    {
      id: "out-3",
      bullets: [
        `Face a setembro, a atividade total subiu ${formatPercentSmart(activityDelta)}. Consultas ${direction(percentChange(oct.consultas, sep.consultas) ?? 0)}, exames ${direction(percentChange(oct.exames, sep.exames) ?? 0)}.`,
        `RX: ${formatNumberPT(exam(oct, "rx").value)} exames, ${direction(rxDelta)} face a setembro. Segundo mês completo do equipamento novo.`,
        `Cardiologia: ${formatNumberPT(specialty(oct, "cardio").consultas)} consultas (${direction(cardioDelta)}), com o novo cardiologista desde setembro.`,
        `Ortopedia: ${formatNumberPT(specialty(oct, "orto").consultas)} consultas (${direction(ortoDelta)}), por agenda bloqueada de 13 a 24 de outubro.`,
        `Faltas: ${formatPercentPT(oct.faltas)}, contra ${formatPercentPT(sep.faltas)} em setembro. O ponto mais alto é a gastrenterologia (${formatPercentPT(gastro.faltas)}).`,
      ],
    },
  ];
}

function octoberHomologousScripts(): SummaryScript[] {
  const oct = getMonth("2026-10");
  const base = getComparison("2026-10", "homologous").previous;
  const face = base.label;
  const blocked = oct.doctors.find((doctor) => doctor.id === "melo");
  const activityDelta = percentChange(atividade(oct), atividade(base)) ?? 0;
  const rxDelta = percentChange(exam(oct, "rx").value, exam(base, "rx").value) ?? 0;
  const ortoDelta = percentChange(specialty(oct, "orto").consultas, specialty(base, "orto").consultas) ?? 0;
  const cardioDelta =
    percentChange(specialty(oct, "cardio").consultas, specialty(base, "cardio").consultas) ?? 0;
  const gastro = specialty(oct, "gastro");
  const examsLed =
    activityDelta > 0.5 &&
    oct.exames - base.exames > oct.consultas - base.consultas;

  return [
    {
      id: "out-h1",
      bullets: [
        `A atividade total ${direction(activityDelta)} face a ${face}${examsLed ? ", puxada pelos exames" : ""}.`,
        `O RX fez ${formatNumberPT(exam(oct, "rx").value)} exames e ${direction(rxDelta)} face a ${face}. O equipamento novo está no segundo mês completo.`,
        `A ortopedia ${direction(ortoDelta)} face a ${face}. O ${blocked?.name ?? "ortopedista"} teve a agenda bloqueada de 13 a 24 de outubro.`,
        `A cardiologia ${direction(cardioDelta)} face a ${face}, com um cardiologista novo desde setembro.`,
        `A taxa de faltas ficou em ${formatPercentPT(oct.faltas)} (${formatPercentPT(base.faltas)} em ${face}).`,
      ],
    },
    {
      id: "out-h2",
      bullets: [
        `Outubro fechou com ${formatNumberPT(oct.consultas)} consultas, ${formatNumberPT(oct.exames)} exames e ${formatNumberPT(oct.cirurgias)} cirurgias de ambulatório. Face a ${face}, a atividade ${direction(activityDelta)}.`,
        `RX: ${formatNumberPT(exam(oct, "rx").value)} exames, ${direction(rxDelta)} face a ${face} (${formatNumberPT(exam(base, "rx").value)}). Segundo mês do equipamento novo.`,
        `Cardiologia: ${formatNumberPT(specialty(oct, "cardio").consultas)} consultas, ${direction(cardioDelta)} face a ${face}. O Dr. Miguel Serpa entrou em setembro.`,
        `Ortopedia: ${formatNumberPT(specialty(oct, "orto").consultas)} consultas, ${direction(ortoDelta)} face a ${face}, com a agenda do ${blocked?.name ?? "ortopedista"} bloqueada de 13 a 24 de outubro.`,
        `Faltas: ${formatPercentPT(oct.faltas)}, contra ${formatPercentPT(base.faltas)} em ${face}. Na gastrenterologia a taxa chegou a ${formatPercentPT(gastro.faltas)}.`,
      ],
    },
    {
      id: "out-h3",
      bullets: [
        `Face a ${face}, a atividade total ${direction(activityDelta)}. Consultas ${direction(percentChange(oct.consultas, base.consultas) ?? 0)}, exames ${direction(percentChange(oct.exames, base.exames) ?? 0)}.`,
        `O RX ${direction(rxDelta)} face a ${face}.`,
        `A cardiologia ${direction(cardioDelta)} e a ortopedia ${direction(ortoDelta)}, sempre face a ${face}.`,
        `A taxa de faltas está em ${formatPercentPT(oct.faltas)}, contra ${formatPercentPT(base.faltas)} no período homólogo.`,
      ],
    },
  ];
}

function septemberScripts(mode: ComparisonMode): SummaryScript[] {
  if (mode === "homologous") return septemberHomologousScripts();
  const sep = getMonth("2026-09");
  const aug = getMonth("2026-08");
  const activityDelta = percentChange(atividade(sep), atividade(aug)) ?? 0;
  const rxDelta = percentChange(exam(sep, "rx").value, exam(aug, "rx").value) ?? 0;
  const serpa = sep.doctors.find((doctor) => doctor.id === "serpa");

  return [
    {
      id: "set-1",
      bullets: [
        `Setembro recupera da quebra de agosto: a atividade total ${direction(activityDelta)} face a agosto.`,
        `O RX fez ${formatNumberPT(exam(sep, "rx").value)} exames, ${direction(rxDelta)} face a agosto. É o primeiro mês completo do equipamento novo.`,
        `Entrou um cardiologista, o Dr. Miguel Serpa, com ${formatNumberPT(serpa?.consultas ?? 0)} consultas neste primeiro mês.`,
        `A taxa de faltas ficou em ${formatPercentPT(sep.faltas)}. Entraram ${formatNumberPT(sep.novos)} novos doentes.`,
      ],
    },
    {
      id: "set-2",
      bullets: [
        `${formatNumberPT(sep.consultas)} consultas, ${formatNumberPT(sep.exames)} exames e ${formatNumberPT(sep.cirurgias)} cirurgias de ambulatório. A atividade ${direction(activityDelta)} face a agosto, como é habitual depois do verão.`,
        `O equipamento novo de RX arrancou: ${formatNumberPT(exam(sep, "rx").value)} exames, ${clause(rxDelta)} agosto (${formatNumberPT(exam(aug, "rx").value)}).`,
        `A cardiologia passa a contar com o Dr. Miguel Serpa. A agenda ainda está em arranque (${formatNumberPT(serpa?.consultas ?? 0)} consultas).`,
        `Faltas em ${formatPercentPT(sep.faltas)} e ${formatNumberPT(sep.novos)} novos doentes.`,
      ],
    },
    {
      id: "set-3",
      bullets: [
        `Depois de agosto, setembro repõe o ritmo: atividade ${direction(activityDelta)}.`,
        `RX no primeiro mês do equipamento novo: ${formatNumberPT(exam(sep, "rx").value)} exames (${direction(rxDelta)} face a agosto).`,
        `Novo cardiologista em funções desde este mês.`,
        `Taxa de faltas: ${formatPercentPT(sep.faltas)}.`,
      ],
    },
  ];
}

function septemberHomologousScripts(): SummaryScript[] {
  const sep = getMonth("2026-09");
  const base = getComparison("2026-09", "homologous").previous;
  const face = base.label;
  const activityDelta = percentChange(atividade(sep), atividade(base)) ?? 0;
  const rxDelta = percentChange(exam(sep, "rx").value, exam(base, "rx").value) ?? 0;
  const serpa = sep.doctors.find((doctor) => doctor.id === "serpa");

  return [
    {
      id: "set-h1",
      bullets: [
        `Face a ${face}, a atividade total ${direction(activityDelta)}.`,
        `O RX fez ${formatNumberPT(exam(sep, "rx").value)} exames, ${direction(rxDelta)} face a ${face}. É o primeiro mês completo do equipamento novo.`,
        `Entrou um cardiologista, o Dr. Miguel Serpa, com ${formatNumberPT(serpa?.consultas ?? 0)} consultas neste primeiro mês.`,
        `A taxa de faltas ficou em ${formatPercentPT(sep.faltas)} (${formatPercentPT(base.faltas)} em ${face}). Entraram ${formatNumberPT(sep.novos)} novos doentes.`,
      ],
    },
    {
      id: "set-h2",
      bullets: [
        `${formatNumberPT(sep.consultas)} consultas, ${formatNumberPT(sep.exames)} exames e ${formatNumberPT(sep.cirurgias)} cirurgias de ambulatório. A atividade ${direction(activityDelta)} face a ${face}.`,
        `RX: ${formatNumberPT(exam(sep, "rx").value)} exames, ${direction(rxDelta)} face a ${face}.`,
        `A cardiologia passa a contar com o Dr. Miguel Serpa (${formatNumberPT(serpa?.consultas ?? 0)} consultas).`,
        `Faltas em ${formatPercentPT(sep.faltas)}, contra ${formatPercentPT(base.faltas)} em ${face}.`,
      ],
    },
    {
      id: "set-h3",
      bullets: [
        `Setembro ${direction(activityDelta)} em atividade total face a ${face}.`,
        `O equipamento novo de RX arrancou este mês: ${formatNumberPT(exam(sep, "rx").value)} exames (${direction(rxDelta)} face a ${face}).`,
        `Taxa de faltas: ${formatPercentPT(sep.faltas)}.`,
      ],
    },
  ];
}

function genericScripts(monthId: string, mode: ComparisonMode): SummaryScript[] {
  const current = getMonth(monthId);
  const comparison = getComparison(monthId, mode);
  const previous = comparison.previous;
  const face = mode === "homologous" ? previous.label : monthName(previous);
  const ranked = current.specialties
    .map((row) => ({
      name: row.name,
      delta: percentChange(row.consultas, specialty(previous, row.id).consultas) ?? 0,
    }))
    .sort((a, b) => b.delta - a.delta);
  const top = ranked[0];
  const bottom = ranked[ranked.length - 1];
  const exams = current.exams
    .map((row) => ({
      name: row.name,
      value: row.value,
      delta: percentChange(row.value, exam(previous, row.id).value) ?? 0,
    }))
    .sort((a, b) => b.value - a.value);
  const leadingExam = exams[0];
  const season =
    current.month === 8
      ? "Agosto é o mês mais baixo do ano, na quebra habitual das férias."
      : current.month === 12
        ? "Dezembro fecha mais baixo, como é habitual na época festiva."
        : null;

  const opening = `Em ${current.label} a clínica realizou ${formatNumberPT(current.consultas)} consultas, ${formatNumberPT(current.exames)} exames e ${formatNumberPT(current.cirurgias)} cirurgias de ambulatório.`;
  const activityLine = `A atividade total ${direction(comparison.deltas.atividade)} face a ${face}.`;
  const pct = (delta: number) => formatPercentSmart(Math.abs(delta));
  const specialtyLine =
    top.delta > 0 && bottom.delta < 0
      ? `A maior subida foi em ${top.name} (+${pct(top.delta)}) e a maior descida em ${bottom.name} (−${pct(bottom.delta)}).`
      : top.delta <= 0
        ? Math.abs(top.delta) < 0.05
          ? `${top.name} manteve o volume; ${bottom.name} foi a que mais caiu (−${pct(bottom.delta)}).`
          : `Todas as especialidades desceram: ${top.name} foi a que menos caiu (−${pct(top.delta)}) e ${bottom.name} a que mais caiu (−${pct(bottom.delta)}).`
        : `Todas as especialidades subiram: a maior subida foi em ${top.name} (+${pct(top.delta)}) e a menor em ${bottom.name} (+${pct(bottom.delta)}).`;
  const examLine = `Nos exames, ${leadingExam.name} foi o tipo com maior volume (${formatNumberPT(leadingExam.value)}, ${direction(leadingExam.delta)}).`;
  const absenceLine = `A taxa de faltas ficou em ${formatPercentPT(current.faltas)} e entraram ${formatNumberPT(current.novos)} novos doentes.`;

  return [
    {
      id: `${monthId}-a`,
      bullets: [opening, activityLine, specialtyLine, season, absenceLine].filter(
        (line): line is string => Boolean(line),
      ),
    },
    {
      id: `${monthId}-b`,
      bullets: [
        activityLine,
        examLine,
        `Consultas: ${formatNumberPT(current.consultas)} (${direction(comparison.deltas.consultas)}). Cirurgias de ambulatório: ${formatNumberPT(current.cirurgias)} (${direction(comparison.deltas.cirurgias)}).`,
        specialtyLine,
        absenceLine,
      ],
    },
    {
      id: `${monthId}-c`,
      bullets: [
        `${monthName(current)[0].toUpperCase()}${monthName(current).slice(1)} ${direction(comparison.deltas.atividade)} em atividade total face a ${face}.`,
        specialtyLine,
        `${absenceLine}${season ? ` ${season}` : ""}`,
      ],
    },
  ];
}

export function suggestedQuestions(monthId: string) {
  if (monthId === "2026-10") return OCTOBER_QUESTIONS;
  const name = monthName(getMonth(monthId));
  return [
    `Porque variou a ortopedia em ${name}?`,
    OCTOBER_QUESTIONS[1],
    OCTOBER_QUESTIONS[2],
    OCTOBER_QUESTIONS[3],
  ];
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const MONTH_NAMES = [
  "janeiro",
  "fevereiro",
  "marco",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function resolveMonth(question: string, selected: string) {
  const text = normalize(question);
  const selectedReport = getMonth(selected);
  for (let index = 0; index < MONTH_NAMES.length; index += 1) {
    if (!text.includes(MONTH_NAMES[index])) continue;
    const month = String(index + 1).padStart(2, "0");
    const sameYear = `${selectedReport.year}-${month}`;
    const previousYear = `${selectedReport.year - 1}-${month}`;
    if (hasReport(sameYear)) return sameYear;
    if (hasReport(previousYear)) return previousYear;
  }
  return selected;
}

function hasReport(monthId: string) {
  try {
    getMonth(monthId);
    return true;
  } catch {
    return false;
  }
}

const SPECIALTY_ALIASES: { id: string; aliases: string[] }[] = [
  { id: "mgf", aliases: ["medicina geral e familiar", "medicina geral"] },
  { id: "cardio", aliases: ["cardiologia", "cardio"] },
  { id: "orto", aliases: ["ortopedia", "ortoped"] },
  { id: "gine", aliases: ["ginecologia", "gineco"] },
  { id: "gastro", aliases: ["gastrenterologia", "gastro"] },
  { id: "oftal", aliases: ["oftalmologia", "oftalmo"] },
  { id: "orl", aliases: ["otorrinolaringologia", "otorrino"] },
  { id: "pedia", aliases: ["pediatria", "pediatr"] },
  { id: "derm", aliases: ["dermatologia", "dermato"] },
  { id: "uro", aliases: ["urologia", "urolog"] },
  { id: "neuro", aliases: ["neurologia", "neurolog"] },
  { id: "psiq", aliases: ["psiquiatria", "psiquiatr"] },
  { id: "psico", aliases: ["psicologia", "psicolog"] },
  { id: "pneumo", aliases: ["pneumologia", "pneumo"] },
  { id: "endo", aliases: ["endocrinologia", "endocrino"] },
  { id: "cirg", aliases: ["cirurgia geral"] },
  { id: "trab", aliases: ["medicina do trabalho"] },
  { id: "nutri", aliases: ["nutricao", "nutrição"] },
];

function matchSpecialty(question: string) {
  const text = normalize(question);
  const found = SPECIALTY_ALIASES.map((entry) => ({
    id: entry.id,
    size: Math.max(...entry.aliases.map((alias) => (text.includes(normalize(alias)) ? alias.length : 0))),
  }))
    .filter((entry) => entry.size > 0)
    .sort((a, b) => b.size - a.size)[0];
  return found?.id ?? null;
}

export function answerQuestion(question: string, selectedMonth: string): AiAnswer {
  const text = normalize(question);
  const monthId = resolveMonth(question, selectedMonth);
  const finish = (answer: Omit<AiAnswer, "text"> & { body: string }): AiAnswer => ({
    text: `${answer.body}\n\n${getSourceLine(monthId)}`,
    table: answer.table,
    bars: answer.bars,
  });

  if (text.includes("ortoped")) return finish(orthoAnswer(monthId));
  if (/(^|[^a-z])tc([^a-z]|$)/.test(text) || text.includes("tomografia")) {
    return finish(tcAnswer(monthId));
  }
  if (text.includes("falta")) return finish(absenceAnswer(monthId));
  if (/(^|[^a-z])rx([^a-z]|$)/.test(text) || text.includes("raio")) {
    return finish(rxAnswer(monthId));
  }
  if (text.includes("cardio")) return finish(cardioAnswer(monthId));

  const asksGrowth = /cresceu|crescimento|crescer/.test(text);
  const asksWhich = /especialidade|qual foi|mais cresceu/.test(text);
  if (asksGrowth && asksWhich) return finish(ytdAnswer(selectedMonth));

  const specialtyId = matchSpecialty(question);
  if (specialtyId && specialtyId !== "orto" && specialtyId !== "cardio") {
    return finish(specialtyAnswer(monthId, specialtyId));
  }

  return {
    text: `Nesta demonstração só respondo às perguntas sugeridas. Na versão real, a IA consulta diretamente os dados da clínica.\n\n${getSourceLine(selectedMonth)}`,
  };
}

function orthoAnswer(monthId: string): { body: string; table: AiTable } {
  const current = getMonth(monthId);
  const previous = getComparison(monthId, "previous").previous;
  const cur = specialty(current, "orto");
  const prev = specialty(previous, "orto");
  const delta = percentChange(cur.consultas, prev.consultas) ?? 0;
  const doctors = current.doctors.filter((doctor) => doctor.specialtyId === "orto" && doctor.active);
  const previousDoctors = new Map(
    previous.doctors
      .filter((doctor) => doctor.specialtyId === "orto")
      .map((doctor) => [doctor.id, doctor.consultas]),
  );
  const story =
    monthId === "2026-10"
      ? ` A quebra vem do ${doctors.find((doctor) => doctor.id === "melo")?.name ?? "ortopedista bloqueado"}, com a agenda bloqueada de 13 a 24 de outubro. Os outros dois ortopedistas mantiveram um volume próximo do mês anterior.`
      : " A variação acompanha a procura do mês e a ocupação das agendas.";

  return {
    body: `A ortopedia fez ${formatNumberPT(cur.consultas)} consultas em ${monthName(current)}, ${clause(delta)} ${monthName(previous)} (${formatNumberPT(prev.consultas)}).${story}`,
    table: {
      columns: ["Médico", monthName(current), monthName(previous), "Ocupação"],
      rows: doctors.map((doctor) => [
        doctor.name,
        formatNumberPT(doctor.consultas),
        formatNumberPT(previousDoctors.get(doctor.id) ?? 0),
        formatPercentPT(doctor.ocupacao, 0),
      ]),
    },
  };
}

function cardioAnswer(monthId: string): { body: string; table: AiTable } {
  const current = getMonth(monthId);
  const previous = getComparison(monthId, "previous").previous;
  const cur = specialty(current, "cardio");
  const prev = specialty(previous, "cardio");
  const delta = percentChange(cur.consultas, prev.consultas) ?? 0;
  const serpa = current.doctors.find((doctor) => doctor.id === "serpa");
  const serpaPrev = previous.doctors.find((doctor) => doctor.id === "serpa");
  const story =
    monthId === "2026-10"
      ? ` O crescimento vem do Dr. Miguel Serpa, que entrou em setembro (${formatNumberPT(serpaPrev?.consultas ?? 0)} consultas nesse mês, ${formatNumberPT(serpa?.consultas ?? 0)} em outubro). Os outros cardiologistas mantiveram a agenda.`
      : monthId === "2026-09"
        ? ` O Dr. Miguel Serpa entrou este mês e fez ${formatNumberPT(serpa?.consultas ?? 0)} consultas, ainda com a agenda em arranque.`
        : "";

  return {
    body: `A cardiologia fez ${formatNumberPT(cur.consultas)} consultas em ${monthName(current)}, ${clause(delta)} ${monthName(previous)} (${formatNumberPT(prev.consultas)}).${story}`,
    table: {
      columns: ["Médico", monthName(current), "Ocupação"],
      rows: current.doctors
        .filter((doctor) => doctor.specialtyId === "cardio" && doctor.active)
        .map((doctor) => [
          doctor.name,
          formatNumberPT(doctor.consultas),
          formatPercentPT(doctor.ocupacao, 0),
        ]),
    },
  };
}

function tcAnswer(monthId: string): { body: string; bars: AiBar[] } {
  const current = getMonth(monthId);
  const previous = getComparison(monthId, "previous").previous;
  const value = exam(current, "tc").value;
  const previousValue = exam(previous, "tc").value;
  const delta = percentChange(value, previousValue) ?? 0;
  return {
    body: `Em ${current.label} fizeram-se ${formatNumberPT(value)} exames de TC, ${clause(delta)} ${monthName(previous)} (${formatNumberPT(previousValue)}).`,
    bars: getExamSeries(monthId, "tc", 6).map((point) => ({
      label: point.tick,
      value: point.value,
    })),
  };
}

function absenceAnswer(monthId: string): { body: string; table: AiTable } {
  const current = getMonth(monthId);
  const month = getComparison(monthId, "previous");
  const year = getComparison(monthId, "homologous");
  const gastro = specialty(current, "gastro");
  const gastroNote =
    monthId === "2026-10"
      ? ` O aumento face a setembro concentra-se na gastrenterologia (${formatPercentPT(gastro.faltas)}), nos exames com preparação.`
      : ` Na gastrenterologia a taxa foi ${formatPercentPT(gastro.faltas)}.`;
  const points = Math.abs(month.deltas.faltasPp).toFixed(1).replace(".", ",");
  const pointsVerb = month.deltas.faltasPp >= 0 ? "subiu" : "desceu";

  return {
    body: `A taxa de faltas em ${current.label} foi ${formatPercentPT(current.faltas)}, face a ${formatPercentPT(year.previous.faltas)} em ${year.previous.label}. Face a ${monthName(month.previous)} (${formatPercentPT(month.previous.faltas)}), ${pointsVerb} ${points} pontos percentuais.${gastroNote}`,
    table: {
      columns: ["Período", "Taxa de faltas"],
      rows: [
        [current.label, formatPercentPT(current.faltas)],
        [month.previous.label, formatPercentPT(month.previous.faltas)],
        [year.previous.label, formatPercentPT(year.previous.faltas)],
        [`Gastrenterologia (${monthName(current)})`, formatPercentPT(gastro.faltas)],
      ],
    },
  };
}

function rxAnswer(monthId: string): { body: string } {
  const current = getMonth(monthId);
  const previous = getComparison(monthId, "previous").previous;
  const value = exam(current, "rx").value;
  const previousValue = exam(previous, "rx").value;
  const delta = percentChange(value, previousValue) ?? 0;
  const story =
    monthId >= "2026-09"
      ? monthId === "2026-10"
        ? " É o segundo mês completo do equipamento novo, em funcionamento desde setembro."
        : " É o primeiro mês completo do equipamento novo."
      : "";
  return {
    body: `O RX fez ${formatNumberPT(value)} exames em ${monthName(current)}, ${clause(delta)} ${monthName(previous)} (${formatNumberPT(previousValue)}).${story}`,
  };
}

function ytdAnswer(monthId: string): { body: string; table: AiTable } {
  const growth = getYtdSpecialtyGrowth(monthId);
  const top = growth.rows[0];
  const delta = top.delta ?? 0;
  const lead =
    delta >= 0
      ? `De ${growth.period}, a especialidade que mais cresceu face ao mesmo período do ano anterior foi ${top.name}, com uma subida de ${formatPercentSmart(delta)} (${formatNumberPT(top.current)} consultas, contra ${formatNumberPT(top.previous)}).`
      : `De ${growth.period}, nenhuma especialidade cresceu face ao ano anterior. ${top.name} foi a que menos recuou (${formatPercentSmart(delta)}).`;

  return {
    body: lead,
    table: {
      columns: ["Especialidade", "Este período", "Ano anterior", "Variação"],
      rows: growth.rows.slice(0, 3).map((row) => [
        row.name,
        formatNumberPT(row.current),
        formatNumberPT(row.previous),
        row.delta === null ? "—" : `${row.delta > 0 ? "+" : "−"}${formatPercentSmart(Math.abs(row.delta))}`,
      ]),
    },
  };
}

function specialtyAnswer(monthId: string, specialtyId: string): { body: string } {
  const current = getMonth(monthId);
  const previous = getComparison(monthId, "previous").previous;
  const cur = specialty(current, specialtyId);
  const prev = specialty(previous, specialtyId);
  const delta = percentChange(cur.consultas, prev.consultas) ?? 0;
  const name = listSpecialties().find((item) => item.id === specialtyId)?.name ?? cur.name;
  return {
    body: `${name} fez ${formatNumberPT(cur.consultas)} consultas em ${monthName(current)}, ${clause(delta)} ${monthName(previous)} (${formatNumberPT(prev.consultas)}). A taxa de faltas da especialidade foi ${formatPercentPT(cur.faltas)}.`,
  };
}
