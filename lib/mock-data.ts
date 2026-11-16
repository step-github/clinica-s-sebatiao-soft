import {
  formatGeneratedAt,
  formatGeneratedShort,
  formatLongDate,
  formatMonthLong,
  formatMonthTick,
  MONTHS_SHORT,
} from "@/lib/format";

export {
  formatDeltaPT,
  formatNumberPT,
  formatPercentPT,
  formatPointsPT,
} from "@/lib/format";

export const DEFAULT_MONTH_ID = "2026-10";

export type ComparisonMode = "previous" | "homologous";

export type TrendMetric = "consultas" | "exames" | "cirurgias" | "novos" | "faltas";

export type SpecialtyRow = {
  id: string;
  name: string;
  consultas: number;
  exames: number;
  faltas: number;
  faltasCount: number;
};

export type ExamRow = {
  id: string;
  name: string;
  value: number;
  note?: string;
};

export type DoctorRow = {
  id: string;
  name: string;
  specialtyId: string;
  specialty: string;
  consultas: number;
  exames: number;
  ocupacao: number;
  active: boolean;
};

export type EntityRow = {
  id: string;
  name: string;
  value: number;
};

export type MonthReport = {
  id: string;
  year: number;
  month: number;
  label: string;
  tick: string;
  consultas: number;
  exames: number;
  cirurgias: number;
  novos: number;
  faltas: number;
  faltasCount: number;
  specialties: SpecialtyRow[];
  exams: ExamRow[];
  doctors: DoctorRow[];
  entities: EntityRow[];
};

type SpecialtyDef = { id: string; name: string; weight: number; examWeight: number };
type ExamDef = { id: string; name: string; weight: number };
type EntityDef = { id: string; name: string; weight: number };
type DoctorDef = {
  id: string;
  name: string;
  specialtyId: string;
  joined?: string;
  blocked?: string;
};

const SPECIALTIES: SpecialtyDef[] = [
  { id: "mgf", name: "Medicina Geral e Familiar", weight: 0.168, examWeight: 0.16 },
  { id: "cardio", name: "Cardiologia", weight: 0.074, examWeight: 0.14 },
  { id: "orto", name: "Ortopedia", weight: 0.08, examWeight: 0.07 },
  { id: "gine", name: "Ginecologia", weight: 0.076, examWeight: 0.08 },
  { id: "gastro", name: "Gastrenterologia", weight: 0.056, examWeight: 0.09 },
  { id: "oftal", name: "Oftalmologia", weight: 0.068, examWeight: 0.05 },
  { id: "orl", name: "Otorrinolaringologia", weight: 0.046, examWeight: 0.03 },
  { id: "pedia", name: "Pediatria", weight: 0.07, examWeight: 0.05 },
  { id: "derm", name: "Dermatologia", weight: 0.05, examWeight: 0.02 },
  { id: "uro", name: "Urologia", weight: 0.038, examWeight: 0.04 },
  { id: "neuro", name: "Neurologia", weight: 0.036, examWeight: 0.04 },
  { id: "psiq", name: "Psiquiatria", weight: 0.032, examWeight: 0.01 },
  { id: "psico", name: "Psicologia", weight: 0.028, examWeight: 0.005 },
  { id: "pneumo", name: "Pneumologia", weight: 0.034, examWeight: 0.06 },
  { id: "endo", name: "Endocrinologia", weight: 0.032, examWeight: 0.04 },
  { id: "cirg", name: "Cirurgia Geral", weight: 0.036, examWeight: 0.04 },
  { id: "trab", name: "Medicina do Trabalho", weight: 0.052, examWeight: 0.06 },
  { id: "nutri", name: "Nutrição", weight: 0.024, examWeight: 0.015 },
];

const EXAMS: ExamDef[] = [
  { id: "tc", name: "TC", weight: 0.082 },
  { id: "rx", name: "RX", weight: 0.22 },
  { id: "eco", name: "Ecografia", weight: 0.175 },
  { id: "mamo", name: "Mamografia", weight: 0.058 },
  { id: "endoscopia", name: "Endoscopia", weight: 0.048 },
  { id: "colo", name: "Colonoscopia", weight: 0.04 },
  { id: "ecg", name: "ECG", weight: 0.095 },
  { id: "ecocard", name: "Ecocardiograma", weight: 0.055 },
  { id: "holter", name: "Holter", weight: 0.028 },
  { id: "mapa", name: "MAPA", weight: 0.026 },
  { id: "espiro", name: "Espirometria", weight: 0.038 },
  { id: "analises", name: "Análises (colheitas)", weight: 0.135 },
];

const ENTITIES: EntityDef[] = [
  { id: "particular", name: "Particular", weight: 0.22 },
  { id: "medis", name: "Médis", weight: 0.18 },
  { id: "multicare", name: "Multicare", weight: 0.14 },
  { id: "advance", name: "AdvanceCare", weight: 0.1 },
  { id: "adm", name: "ADM", weight: 0.08 },
  { id: "sams", name: "SAMS", weight: 0.07 },
  { id: "allianz", name: "Allianz", weight: 0.05 },
  { id: "fidelidade", name: "Fidelidade", weight: 0.045 },
  { id: "trabalho", name: "Medicina do trabalho (empresas)", weight: 0.075 },
  { id: "outras", name: "Outras", weight: 0.04 },
];

const DOCTORS: DoctorDef[] = [
  { id: "medeiros", name: "Dr.ª Inês Medeiros", specialtyId: "mgf" },
  { id: "pacheco", name: "Dr. Rui Pacheco", specialtyId: "mgf" },
  { id: "couto", name: "Dr.ª Marta Couto", specialtyId: "mgf" },
  { id: "valadao", name: "Dr. Pedro Valadão", specialtyId: "mgf" },
  { id: "lemos", name: "Dr.ª Sofia Lemos", specialtyId: "mgf" },
  { id: "vasconcelos", name: "Dr. Henrique Vasconcelos", specialtyId: "cardio" },
  { id: "camara", name: "Dr.ª Leonor Câmara", specialtyId: "cardio" },
  { id: "serpa", name: "Dr. Miguel Serpa", specialtyId: "cardio", joined: "2026-09" },
  { id: "bulcao", name: "Dr. André Bulcão", specialtyId: "orto" },
  { id: "noronha", name: "Dr.ª Beatriz Noronha", specialtyId: "orto" },
  { id: "melo", name: "Dr. Carlos Tavares", specialtyId: "orto", blocked: "2026-10" },
  { id: "azevedo", name: "Dr.ª Filipa Azevedo", specialtyId: "gine" },
  { id: "bettencourt", name: "Dr.ª Joana Bettencourt", specialtyId: "gine" },
  { id: "ncorreia", name: "Dr. Nuno Correia", specialtyId: "gine" },
  { id: "furtado", name: "Dr. Paulo Furtado", specialtyId: "gastro" },
  { id: "gouveia", name: "Dr.ª Teresa Gouveia", specialtyId: "gastro" },
  { id: "moniz", name: "Dr.ª Clara Moniz", specialtyId: "oftal" },
  { id: "raposo", name: "Dr. Duarte Raposo", specialtyId: "oftal" },
  { id: "silveira", name: "Dr.ª Eva Silveira", specialtyId: "oftal" },
  { id: "ornelas", name: "Dr. Filipe Ornelas", specialtyId: "orl" },
  { id: "quintal", name: "Dr.ª Helena Quintal", specialtyId: "orl" },
  { id: "cunha", name: "Dr.ª Irene Cunha", specialtyId: "pedia" },
  { id: "pinheiro", name: "Dr.ª Lara Pinheiro", specialtyId: "pedia" },
  { id: "rocha", name: "Dr.ª Madalena Rocha", specialtyId: "derm" },
  { id: "teixeira", name: "Dr. Óscar Teixeira", specialtyId: "derm" },
  { id: "linhares", name: "Dr. Vasco Linhares", specialtyId: "uro" },
  { id: "borges", name: "Dr.ª Rita Borges", specialtyId: "uro" },
  { id: "carvalho", name: "Dr.ª Sónia Carvalho", specialtyId: "neuro" },
  { id: "esteves", name: "Dr. Bruno Esteves", specialtyId: "neuro" },
  { id: "pimentel", name: "Dr. Gonçalo Pimentel", specialtyId: "psiq" },
  { id: "cnunes", name: "Dr.ª Catarina Nunes", specialtyId: "psiq" },
  { id: "faria", name: "Dr.ª Daniela Faria", specialtyId: "psico" },
  { id: "matos", name: "Dr. Eduardo Matos", specialtyId: "psico" },
  { id: "flopes", name: "Dr. Fernando Lopes", specialtyId: "pneumo" },
  { id: "mendonca", name: "Dr.ª Graça Mendonça", specialtyId: "pneumo" },
  { id: "andrade", name: "Dr.ª Lúcia Andrade", specialtyId: "endo" },
  { id: "nascimento", name: "Dr. Ivo Nascimento", specialtyId: "endo" },
  { id: "mcorreia", name: "Dr. Manuel Correia", specialtyId: "cirg" },
  { id: "nsousa", name: "Dr.ª Natália Sousa", specialtyId: "cirg" },
  { id: "ramos", name: "Dr.ª Olívia Ramos", specialtyId: "trab" },
  { id: "simoes", name: "Dr. Paulo Simões", specialtyId: "trab" },
  { id: "qmelo", name: "Dr.ª Quitéria Coelho", specialtyId: "nutri" },
];

const SEASON = [0, 0.985, 0.955, 1.025, 1.015, 1.04, 1.025, 0.935, 0.74, 1.07, 1.085, 1.015, 0.93];
const YEAR_FACTOR: Record<number, number> = { 2024: 0.955, 2025: 0.972, 2026: 1.038 };

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export function allocate(total: number, weights: number[]): number[] {
  const safe = weights.map((weight) => (weight > 0 ? weight : 0));
  const weightSum = sum(safe);
  if (weightSum === 0) return safe.map((_, index) => (index === 0 ? total : 0));

  const exact = safe.map((weight) => (weight / weightSum) * total);
  const out = exact.map((value) => Math.floor(value + 1e-9));
  let remainder = total - sum(out);
  const rank = exact
    .map((value, index) => ({ index, frac: value - Math.floor(value + 1e-9) }))
    .sort((a, b) => b.frac - a.frac || a.index - b.index);

  let cursor = 0;
  while (remainder > 0) {
    out[rank[cursor % rank.length].index] += 1;
    remainder -= 1;
    cursor += 1;
  }
  while (remainder < 0) {
    const index = out.findIndex((value) => value > 0);
    out[index] -= 1;
    remainder += 1;
  }
  return out;
}

function allocateWithFixed(total: number, weights: number[], fixed: Record<number, number>) {
  const out = new Array<number>(weights.length).fill(0);
  const freeIndex: number[] = [];
  const freeWeights: number[] = [];
  let used = 0;

  weights.forEach((weight, index) => {
    if (Object.prototype.hasOwnProperty.call(fixed, index)) {
      out[index] = fixed[index];
      used += fixed[index];
    } else {
      freeIndex.push(index);
      freeWeights.push(weight);
    }
  });

  if (used > total) {
    throw new Error(`Parcelas fixas (${used}) excedem o total (${total}).`);
  }

  const rest = allocate(total - used, freeWeights);
  freeIndex.forEach((index, position) => {
    out[index] = rest[position];
  });
  return out;
}

function stepLevels(levels: number[], rng: () => number, spread = 0.016, floor = 0.78, ceiling = 1.28) {
  return levels.map((level) => {
    const shock = 1 - spread / 2 + rng() * spread;
    const reverted = spread > 0.05 ? level * 0.28 + 0.72 : level;
    return clamp(reverted * shock, spread > 0.05 ? floor : 0.94, spread > 0.05 ? ceiling : 1.06);
  });
}

function unitHash(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
}

function displayedRate(count: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((count / total) * 1000) / 10;
}

function monthAt(index: number) {
  const cursor = 2024 * 12 + 10 + index;
  return { year: Math.floor(cursor / 12), month: (cursor % 12) + 1 };
}

function monthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function specialtyIndex(id: string) {
  return SPECIALTIES.findIndex((specialty) => specialty.id === id);
}

function examIndex(id: string) {
  return EXAMS.findIndex((exam) => exam.id === id);
}

function oftalFactor(year: number, month: number) {
  if (year !== 2026) return 1;
  const ramp = [1.1, 1.16, 1.2, 1.24, 1.26, 1.28, 1.3, 1.32, 1.34, 1.36];
  return ramp[month - 1] ?? 1.22;
}

function temperSpecialtyMoves(counts: number[], previousCounts: number[], locked: Set<number>) {
  const previousTotal = sum(previousCounts);
  const total = sum(counts);
  if (previousTotal <= 0) return counts.slice();
  const clinic = total / previousTotal;
  const band = 0.12;
  const lowRatio = Math.max(0.76, clinic - band);
  const highRatio = Math.max(lowRatio, clinic > 1.18 ? clinic + band : Math.min(1.2, clinic + band));
  const next = counts.slice();
  const lowOf = (index: number) => Math.max(1, Math.round(previousCounts[index] * lowRatio));
  const highOf = (index: number) => Math.max(lowOf(index), Math.round(previousCounts[index] * highRatio));

  for (let index = 0; index < next.length; index += 1) {
    if (locked.has(index) || previousCounts[index] <= 0) continue;
    next[index] = Math.min(highOf(index), Math.max(lowOf(index), next[index]));
  }

  let gap = total - sum(next);
  const unlocked = next
    .map((_, index) => index)
    .filter((index) => !locked.has(index) && previousCounts[index] > 0);
  let guard = 0;
  while (gap !== 0 && guard < 50000) {
    let best = -1;
    let bestRoom = 0;
    for (const index of unlocked) {
      const room = gap > 0 ? highOf(index) - next[index] : next[index] - lowOf(index);
      if (room > bestRoom) {
        best = index;
        bestRoom = room;
      }
    }
    if (best < 0 || bestRoom <= 0) break;
    next[best] += Math.sign(gap);
    gap -= Math.sign(gap);
    guard += 1;
  }

  if (gap !== 0 && unlocked.length > 0) {
    const extra = allocate(
      Math.abs(gap),
      unlocked.map((index) => previousCounts[index]),
    );
    unlocked.forEach((index, position) => {
      next[index] += Math.sign(gap) * extra[position];
    });
  }
  return next;
}

function retargetSpecialty(counts: number[], index: number, target: number, protect: Set<number>) {
  const total = sum(counts);
  const delta = target - counts[index];
  counts[index] = target;
  const donors = counts.map((value, donor) => {
    if (donor === index || protect.has(donor) || value < 250) return 0;
    return value;
  });
  const moved = allocate(Math.abs(delta), sum(donors) > 0 ? donors : counts.map((value, donor) => (donor === index || protect.has(donor) ? 0 : value)));
  moved.forEach((value, donor) => {
    counts[donor] += delta > 0 ? -value : value;
  });
  const drift = total - sum(counts);
  if (drift !== 0) {
    const receiver = counts.findIndex((value, donor) => donor !== index && !protect.has(donor) && value > 250);
    if (receiver >= 0) counts[receiver] += drift;
  }
}

function doctorWeight(doctor: DoctorDef, monthId: string) {
  if (doctor.joined && monthId < doctor.joined) return 0;
  if (doctor.id === "serpa" && monthId === "2026-09") return 0.22;
  if (doctor.id === "vasconcelos" && monthId === "2026-09") return 0.4;
  if (doctor.id === "camara" && monthId === "2026-09") return 0.38;
  if (doctor.id === "serpa" && monthId >= "2026-10") return 0.32;
  if (doctor.id === "vasconcelos" && monthId >= "2026-10") return 0.35;
  if (doctor.id === "camara" && monthId >= "2026-10") return 0.33;
  if (doctor.blocked === monthId) return 0.22;
  const base = 0.84 + unitHash(`${doctor.id}:base`) * 0.36;
  const wobble = 0.9 + unitHash(`${doctor.id}:${monthId}:w`) * 0.22;
  return base * wobble;
}

function occupation(doctor: DoctorDef, monthId: string) {
  if (doctor.blocked === monthId) return 38;
  if (doctor.id === "serpa" && monthId === "2026-09") return 64;
  if (doctor.id === "serpa" && monthId === "2026-10") return 84;
  return 58 + Math.floor(unitHash(`${doctor.id}:${monthId}`) * 36);
}

function buildKpis(
  id: string,
  year: number,
  month: number,
  jitter: { c: number; e: number; s: number; n: number; f: number },
) {
  if (id === "2025-09") {
    return { consultas: 5140, exames: 3480, cirurgias: 66, novos: 670, missed: 339 };
  }
  if (id === "2025-10") {
    return { consultas: 5280, exames: 3650, cirurgias: 74, novos: 700, missed: 338 };
  }
  if (id === "2026-09") {
    return { consultas: 5320, exames: 3610, cirurgias: 70, novos: 698, missed: 367 };
  }
  if (id === "2026-10") {
    return { consultas: 5480, exames: 3810, cirurgias: 79, novos: 736, missed: 427 };
  }

  const season = SEASON[month];
  const yearFactor = YEAR_FACTOR[year];
  let consultas = Math.round(5120 * season * yearFactor * jitter.c);
  if (month === 8) consultas = clamp(consultas, 3500, 4200);
  else consultas = clamp(consultas, 4500, 5600);

  let exames = Math.round(consultas * jitter.e);
  if (month === 8) exames = clamp(exames, 2300, 3000);
  else exames = clamp(exames, 3000, 3900);

  let cirurgias = Math.round(76 * season * yearFactor * jitter.s);
  cirurgias = clamp(cirurgias, month === 8 ? 50 : 55, 90);

  let novos = Math.round(consultas * 0.145 * jitter.n);
  if (month === 8) novos = clamp(novos, 500, 680);
  else novos = clamp(novos, 600, 850);

  let rate = 6.35 + (jitter.f - 0.5) * 1.05;
  if (month === 8) rate += 0.45;
  if (month === 12) rate += 0.15;
  if (id === "2025-10") rate = 6.4;
  rate = clamp(Math.round(rate * 10) / 10, 5.5, 8.5);
  const missed = Math.round((consultas * rate) / 100);

  return { consultas, exames, cirurgias, novos, missed };
}

function buildReports() {
  const rng = mulberry32(0xc11a5eed);
  let specLevel = SPECIALTIES.map(() => 1);
  let examLevel = EXAMS.map(() => 1);
  let entityLevel = ENTITIES.map(() => 1);
  let shareLevel = SPECIALTIES.map(() => 1);
  const reports: MonthReport[] = [];

  for (let index = 0; index < 24; index += 1) {
    const { year, month } = monthAt(index);
    const id = monthKey(year, month);
    const jitter = {
      c: 0.99 + rng() * 0.02,
      e: 0.655 + rng() * 0.03,
      s: 0.94 + rng() * 0.12,
      n: 0.96 + rng() * 0.08,
      f: rng(),
    };
    specLevel = stepLevels(specLevel, rng, 0.28, 0.74, 1.34);
    examLevel = stepLevels(examLevel, rng);
    entityLevel = stepLevels(entityLevel, rng, 0.18, 0.84, 1.2);
    shareLevel = stepLevels(shareLevel, rng);
    const noShowNoise = SPECIALTIES.map(() => 0.92 + rng() * 0.16);

    const kpis = buildKpis(id, year, month, jitter);
    const specWeights = SPECIALTIES.map((specialty, specialtyPos) => {
      let weight = specialty.weight * specLevel[specialtyPos];
      if (specialty.id === "oftal") weight *= oftalFactor(year, month);
      return weight;
    });
    const consultasBySpec =
      id === "2026-09"
        ? allocateWithFixed(kpis.consultas, specWeights, {
            [specialtyIndex("cardio")]: 400,
            [specialtyIndex("orto")]: 500,
          })
        : id === "2026-10"
          ? allocateWithFixed(kpis.consultas, specWeights, {
              [specialtyIndex("cardio")]: 448,
              [specialtyIndex("orto")]: 410,
            })
          : allocate(kpis.consultas, specWeights);

    if (id === "2026-10") {
      const previous = reports[reports.length - 1];
      const locked = new Set(["cardio", "orto", "derm", "orl"]);
      const dermIndex = specialtyIndex("derm");
      const orlIndex = specialtyIndex("orl");
      consultasBySpec[dermIndex] = Math.round(previous.specialties[dermIndex].consultas * 0.91);
      consultasBySpec[orlIndex] = Math.round(previous.specialties[orlIndex].consultas * 0.87);
      const used =
        consultasBySpec[specialtyIndex("cardio")] +
        consultasBySpec[specialtyIndex("orto")] +
        consultasBySpec[dermIndex] +
        consultasBySpec[orlIndex];
      const free = SPECIALTIES.map((_, index) => index).filter((index) => !locked.has(SPECIALTIES[index].id));
      const prevFree = free.map((index) => previous.specialties[index].consultas);
      const pool = kpis.consultas - used;
      const required = pool / sum(prevFree) - 1;
      const raw = free.map((index) => unitHash(`oct:${SPECIALTIES[index].id}`) - 0.5);
      const weightedMean = sum(raw.map((value, position) => value * prevFree[position])) / sum(prevFree);
      const centered = raw.map((value) => value - weightedMean);
      const amplitude = 0.11;
      const desired = free.map((index, position) => {
        const pct = clamp(required + centered[position] * amplitude, -0.035, 0.104);
        return Math.max(1, Math.round(prevFree[position] * (1 + pct)));
      });
      let gap = pool - sum(desired);
      let guard = 0;
      while (gap !== 0 && guard < 20000) {
        const position = guard % free.length;
        const prev = prevFree[position];
        const next = desired[position] + Math.sign(gap);
        const pct = (next - prev) / prev;
        if (next >= 1 && pct <= 0.104 && pct >= -0.05) {
          desired[position] = next;
          gap -= Math.sign(gap);
        }
        guard += 1;
      }
      if (gap !== 0) desired[0] += gap;
      free.forEach((index, position) => {
        consultasBySpec[index] = desired[position];
      });
    } else if (reports.length > 0 && id !== "2026-08") {
      const previous = reports[reports.length - 1];
      const locked = new Set<number>();
      if (id === "2026-09") {
        locked.add(specialtyIndex("cardio"));
        locked.add(specialtyIndex("orto"));
      }
      const tempered = temperSpecialtyMoves(
        consultasBySpec,
        previous.specialties.map((row) => row.consultas),
        locked,
      );
      tempered.forEach((value, index) => {
        consultasBySpec[index] = value;
      });
    }

    if (id === "2026-08" && reports.length > 0) {
      const ortoIndex = specialtyIndex("orto");
      const cardioIndex = specialtyIndex("cardio");
      retargetSpecialty(consultasBySpec, ortoIndex, 425, new Set());
      retargetSpecialty(consultasBySpec, cardioIndex, 345, new Set([ortoIndex]));
      const tempered = temperSpecialtyMoves(
        consultasBySpec,
        reports[reports.length - 1].specialties.map((row) => row.consultas),
        new Set([ortoIndex, cardioIndex]),
      );
      tempered.forEach((value, index) => {
        consultasBySpec[index] = value;
      });
    }

    const examShareWeights = SPECIALTIES.map(
      (specialty, specialtyPos) => specialty.examWeight * shareLevel[specialtyPos],
    );
    const examesBySpec = allocate(kpis.exames, examShareWeights);

    const examWeights = EXAMS.map((exam, examPos) => exam.weight * examLevel[examPos]);
    const examValues =
      id === "2026-09"
        ? allocateWithFixed(kpis.exames, examWeights, { [examIndex("rx")]: 820 })
        : id === "2026-10"
          ? allocateWithFixed(kpis.exames, examWeights, { [examIndex("rx")]: 943 })
          : allocate(kpis.exames, examWeights);

    const missedWeights = consultasBySpec.map(
      (consultas, specialtyPos) =>
        consultas *
        noShowNoise[specialtyPos] *
        (SPECIALTIES[specialtyPos].id === "gastro" ? 1.35 : 1),
    );
    const missedBySpec = allocateMissed(id, consultasBySpec, kpis.missed, missedWeights);

    const doctors: DoctorRow[] = [];
    SPECIALTIES.forEach((specialty, specialtyPos) => {
      const group = DOCTORS.filter((doctor) => doctor.specialtyId === specialty.id);
      const weights = group.map((doctor) => doctorWeight(doctor, id));
      const consultas = allocate(consultasBySpec[specialtyPos], weights);
      const exames = allocate(examesBySpec[specialtyPos], weights);
      group.forEach((doctor, doctorPos) => {
        const started = !doctor.joined || id >= doctor.joined;
        doctors.push({
          id: doctor.id,
          name: doctor.name,
          specialtyId: specialty.id,
          specialty: specialty.name,
          consultas: consultas[doctorPos],
          exames: exames[doctorPos],
          ocupacao: occupation(doctor, id),
          active: started,
        });
      });
    });

    if (id === "2026-10") {
      const previous = reports[reports.length - 1];
      const prevOf = (doctorId: string) => previous.doctors.find((row) => row.id === doctorId)!;
      const rowOf = (doctorId: string) => doctors.find((row) => row.id === doctorId)!;
      let bulcao = prevOf("bulcao").consultas + 3 + Math.round(unitHash("bulcao:oct") * 5);
      let noronha = prevOf("noronha").consultas - (2 + Math.round(unitHash("noronha:oct") * 4));
      let tavares = 410 - bulcao - noronha;
      if (tavares < 40) {
        const deficit = 40 - tavares;
        const cut = Math.round((deficit * bulcao) / (bulcao + noronha));
        bulcao -= cut;
        noronha -= deficit - cut;
        tavares = 55;
      }
      const examParts = allocate(examesBySpec[specialtyIndex("orto")], [bulcao, noronha, tavares]);
      const apply = (doctorId: string, consultas: number, exames: number) => {
        const row = rowOf(doctorId);
        row.consultas = consultas;
        row.exames = exames;
      };
      apply("bulcao", bulcao, examParts[0]);
      apply("noronha", noronha, examParts[1]);
      apply("melo", tavares, examParts[2]);
    }

    const entities = ENTITIES.map((entity, entityPos) => ({
      id: entity.id,
      name: entity.name,
      weight: entity.weight * entityLevel[entityPos],
    }));
    const activityTotal = kpis.consultas + kpis.exames + kpis.cirurgias;
    const entityWeights =
      id === "2026-10" && reports.length > 0
        ? entities.map((entity) => {
            const previous = reports[reports.length - 1].entities.find((row) => row.id === entity.id)!;
            const shock = 0.93 + unitHash(`ent-oct:${entity.id}`) * 0.16;
            return Math.max(1, previous.value * shock);
          })
        : entities.map((entity) => entity.weight);
    const entityValues = allocate(activityTotal, entityWeights);

    reports.push({
      id,
      year,
      month,
      label: formatMonthLong(year, month),
      tick: formatMonthTick(year, month),
      consultas: kpis.consultas,
      exames: kpis.exames,
      cirurgias: kpis.cirurgias,
      novos: kpis.novos,
      faltasCount: kpis.missed,
      faltas: displayedRate(kpis.missed, kpis.consultas),
      specialties: SPECIALTIES.map((specialty, specialtyPos) => ({
        id: specialty.id,
        name: specialty.name,
        consultas: consultasBySpec[specialtyPos],
        exames: examesBySpec[specialtyPos],
        faltasCount: missedBySpec[specialtyPos],
        faltas: displayedRate(missedBySpec[specialtyPos], consultasBySpec[specialtyPos]),
      })),
      exams: EXAMS.map((exam, examPos) => ({
        id: exam.id,
        name: exam.name,
        value: examValues[examPos],
        note: exam.id === "rx" && id >= "2026-09" ? "Novo equipamento desde setembro" : undefined,
      })),
      doctors,
      entities: entities.map((entity, entityPos) => ({
        id: entity.id,
        name: entity.name,
        value: entityValues[entityPos],
      })),
    });
  }

  return reports;
}

function allocateMissed(monthId: string, counts: number[], totalMissed: number, weights: number[]) {
  if (monthId !== "2026-10") {
    const raw = allocate(totalMissed, weights);
    return capMissed(raw, counts, totalMissed);
  }

  const gastro = specialtyIndex("gastro");
  let gastroMissed = Math.min(Math.round(counts[gastro] * 0.152), counts[gastro], totalMissed);
  const freeWeights = weights.map((weight, index) => (index === gastro ? 0 : weight));
  const out = allocate(totalMissed - gastroMissed, freeWeights);
  out[gastro] = gastroMissed;

  const rate = (index: number) => (counts[index] > 0 ? out[index] / counts[index] : 0);
  for (let guard = 0; guard < 800; guard += 1) {
    let offender = -1;
    for (let index = 0; index < out.length; index += 1) {
      if (index !== gastro && out[index] > 0 && rate(index) >= rate(gastro)) offender = index;
    }
    if (offender === -1) break;
    out[offender] -= 1;
    out[gastro] += 1;
    gastroMissed += 1;
  }

  return capMissed(out, counts, totalMissed);
}

function capMissed(values: number[], counts: number[], totalMissed: number) {
  const out = values.slice();
  for (let index = 0; index < out.length; index += 1) {
    if (out[index] > counts[index]) out[index] = counts[index];
  }
  let drift = totalMissed - sum(out);
  const order = counts
    .map((count, index) => ({ index, room: count - out[index] }))
    .sort((a, b) => b.room - a.room);
  let cursor = 0;
  while (drift > 0 && cursor < 5000) {
    const target = order[cursor % order.length];
    if (out[target.index] < counts[target.index]) {
      out[target.index] += 1;
      drift -= 1;
    }
    cursor += 1;
    if (cursor > order.length && order.every((item) => out[item.index] >= counts[item.index])) break;
  }
  return out;
}

const REPORTS = buildReports();
const indexById = new Map(REPORTS.map((report, index) => [report.id, index]));

function assertCoherence() {
  if (REPORTS.length !== 24) throw new Error("Devem existir 24 meses.");
  if (REPORTS[0].id !== "2024-11" || REPORTS[23].id !== "2026-10") {
    throw new Error("O intervalo de meses não vai de novembro de 2024 a outubro de 2026.");
  }
  if (DOCTORS.length !== 42) throw new Error("O dataset deve ter 42 médicos fictícios.");

  for (const report of REPORTS) {
    const specConsultas = sum(report.specialties.map((row) => row.consultas));
    const specExames = sum(report.specialties.map((row) => row.exames));
    const examSum = sum(report.exams.map((row) => row.value));
    const doctorConsultas = sum(report.doctors.map((row) => row.consultas));
    const doctorExames = sum(report.doctors.map((row) => row.exames));
    const entitySum = sum(report.entities.map((row) => row.value));
    const missed = sum(report.specialties.map((row) => row.faltasCount));

    if (specConsultas !== report.consultas) {
      throw new Error(`${report.id}: consultas por especialidade (${specConsultas}) ≠ ${report.consultas}`);
    }
    if (specExames !== report.exames || examSum !== report.exames) {
      throw new Error(`${report.id}: exames não fecham (${specExames}/${examSum}/${report.exames}).`);
    }
    if (doctorConsultas !== report.consultas || doctorExames !== report.exames) {
      throw new Error(`${report.id}: totais por médico não fecham.`);
    }
    if (entitySum !== report.consultas + report.exames + report.cirurgias) {
      throw new Error(`${report.id}: atos por entidade não fecham.`);
    }
    if (missed !== report.faltasCount) {
      throw new Error(`${report.id}: faltas por especialidade não fecham.`);
    }
    for (const specialty of report.specialties) {
      const doctors = report.doctors.filter((doctor) => doctor.specialtyId === specialty.id);
      if (sum(doctors.map((doctor) => doctor.consultas)) !== specialty.consultas) {
        throw new Error(`${report.id}: médicos de ${specialty.name} não somam as consultas.`);
      }
    }
  }

  const sep = REPORTS.find((report) => report.id === "2026-09")!;
  const oct = REPORTS.find((report) => report.id === "2026-10")!;
  const atividade = (report: MonthReport) => report.consultas + report.exames + report.cirurgias;
  const atividadeDelta = ((atividade(oct) - atividade(sep)) / atividade(sep)) * 100;
  if (atividadeDelta.toFixed(1) !== "4.1") {
    throw new Error(`Atividade de outubro devia ser +4,1 % e foi ${atividadeDelta}.`);
  }
  if (oct.faltas !== 7.8 || sep.faltas !== 6.9) {
    throw new Error(`Faltas outubro/setembro: ${oct.faltas}/${sep.faltas}.`);
  }

  const specDelta = (id: string) => {
    const current = oct.specialties.find((row) => row.id === id)!.consultas;
    const previous = sep.specialties.find((row) => row.id === id)!.consultas;
    return ((current - previous) / previous) * 100;
  };
  if (specDelta("cardio").toFixed(1) !== "12.0") throw new Error("Cardiologia devia crescer 12 %.");
  if (specDelta("orto").toFixed(1) !== "-18.0") throw new Error("Ortopedia devia cair 18 %.");

  const rxDelta = (() => {
    const current = oct.exams.find((row) => row.id === "rx")!.value;
    const previous = sep.exams.find((row) => row.id === "rx")!.value;
    return ((current - previous) / previous) * 100;
  })();
  if (rxDelta.toFixed(1) !== "15.0") throw new Error("RX devia subir 15 %.");

  const gastro = oct.specialties.find((row) => row.id === "gastro")!;
  const maxRate = Math.max(...oct.specialties.map((row) => row.faltas));
  if (gastro.faltas !== maxRate) throw new Error("A gastrenterologia devia liderar as faltas em outubro.");

  const aug = REPORTS.find((report) => report.id === "2026-08")!;
  const may = REPORTS.find((report) => report.id === "2026-05")!;
  const augRatio = aug.consultas / may.consultas;
  if (augRatio < 0.68 || augRatio > 0.78) {
    throw new Error(`Agosto fora da sazonalidade esperada (${augRatio}).`);
  }

  if (DOCTORS.some((doctor) => doctor.name.includes("Melo"))) {
    throw new Error("Nenhum médico fictício pode usar o apelido Melo.");
  }

  const mgf = oct.doctors.filter((row) => row.specialtyId === "mgf").map((row) => row.consultas);
  if (Math.max(...mgf) - Math.min(...mgf) < 45) {
    throw new Error("As consultas de Medicina Geral estão demasiado próximas.");
  }

  const freeDeltas = SPECIALTIES.filter((row) => !["cardio", "orto", "derm", "orl"].includes(row.id)).map((row) =>
    specDelta(row.id),
  );
  if (Math.max(...freeDeltas) - Math.min(...freeDeltas) < 8) {
    throw new Error("A variação entre especialidades continua demasiado estreita.");
  }
  if (Math.max(...freeDeltas) >= 12) {
    throw new Error("Uma especialidade ultrapassa a subida da cardiologia.");
  }

  const sameWayMonths = REPORTS.slice(1).filter((report, index) => {
    const previous = REPORTS[index];
    const signs = report.specialties.map((row) => {
      const before = previous.specialties.find((item) => item.id === row.id)!.consultas;
      return Math.sign(row.consultas - before);
    });
    const positives = signs.filter((sign) => sign > 0).length;
    return positives === signs.length || positives === 0;
  });
  if (sameWayMonths.length > 10) {
    throw new Error(
      `Demasiados meses em que todas as especialidades se movem no mesmo sentido (${sameWayMonths.map((report) => report.id).join(", ")}).`,
    );
  }

  const oct2025 = REPORTS.find((report) => report.id === "2025-10")!;
  const homologousConsultas = ((oct.consultas - oct2025.consultas) / oct2025.consultas) * 100;
  const homologousNovos = ((oct.novos - oct2025.novos) / oct2025.novos) * 100;
  const homologousAtividade = ((atividade(oct) - atividade(oct2025)) / atividade(oct2025)) * 100;
  if (homologousConsultas < 2 || homologousNovos < 2 || homologousAtividade < 2) {
    throw new Error("Outubro de 2026 devia crescer face a outubro de 2025.");
  }

  const january = REPORTS.find((report) => report.id === "2026-01")!;
  const december = REPORTS.find((report) => report.id === "2025-12")!;
  const januaryDelta = Math.max(
    ...january.specialties.map((row) => {
      const before = december.specialties.find((item) => item.id === row.id)!.consultas;
      return ((row.consultas - before) / before) * 100;
    }),
  );
  const augustDelta = Math.min(
    ...aug.specialties.map((row) => {
      const before = REPORTS.find((report) => report.id === "2026-07")!.specialties.find((item) => item.id === row.id)!
        .consultas;
      return ((row.consultas - before) / before) * 100;
    }),
  );
  if (januaryDelta > 25) throw new Error(`Janeiro tem uma subida de ${januaryDelta.toFixed(1)} %.`);
  if (augustDelta < -28) throw new Error(`Agosto tem uma descida de ${augustDelta.toFixed(1)} %.`);

  const ytdRows = getYtdSpecialtyGrowth("2026-10").rows;
  const ytdLeader = ytdRows[0];
  if (ytdLeader?.id !== "oftal") {
    throw new Error(
      `Oftalmologia devia liderar o ano e lidera ${ytdLeader?.name} (${ytdRows
        .slice(0, 3)
        .map((row) => `${row.name} ${row.delta?.toFixed(1)}`)
        .join(", ")}).`,
    );
  }
}

assertCoherence();

export function atividade(report: Pick<MonthReport, "consultas" | "exames" | "cirurgias">) {
  return report.consultas + report.exames + report.cirurgias;
}

export function percentChange(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

export function percentShares(values: number[]): number[] {
  const total = sum(values);
  if (!total) return values.map(() => 0);
  const exact = values.map((value) => (value / total) * 1000);
  const floors = exact.map((value) => Math.floor(value + 1e-9));
  const remainder = 1000 - sum(floors);
  const rank = exact
    .map((value, index) => ({ index, frac: value - Math.floor(value + 1e-9) }))
    .sort((a, b) => b.frac - a.frac || a.index - b.index);
  const out = floors.slice();
  for (let index = 0; index < remainder; index += 1) out[rank[index].index] += 1;
  return out.map((value) => value / 10);
}

export function getMonth(monthId: string): MonthReport {
  const report = REPORTS.find((item) => item.id === monthId);
  if (!report) throw new Error(`Mês desconhecido: ${monthId}`);
  return report;
}

export function getSelectableMonths() {
  return REPORTS.slice(-12).reverse();
}

export function hasMonth(monthId: string) {
  return indexById.has(monthId);
}

function shiftId(monthId: string, delta: number) {
  const index = indexById.get(monthId);
  if (index === undefined) return null;
  return REPORTS[index + delta]?.id ?? null;
}

export function comparisonPhrase(mode: ComparisonMode) {
  return mode === "previous" ? "face ao mês anterior" : "face ao período homólogo";
}

export function getComparison(monthId: string, mode: ComparisonMode) {
  const current = getMonth(monthId);
  const previousId = shiftId(monthId, mode === "previous" ? -1 : -12);
  if (!previousId) throw new Error(`Sem período de comparação para ${monthId}.`);
  const previous = getMonth(previousId);

  const mapDelta = <T extends { id: string }>(
    rows: T[],
    previousRows: T[],
    read: (row: T) => number,
  ) => {
    const previousById = new Map(previousRows.map((row) => [row.id, read(row)]));
    return Object.fromEntries(
      rows.map((row) => [row.id, percentChange(read(row), previousById.get(row.id) ?? 0)]),
    ) as Record<string, number | null>;
  };

  return {
    mode,
    label: comparisonPhrase(mode),
    current,
    previous,
    deltas: {
      consultas: percentChange(current.consultas, previous.consultas) ?? 0,
      exames: percentChange(current.exames, previous.exames) ?? 0,
      cirurgias: percentChange(current.cirurgias, previous.cirurgias) ?? 0,
      novos: percentChange(current.novos, previous.novos) ?? 0,
      faltasPp: Math.round((current.faltas - previous.faltas) * 10) / 10,
      atividade: percentChange(atividade(current), atividade(previous)) ?? 0,
    },
    specialtyDelta: mapDelta(current.specialties, previous.specialties, (row) => row.consultas),
    examDelta: mapDelta(current.exams, previous.exams, (row) => row.value),
    doctorDelta: mapDelta(current.doctors, previous.doctors, (row) => row.consultas),
    entityDelta: mapDelta(current.entities, previous.entities, (row) => row.value),
  };
}

export function getTrend(metric: TrendMetric, points = 12, monthId = DEFAULT_MONTH_ID) {
  const end = indexById.get(monthId);
  if (end === undefined) throw new Error(`Mês desconhecido: ${monthId}`);
  const start = Math.max(0, end - points + 1);
  return REPORTS.slice(start, end + 1).map((report) => ({
    id: report.id,
    label: MONTHS_SHORT[report.month - 1],
    tick: report.tick,
    value: report[metric],
  }));
}

export type SeriesPoint = {
  id: string;
  label: string;
  tick: string;
  consultas: number;
  exames: number;
  cirurgias: number;
  consultasPrev: number | null;
  examesPrev: number | null;
  cirurgiasPrev: number | null;
};

export function getSeries(monthId: string, points = 12): SeriesPoint[] {
  const end = indexById.get(monthId);
  if (end === undefined) throw new Error(`Mês desconhecido: ${monthId}`);
  const pointsOut: SeriesPoint[] = [];
  for (let index = end - points + 1; index <= end; index += 1) {
    const report = REPORTS[index];
    const previous = REPORTS[index - 12];
    pointsOut.push({
      id: report.id,
      label: MONTHS_SHORT[report.month - 1],
      tick: report.tick,
      consultas: report.consultas,
      exames: report.exames,
      cirurgias: report.cirurgias,
      consultasPrev: previous?.consultas ?? null,
      examesPrev: previous?.exames ?? null,
      cirurgiasPrev: previous?.cirurgias ?? null,
    });
  }
  return pointsOut;
}

export function getSpecialtySeries(monthId: string, specialtyId: string, points = 12) {
  const end = indexById.get(monthId);
  if (end === undefined) throw new Error(`Mês desconhecido: ${monthId}`);
  const pointsOut: { tick: string; consultas: number; faltas: number }[] = [];
  for (let index = Math.max(0, end - points + 1); index <= end; index += 1) {
    const report = REPORTS[index];
    const specialty = report.specialties.find((row) => row.id === specialtyId)!;
    pointsOut.push({
      tick: report.tick,
      consultas: specialty.consultas,
      faltas: specialty.faltas,
    });
  }
  return pointsOut;
}

export function getExamSeries(monthId: string, examId: string, points = 6) {
  const end = indexById.get(monthId);
  if (end === undefined) throw new Error(`Mês desconhecido: ${monthId}`);
  const pointsOut: { tick: string; value: number }[] = [];
  for (let index = Math.max(0, end - points + 1); index <= end; index += 1) {
    const report = REPORTS[index];
    pointsOut.push({
      tick: report.tick,
      value: report.exams.find((row) => row.id === examId)!.value,
    });
  }
  return pointsOut;
}

export type YtdRow = {
  id: string;
  name: string;
  current: number;
  previous: number;
  delta: number | null;
};

export function getYtdSpecialtyGrowth(monthId: string) {
  const selected = getMonth(monthId);
  const currentIds = REPORTS.filter(
    (report) => report.year === selected.year && report.month <= selected.month,
  ).map((report) => report.id);
  const comparable = currentIds.filter((id) => hasMonth(shiftYear(id)));

  const totals = new Map<string, { current: number; previous: number }>();
  for (const specialty of SPECIALTIES) {
    totals.set(specialty.id, { current: 0, previous: 0 });
  }
  for (const id of comparable) {
    const current = getMonth(id);
    const previous = getMonth(shiftYear(id));
    for (const specialty of current.specialties) {
      const bucket = totals.get(specialty.id)!;
      bucket.current += specialty.consultas;
      bucket.previous += previous.specialties.find((row) => row.id === specialty.id)!.consultas;
    }
  }

  const rows: YtdRow[] = SPECIALTIES.map((specialty) => {
    const bucket = totals.get(specialty.id)!;
    return {
      id: specialty.id,
      name: specialty.name,
      current: bucket.current,
      previous: bucket.previous,
      delta: percentChange(bucket.current, bucket.previous),
    };
  }).sort((a, b) => (b.delta ?? -Infinity) - (a.delta ?? -Infinity));

  const first = getMonth(comparable[0]);
  const last = getMonth(comparable[comparable.length - 1]);
  const period =
    comparable.length === 1
      ? first.label
      : first.year === last.year
        ? `${longName(first.month)} a ${longName(last.month)} de ${last.year}`
        : `${first.label} a ${last.label}`;

  return { rows, period, comparableMonths: comparable.length };
}

function longName(month: number) {
  return formatMonthLong(2000, month).split(" de ")[0];
}

function shiftYear(monthId: string) {
  const [year, month] = monthId.split("-");
  return `${Number(year) - 1}-${month}`;
}

export function getSpecialtyNote(monthId: string, specialtyId: string) {
  if (monthId === "2026-10" && specialtyId === "orto") {
    return "O Dr. Carlos Tavares teve a agenda bloqueada de 13 a 24 de outubro. Os outros ortopedistas mantiveram um volume próximo do de setembro.";
  }
  if ((monthId === "2026-09" || monthId === "2026-10") && specialtyId === "cardio") {
    return "O Dr. Miguel Serpa entrou em setembro de 2026. Em outubro a agenda nova aproxima-se da ocupação dos colegas.";
  }
  if (monthId === "2026-10" && specialtyId === "gastro") {
    return "A taxa de faltas desta especialidade é a mais alta do mês, concentrada nos exames com preparação (endoscopia e colonoscopia).";
  }
  return null;
}

export function getNextSend(monthId: string) {
  const report = getMonth(monthId);
  const date = new Date(report.year, report.month + 1, 1);
  return `${formatLongDate(date.getFullYear(), date.getMonth(), 1)}, 07:00`;
}

export function getSendHistory(monthId: string) {
  const report = getMonth(monthId);
  const generated = new Date(report.year, report.month, 1);
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(generated.getFullYear(), generated.getMonth() - index, 1);
    return {
      dateLabel: `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`,
      recipients: "Direção geral, Holding Marques SGPS",
      status: "Enviado" as const,
    };
  });
}

export function getGeneratedLabel(monthId: string) {
  const report = getMonth(monthId);
  return formatGeneratedAt(report.year, report.month);
}

export function getSourceLine(monthId: string) {
  const report = getMonth(monthId);
  return `Fonte: atividade de ${report.label} · exportação de ${formatGeneratedShort(report.year, report.month)}`;
}

export function listSpecialties() {
  return SPECIALTIES.map((specialty) => ({ id: specialty.id, name: specialty.name }));
}
