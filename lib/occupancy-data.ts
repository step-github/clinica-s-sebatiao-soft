import { formatHoursPT, formatPercentPT, MONTHS_SHORT } from "@/lib/format";
import { allocate, getMonth, hasMonth, percentChange, type MonthReport } from "@/lib/mock-data";

export const DEFAULT_THRESHOLDS = {
  equipmentBelow: 70,
  absencesAbove: 10,
  doctorsBelow: 50,
};

export type Thresholds = typeof DEFAULT_THRESHOLDS;
export type ResourceKind = "equipamento" | "sala";
export type BlockState = "marcado" | "falta" | "livre" | "bloqueado";
export type ViewFilter = "todos" | "equipamentos" | "salas" | "medicos";

export type TimelineBlock = {
  start: number;
  end: number;
  state: BlockState;
  label: string;
};

export type HeatCell = {
  weekday: number;
  start: number;
  closed: boolean;
  occupancy: number | null;
  idleHours: number;
  capacityMin: number;
};

export type DayPlan = {
  iso: string;
  day: number;
  weekday: number;
  capacityMin: number;
  bookedMin: number;
  performedMin: number;
  segments: TimelineBlock[];
};

export type ExamLine = { name: string; value: number };

export type ResourceMonth = {
  id: string;
  name: string;
  short: string;
  kind: ResourceKind;
  duration: number | null;
  occupancy: number;
  idleHours: number;
  noshowRate: number;
  noshowHours: number;
  capacityHours: number;
  bookedHours: number;
  delta: number | null;
  exams: ExamLine[];
  note?: string;
  emptyWednesdays: number;
  wednesdayIdleHours: number;
  reading: string;
  days: DayPlan[];
  cells: HeatCell[];
};

export type DoctorOccupancy = {
  id: string;
  name: string;
  specialtyId: string;
  specialty: string;
  availableHours: number;
  bookedHours: number;
  occupancy: number;
  noshowRate: number;
  delta: number | null;
  idleHours: number;
  blockedLabel?: string;
  shiftDays: number[];
  shiftFrom: number;
  shiftTo: number;
  blockedDays: number[];
};

export type CalendarDay = { iso: string; day: number; weekday: number };

export type WeekOption = {
  start: string;
  label: string;
  days: CalendarDay[];
};

type Shift = { days: number[]; from: number; to: number };

type ResourceDef = {
  id: string;
  name: string;
  short: string;
  kind: ResourceKind;
  duration: number | null;
  article: string;
  readingName: string;
  shifts: Shift[];
  group: "equipamento" | "sala" | "gabinete";
};

type Atom = {
  day: number;
  weekday: number;
  iso: string;
  start: number;
  pref: number;
  booked: number;
  performed: number;
};

const WEEKDAY_NAME = ["", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
const WEEKDAY_PLURAL = ["", "as segundas", "as terças", "as quartas", "as quintas", "as sextas", "os sábados"];

const BASE_RESOURCES: ResourceDef[] = [
  {
    id: "tc",
    name: "TC",
    short: "TC",
    kind: "equipamento",
    duration: 20,
    article: "da",
    readingName: "TC",
    group: "equipamento",
    shifts: [
      { days: [1, 2, 3, 4], from: 8 * 60, to: 13 * 60 + 30 },
      { days: [5], from: 8 * 60, to: 13 * 60 },
      { days: [5], from: 14 * 60, to: 18 * 60 },
      { days: [6], from: 8 * 60, to: 13 * 60 },
    ],
  },
  {
    id: "rx",
    name: "RX (MULTIX Impact C)",
    short: "RX",
    kind: "equipamento",
    duration: 10,
    article: "do",
    readingName: "RX",
    group: "equipamento",
    shifts: [
      { days: [1, 2, 3, 4, 5], from: 7 * 60 + 30, to: 15 * 60 },
      { days: [6], from: 8 * 60, to: 13 * 60 },
    ],
  },
  {
    id: "mamo",
    name: "Mamógrafo",
    short: "Mamógrafo",
    kind: "equipamento",
    duration: 20,
    article: "do",
    readingName: "mamógrafo",
    group: "equipamento",
    shifts: [{ days: [1, 2, 3, 4, 5], from: 9 * 60, to: 13 * 60 + 30 }],
  },
  {
    id: "eco1",
    name: "Ecógrafo 1",
    short: "Eco 1",
    kind: "equipamento",
    duration: 20,
    article: "do",
    readingName: "ecógrafo 1",
    group: "equipamento",
    shifts: [{ days: [1, 2, 3, 4, 5], from: 7 * 60 + 30, to: 18 * 60 }],
  },
  {
    id: "eco2",
    name: "Ecógrafo 2",
    short: "Eco 2",
    kind: "equipamento",
    duration: 20,
    article: "do",
    readingName: "ecógrafo 2",
    group: "equipamento",
    shifts: [{ days: [1, 2, 3, 4, 5], from: 14 * 60, to: 17 * 60 }],
  },
  {
    id: "endo",
    name: "Sala de endoscopia",
    short: "Endoscopia",
    kind: "sala",
    duration: 30,
    article: "da",
    readingName: "sala de endoscopia",
    group: "sala",
    shifts: [{ days: [1, 2, 3, 4, 5], from: 7 * 60 + 30, to: 20 * 60 }],
  },
  {
    id: "bloco",
    name: "Bloco de ambulatório",
    short: "Bloco",
    kind: "sala",
    duration: 90,
    article: "do",
    readingName: "bloco",
    group: "sala",
    shifts: [{ days: [1, 2, 3, 4, 5], from: 8 * 60, to: 17 * 60 }],
  },
  {
    id: "cardio",
    name: "Sala de cardiologia",
    short: "Cardiologia",
    kind: "sala",
    duration: 30,
    article: "da",
    readingName: "sala de cardiologia",
    group: "sala",
    shifts: [
      { days: [1, 2, 3, 4, 5], from: 7 * 60 + 30, to: 20 * 60 },
      { days: [6], from: 8 * 60, to: 13 * 60 },
    ],
  },
];

const GABINETES: ResourceDef[] = Array.from({ length: 12 }, (_, index) => {
  const number = index + 1;
  const morning = index % 2 === 0;
  return {
    id: `gab-${number}`,
    name: `Gabinete ${number}`,
    short: `Gab. ${number}`,
    kind: "sala" as const,
    duration: null,
    article: "do",
    readingName: `gabinete ${number}`,
    group: "gabinete" as const,
    shifts: [
      {
        days: [1, 2, 3, 4, 5],
        from: morning ? 8 * 60 : 14 * 60,
        to: morning ? 13 * 60 : 19 * 60,
      },
    ],
  };
});

const RESOURCES: ResourceDef[] = [...BASE_RESOURCES, ...GABINETES];

const NOSHOW: Record<string, number> = {
  tc: 0.0676,
  rx: 0.035,
  mamo: 0.06,
  eco1: 0.05,
  eco2: 0.06,
  bloco: 0.05,
  cardio: 0.04,
};

function unitHash(seed: string) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function monthIds() {
  const ids: string[] = [];
  let year = 2024;
  let month = 11;
  for (let index = 0; index < 24; index += 1) {
    const id = `${year}-${String(month).padStart(2, "0")}`;
    if (!hasMonth(id)) break;
    ids.push(id);
    month += 1;
    if (month === 13) {
      month = 1;
      year += 1;
    }
  }
  return ids;
}

function calendarOf(year: number, month: number): CalendarDay[] {
  const last = new Date(year, month, 0).getDate();
  const days: CalendarDay[] = [];
  for (let day = 1; day <= last; day += 1) {
    const date = new Date(year, month - 1, day);
    const weekday = date.getDay();
    if (weekday === 0) continue;
    days.push({
      iso: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      day,
      weekday,
    });
  }
  return days;
}

function slotStarts(weekday: number) {
  const from = weekday === 6 ? 8 * 60 : 7 * 60 + 30;
  const to = weekday === 6 ? 13 * 60 : 20 * 60;
  const starts: number[] = [];
  for (let start = from; start < to; start += 30) starts.push(start);
  return starts;
}

function covered(shifts: Shift[], weekday: number, start: number) {
  return shifts.some((shift) => shift.days.includes(weekday) && start >= shift.from && start + 30 <= shift.to);
}

function preference(id: string, weekday: number, start: number) {
  if (id === "bloco" && weekday === 3) return 0;
  if (id === "tc") {
    if (weekday === 6 || (weekday === 5 && start >= 14 * 60)) return 0.4;
    return 1;
  }
  if (id === "rx") {
    if (weekday === 6) return 0.55;
    if (start < 13 * 60) return 1;
    return 0.65;
  }
  if (id === "eco2" && weekday === 5) return 0.7;
  return 1;
}

function buildAtoms(days: CalendarDay[], resource: ResourceDef): Atom[] {
  const atoms: Atom[] = [];
  for (const day of days) {
    for (const start of slotStarts(day.weekday)) {
      if (!covered(resource.shifts, day.weekday, start)) continue;
      atoms.push({
        day: day.day,
        weekday: day.weekday,
        iso: day.iso,
        start,
        pref: preference(resource.id, day.weekday, start),
        booked: 0,
        performed: 0,
      });
    }
  }
  return atoms;
}

function distribute(total: number, caps: number[], prefs: number[]) {
  const room = caps.map((cap, index) => (prefs[index] > 0 ? cap : 0));
  if (total <= 0 || sum(room) <= 0) return caps.map(() => 0);
  const target = Math.min(total, sum(room));
  const out = room.map(() => 0);
  let left = target;
  for (let guard = 0; guard < 8 && left > 0; guard += 1) {
    const space = room.map((cap, index) => cap - out[index]);
    const weights = space.map((value, index) => (value > 0 ? value * Math.max(prefs[index], 0.0001) : 0));
    if (sum(weights) <= 0) break;
    const extra = allocate(left, weights);
    for (let index = 0; index < out.length; index += 1) {
      const add = Math.min(space[index], extra[index] ?? 0);
      out[index] += add;
    }
    left = target - sum(out);
  }
  for (let index = 0; index < out.length && left > 0; index += 1) {
    const add = Math.min(left, room[index] - out[index]);
    out[index] += add;
    left -= add;
  }
  return out;
}

function examValue(report: MonthReport, id: string) {
  return report.exams.find((exam) => exam.id === id)?.value ?? 0;
}

function solveBookedCount(performed: number, ratePercent: number) {
  for (let missed = 0; missed <= performed + 5; missed += 1) {
    const booked = performed + missed;
    if (!booked) continue;
    const shown = Math.round((missed / booked) * 1000) / 10;
    if (shown === ratePercent) return booked;
  }
  return Math.max(performed, Math.round(performed / (1 - ratePercent / 100)));
}

function splitEco(total: number, eco2Capacity: number) {
  const maxMinutes = eco2Capacity * 0.47 * 0.94;
  const maxExams = Math.max(0, Math.floor(maxMinutes / 20));
  const wanted = Math.round(total * 0.22);
  const eco2 = Math.max(0, Math.min(total, wanted, maxExams));
  return { eco1: total - eco2, eco2 };
}

function cardioMinutes(report: MonthReport) {
  return (
    examValue(report, "ecg") * 15 +
    examValue(report, "ecocard") * 30 +
    examValue(report, "holter") * 12 +
    examValue(report, "mapa") * 12
  );
}

function actLabel(resource: ResourceDef, report: MonthReport, seed: string) {
  if (resource.id === "endo") {
    const endo = examValue(report, "endoscopia");
    const colo = examValue(report, "colo");
    return unitHash(seed) < endo / Math.max(1, endo + colo) ? "Endoscopia" : "Colonoscopia";
  }
  if (resource.id === "cardio") {
    const options = [
      ["ECG", examValue(report, "ecg")],
      ["Ecocardiograma", examValue(report, "ecocard")],
      ["Holter", examValue(report, "holter")],
      ["MAPA", examValue(report, "mapa")],
    ] as const;
    const total = sum(options.map((option) => option[1]));
    let cursor = unitHash(seed) * total;
    for (const [name, weight] of options) {
      cursor -= weight;
      if (cursor <= 0) return name;
    }
    return "ECG";
  }
  if (resource.id === "bloco") return "Cirurgia de ambulatório";
  if (resource.id === "eco1" || resource.id === "eco2") return "Ecografia";
  if (resource.group === "gabinete") return "Consulta";
  if (resource.id === "mamo") return "Mamografia";
  return resource.short;
}

function paintAtoms(resource: ResourceDef, report: MonthReport, atoms: Atom[]): Map<string, TimelineBlock[]> {
  const byDay = new Map<string, TimelineBlock[]>();
  const groups = new Map<string, Atom[]>();
  for (const atom of atoms) {
    const list = groups.get(atom.iso) ?? [];
    list.push(atom);
    groups.set(atom.iso, list);
  }
  for (const [iso, list] of groups) {
    const noshowBudget = sum(list.map((atom) => atom.booked - atom.performed));
    const candidates = list
      .filter((atom) => atom.booked >= 20)
      .slice()
      .sort((a, b) => unitHash(`${resource.id}:${iso}:${a.start}`) - unitHash(`${resource.id}:${iso}:${b.start}`));
    const falta = new Set<number>();
    let used = 0;
    for (const atom of candidates) {
      if (used >= noshowBudget) break;
      falta.add(atom.start);
      used += atom.booked;
    }
    const segments: TimelineBlock[] = [];
    for (const atom of list) {
      const label = actLabel(resource, report, `${resource.id}:${iso}:${atom.start}`);
      if (falta.has(atom.start)) {
        segments.push({ start: atom.start, end: atom.start + atom.booked, state: "falta", label });
        if (atom.booked < 30) {
          segments.push({ start: atom.start + atom.booked, end: atom.start + 30, state: "livre", label: "Livre" });
        }
      } else if (atom.booked > 0) {
        segments.push({ start: atom.start, end: atom.start + atom.booked, state: "marcado", label });
        if (atom.booked < 30) {
          segments.push({ start: atom.start + atom.booked, end: atom.start + 30, state: "livre", label: "Livre" });
        }
      } else {
        segments.push({ start: atom.start, end: atom.start + 30, state: "livre", label: "Livre" });
      }
    }
    byDay.set(iso, mergeSegments(segments));
  }
  return byDay;
}

function mergeSegments(segments: TimelineBlock[]) {
  const merged: TimelineBlock[] = [];
  for (const segment of segments) {
    if (segment.end <= segment.start) continue;
    const previous = merged[merged.length - 1];
    if (previous && previous.state === segment.state && previous.label === segment.label && previous.end === segment.start) {
      previous.end = segment.end;
    } else {
      merged.push({ ...segment });
    }
  }
  return merged;
}

function monthNote(id: string, monthId: string) {
  if (id === "rx" && monthId >= "2026-09") return "Equipamento novo desde setembro de 2026";
  if (id === "eco2") return "Só de tarde";
  if (id === "endo") return "Endoscopia e colonoscopia";
  if (id === "cardio") return "O Holter e o MAPA ocupam a sala só na colocação e na leitura.";
  return undefined;
}

function examLines(resource: ResourceDef, report: MonthReport, eco: { eco1: number; eco2: number }): ExamLine[] {
  if (resource.id === "tc") return [{ name: "TC", value: examValue(report, "tc") }];
  if (resource.id === "rx") return [{ name: "RX", value: examValue(report, "rx") }];
  if (resource.id === "mamo") return [{ name: "Mamografia", value: examValue(report, "mamo") }];
  if (resource.id === "eco1") return [{ name: "Ecografia", value: eco.eco1 }];
  if (resource.id === "eco2") return [{ name: "Ecografia", value: eco.eco2 }];
  if (resource.id === "endo") {
    return [
      { name: "Endoscopia", value: examValue(report, "endoscopia") },
      { name: "Colonoscopia", value: examValue(report, "colo") },
    ];
  }
  if (resource.id === "bloco") return [{ name: "Cirurgias de ambulatório", value: report.cirurgias }];
  if (resource.id === "cardio") {
    return [
      { name: "ECG", value: examValue(report, "ecg") },
      { name: "Ecocardiograma", value: examValue(report, "ecocard") },
      { name: "Holter", value: examValue(report, "holter") },
      { name: "MAPA", value: examValue(report, "mapa") },
    ];
  }
  return [];
}

function volumeMinutes(resource: ResourceDef, report: MonthReport, eco: { eco1: number; eco2: number }) {
  if (resource.group === "gabinete") return null;
  if (resource.id === "cardio") {
    const performedMin = cardioMinutes(report);
    return { count: sum(examLines(resource, report, eco).map((line) => line.value)), performedMin, bookedMin: Math.round(performedMin / 0.96) };
  }
  const count =
    resource.id === "eco1"
      ? eco.eco1
      : resource.id === "eco2"
        ? eco.eco2
        : resource.id === "endo"
          ? examValue(report, "endoscopia") + examValue(report, "colo")
          : resource.id === "bloco"
            ? report.cirurgias
            : examValue(report, resource.id === "mamo" ? "mamo" : resource.id);
  const duration = resource.duration ?? 20;
  const performedMin = count * duration;
  if (resource.id === "endo") {
    const rate = report.specialties.find((specialty) => specialty.id === "gastro")?.faltas ?? 15;
    return { count, performedMin, bookedMin: solveBookedCount(count, rate) * duration };
  }
  const rate = NOSHOW[resource.id] ?? 0.05;
  return { count, performedMin, bookedMin: Math.round(performedMin / (1 - rate)) };
}

function heatGrid(atoms: Atom[]) {
  const grouped = new Map<string, { capacity: number; booked: number; performed: number }>();
  for (const atom of atoms) {
    const key = `${atom.weekday}:${atom.start}`;
    const current = grouped.get(key) ?? { capacity: 0, booked: 0, performed: 0 };
    current.capacity += 30;
    current.booked += atom.booked;
    current.performed += atom.performed;
    grouped.set(key, current);
  }
  const columns = slotStarts(1);
  const cells: HeatCell[] = [];
  for (let weekday = 1; weekday <= 6; weekday += 1) {
    for (const start of columns) {
      const clinic = slotStarts(weekday).includes(start);
      const stats = grouped.get(`${weekday}:${start}`);
      if (!clinic || !stats || stats.capacity === 0) {
        cells.push({ weekday, start, closed: true, occupancy: null, idleHours: 0, capacityMin: 0 });
        continue;
      }
      cells.push({
        weekday,
        start,
        closed: false,
        occupancy: (stats.booked / stats.capacity) * 100,
        idleHours: (stats.capacity - stats.performed) / 60,
        capacityMin: stats.capacity,
      });
    }
  }
  return cells;
}

function readingFor(resource: ResourceDef, cells: HeatCell[]) {
  const open = cells.filter((cell) => !cell.closed && cell.capacityMin > 0);
  const totalIdle = sum(open.map((cell) => cell.idleHours));
  if (totalIdle <= 0) return `A ${resource.readingName} manteve a agenda preenchida neste mês.`;
  const fridaySaturday = open.filter((cell) => cell.weekday === 6 || (cell.weekday === 5 && cell.start >= 14 * 60));
  const share = sum(fridaySaturday.map((cell) => cell.idleHours)) / totalIdle;
  if (fridaySaturday.length > 0 && share >= 0.4) {
    return `As tardes de sexta e os sábados concentram ${formatPercentPT(share * 100, 0)} das horas paradas ${resource.article} ${resource.readingName}.`;
  }
  let quiet = 1;
  let quietIdle = -1;
  for (let weekday = 1; weekday <= 6; weekday += 1) {
    const idle = sum(open.filter((cell) => cell.weekday === weekday).map((cell) => cell.idleHours));
    if (idle > quietIdle) {
      quietIdle = idle;
      quiet = weekday;
    }
  }
  const quietShare = quietIdle / totalIdle;
  if (quietShare >= 0.28) {
    return `${WEEKDAY_PLURAL[quiet][0].toUpperCase()}${WEEKDAY_PLURAL[quiet].slice(1)} concentram ${formatPercentPT(quietShare * 100, 0)} das horas paradas ${resource.article} ${resource.readingName}.`;
  }
  return `As horas paradas ${resource.article} ${resource.readingName} distribuem-se ao longo da semana.`;
}

function doctorShift(id: string): Shift {
  if (id === "melo") return { days: [1, 2, 3, 4, 5], from: 8 * 60, to: 14 * 60 };
  const days = [1, 2, 3, 4, 5].filter((day) => unitHash(`${id}:day:${day}`) >= 0.42);
  for (const day of [2, 4, 1, 3, 5]) {
    if (days.length >= 3) break;
    if (!days.includes(day)) days.push(day);
  }
  const afternoon = unitHash(`${id}:half`) >= 0.55;
  return {
    days: days.sort((a, b) => a - b),
    from: afternoon ? 13 * 60 : 8 * 60,
    to: afternoon ? 19 * 60 : 14 * 60,
  };
}

type Snapshot = {
  monthId: string;
  label: string;
  monthName: string;
  calendar: CalendarDay[];
  resources: ResourceMonth[];
  doctors: DoctorOccupancy[];
  equipmentOccupancy: number;
  equipmentIdleHours: number;
  examNoShow: number;
  doctorOccupancy: number;
};

function buildSnapshot(monthId: string, previous: Snapshot | null): Snapshot {
  const report = getMonth(monthId);
  const calendar = calendarOf(report.year, report.month);
  const eco2Resource = RESOURCES.find((resource) => resource.id === "eco2")!;
  const eco = splitEco(examValue(report, "eco"), buildAtoms(calendar, eco2Resource).length * 30);
  const resources: ResourceMonth[] = RESOURCES.map((resource) => {
    const atoms = buildAtoms(calendar, resource);
    const caps = atoms.map(() => 30);
    const prefs = atoms.map((atom) => atom.pref);
    const capacityMin = atoms.length * 30;
    let bookedMin = 0;
    let performedMin = 0;
    if (resource.group === "gabinete") {
      const target = Math.min(0.92, Math.max(0.72, 0.76 + (unitHash(`${resource.id}:occ`) - 0.5) * 0.16 + (unitHash(`${resource.id}:${monthId}`) - 0.5) * 0.04));
      bookedMin = Math.round(capacityMin * target);
      performedMin = Math.round(bookedMin * 0.92);
    } else {
      const volume = volumeMinutes(resource, report, eco)!;
      performedMin = volume.performedMin;
      bookedMin = Math.min(capacityMin, volume.bookedMin);
    }
    const booked = distribute(bookedMin, caps, prefs);
    const performed = distribute(
      Math.min(performedMin, sum(booked)),
      booked,
      booked.map((value) => value),
    );
    atoms.forEach((atom, index) => {
      atom.booked = booked[index] ?? 0;
      atom.performed = Math.min(atom.booked, performed[index] ?? 0);
    });
    const usedBooked = sum(atoms.map((atom) => atom.booked));
    const usedPerformed = sum(atoms.map((atom) => atom.performed));
    const cells = heatGrid(atoms);
    const painted = paintAtoms(resource, report, atoms);
    const days: DayPlan[] = calendar.map((day) => {
      const todays = atoms.filter((atom) => atom.iso === day.iso);
      return {
        iso: day.iso,
        day: day.day,
        weekday: day.weekday,
        capacityMin: todays.length * 30,
        bookedMin: sum(todays.map((atom) => atom.booked)),
        performedMin: sum(todays.map((atom) => atom.performed)),
        segments: painted.get(day.iso) ?? [],
      };
    });
    const wednesdays = days.filter((day) => day.weekday === 3 && day.capacityMin > 0);
    const emptyWednesdays = wednesdays.filter((day) => day.bookedMin === 0).length;
    const wednesdayIdleHours = sum(wednesdays.filter((day) => day.bookedMin === 0).map((day) => day.capacityMin)) / 60;
    const occupancy = capacityMin > 0 ? (usedBooked / capacityMin) * 100 : 0;
    const previousResource = previous?.resources.find((item) => item.id === resource.id);
    return {
      id: resource.id,
      name: resource.name,
      short: resource.short,
      kind: resource.kind,
      duration: resource.duration,
      occupancy,
      idleHours: (capacityMin - usedPerformed) / 60,
      noshowRate: usedBooked > 0 ? ((usedBooked - usedPerformed) / usedBooked) * 100 : 0,
      noshowHours: (usedBooked - usedPerformed) / 60,
      capacityHours: capacityMin / 60,
      bookedHours: usedBooked / 60,
      delta: previousResource ? occupancy - previousResource.occupancy : null,
      exams: examLines(resource, report, eco),
      note: monthNote(resource.id, monthId),
      emptyWednesdays,
      wednesdayIdleHours,
      reading: readingFor(resource, cells),
      days,
      cells,
    };
  });

  const missedByDoctor = new Map<string, number>();
  for (const specialty of report.specialties) {
    const doctors = report.doctors.filter((doctor) => doctor.active && doctor.specialtyId === specialty.id && doctor.consultas > 0);
    const counts = allocate(
      specialty.faltasCount,
      doctors.map((doctor) => doctor.consultas),
    );
    doctors.forEach((doctor, index) => missedByDoctor.set(doctor.id, counts[index] ?? 0));
  }

  const doctors: DoctorOccupancy[] = report.doctors
    .filter((doctor) => doctor.active)
    .map((doctor) => {
      const shift = doctorShift(doctor.id);
      const blockedDays =
        doctor.id === "melo" && monthId === "2026-10"
          ? calendar.filter((day) => day.day >= 13 && day.day <= 24 && shift.days.includes(day.weekday)).map((day) => day.day)
          : [];
      const working = calendar.filter((day) => shift.days.includes(day.weekday) && !blockedDays.includes(day.day));
      const availableMin = working.length * (shift.to - shift.from);
      const bookedMin = Math.round((availableMin * doctor.ocupacao) / 100);
      const missed = missedByDoctor.get(doctor.id) ?? 0;
      const previousDoctor = previous?.doctors.find((item) => item.id === doctor.id);
      return {
        id: doctor.id,
        name: doctor.name,
        specialtyId: doctor.specialtyId,
        specialty: doctor.specialty,
        availableHours: availableMin / 60,
        bookedHours: bookedMin / 60,
        occupancy: doctor.ocupacao,
        noshowRate: doctor.consultas > 0 ? Math.round((missed / doctor.consultas) * 1000) / 10 : 0,
        delta: previousDoctor ? doctor.ocupacao - previousDoctor.occupancy : null,
        idleHours: (availableMin - bookedMin) / 60,
        blockedLabel: blockedDays.length > 0 ? "Agenda bloqueada 13–24 out" : undefined,
        shiftDays: shift.days,
        shiftFrom: shift.from,
        shiftTo: shift.to,
        blockedDays,
      };
    });

  const equipment = resources.filter((resource) => resource.kind === "equipamento");
  const equipmentCapacity = sum(equipment.map((resource) => resource.capacityHours));
  const equipmentBooked = sum(equipment.map((resource) => resource.bookedHours));
  const examRooms = resources.filter((resource) => ["tc", "rx", "mamo", "eco1", "eco2", "endo", "cardio"].includes(resource.id));
  const examBooked = sum(examRooms.map((resource) => resource.bookedHours));
  const examMissed = sum(examRooms.map((resource) => resource.noshowHours));
  const doctorAvailable = sum(doctors.map((doctor) => doctor.availableHours));
  const doctorBooked = sum(doctors.map((doctor) => doctor.bookedHours));

  return {
    monthId,
    label: report.label,
    monthName: report.label.split(" de ")[0],
    calendar,
    resources,
    doctors,
    equipmentOccupancy: equipmentCapacity > 0 ? (equipmentBooked / equipmentCapacity) * 100 : 0,
    equipmentIdleHours: sum(equipment.map((resource) => resource.idleHours)),
    examNoShow: examBooked > 0 ? (examMissed / examBooked) * 100 : 0,
    doctorOccupancy: doctorAvailable > 0 ? (doctorBooked / doctorAvailable) * 100 : 0,
  };
}

const SNAPSHOTS: Snapshot[] = [];
for (const monthId of monthIds()) {
  SNAPSHOTS.push(buildSnapshot(monthId, SNAPSHOTS[SNAPSHOTS.length - 1] ?? null));
}

const byId = new Map(SNAPSHOTS.map((snapshot) => [snapshot.monthId, snapshot]));

function snapshot(monthId: string) {
  const found = byId.get(monthId);
  if (!found) throw new Error(`Mês desconhecido: ${monthId}`);
  return found;
}

function trail(monthId: string, read: (item: Snapshot) => number) {
  const end = SNAPSHOTS.findIndex((item) => item.monthId === monthId);
  const start = Math.max(0, end - 11);
  return SNAPSHOTS.slice(start, end + 1).map(read);
}

export function getOccupancy(monthId: string) {
  const current = snapshot(monthId);
  const previous = SNAPSHOTS[SNAPSHOTS.findIndex((item) => item.monthId === monthId) - 1] ?? null;
  return {
    monthId: current.monthId,
    label: current.label,
    monthName: current.monthName,
    kpis: {
      equipmentOccupancy: current.equipmentOccupancy,
      equipmentIdleHours: current.equipmentIdleHours,
      examNoShow: current.examNoShow,
      doctorOccupancy: current.doctorOccupancy,
    },
    deltas: {
      equipmentOccupancy: previous ? current.equipmentOccupancy - previous.equipmentOccupancy : null,
      equipmentIdleHours: previous ? percentChange(current.equipmentIdleHours, previous.equipmentIdleHours) : null,
      examNoShow: previous ? current.examNoShow - previous.examNoShow : null,
      doctorOccupancy: previous ? current.doctorOccupancy - previous.doctorOccupancy : null,
    },
    series: {
      equipmentOccupancy: trail(monthId, (item) => item.equipmentOccupancy),
      equipmentIdleHours: trail(monthId, (item) => item.equipmentIdleHours),
      examNoShow: trail(monthId, (item) => item.examNoShow),
      doctorOccupancy: trail(monthId, (item) => item.doctorOccupancy),
    },
    resources: current.resources.map((resource) => ({
      ...resource,
      spark: trail(monthId, (item) => item.resources.find((entry) => entry.id === resource.id)?.occupancy ?? 0),
    })),
  };
}

export function getResourceDetail(resourceId: string, monthId: string) {
  const current = snapshot(monthId).resources.find((resource) => resource.id === resourceId);
  if (!current) throw new Error(`Recurso desconhecido: ${resourceId}`);
  const end = SNAPSHOTS.findIndex((item) => item.monthId === monthId);
  const start = Math.max(0, end - 11);
  const series = SNAPSHOTS.slice(start, end + 1).map((item) => {
    const report = getMonth(item.monthId);
    const resource = item.resources.find((entry) => entry.id === resourceId)!;
    return { tick: `${MONTHS_SHORT[report.month - 1]} ${String(report.year).slice(2)}`, occupancy: resource.occupancy };
  });
  const weekdays = [1, 2, 3, 4, 5, 6].map((weekday) => {
    const cells = current.cells.filter((cell) => cell.weekday === weekday && !cell.closed);
    const capacity = sum(cells.map((cell) => cell.capacityMin));
    const booked = sum(cells.map((cell) => ((cell.occupancy ?? 0) / 100) * cell.capacityMin));
    return {
      weekday,
      label: ["", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][weekday],
      occupancy: capacity > 0 ? (booked / capacity) * 100 : null,
    };
  });
  return { ...current, series, weekdays };
}

export function getHeatmap(resourceId: string, monthId: string) {
  const resource = snapshot(monthId).resources.find((item) => item.id === resourceId);
  if (!resource) throw new Error(`Recurso desconhecido: ${resourceId}`);
  return { cells: resource.cells, reading: resource.reading, name: resource.name };
}

export function listWeeks(monthId: string): WeekOption[] {
  const days = snapshot(monthId).calendar;
  const groups: CalendarDay[][] = [];
  for (const day of days) {
    const last = groups[groups.length - 1];
    if (!last || day.weekday === 1) groups.push([day]);
    else last.push(day);
  }
  const report = getMonth(monthId);
  return groups.map((group) => ({
    start: group[0].iso,
    label: `${group[0].day}–${group[group.length - 1].day} ${MONTHS_SHORT[report.month - 1]}`,
    days: group,
  }));
}

export function defaultWeek(monthId: string) {
  const weeks = listWeeks(monthId);
  return weeks.find((week) => week.days.some((day) => day.day === 13)) ?? weeks[0];
}

export function defaultDay(monthId: string, week: WeekOption) {
  if (monthId === "2026-10") {
    const thirteenth = week.days.find((day) => day.day === 13);
    if (thirteenth) return thirteenth;
  }
  return week.days[0];
}

export function getWeekTimeline(resourceId: string, weekStart: string) {
  const monthId = weekStart.slice(0, 7);
  const week = listWeeks(monthId).find((item) => item.start === weekStart);
  const resource = snapshot(monthId).resources.find((item) => item.id === resourceId);
  if (!week || !resource) throw new Error("Semana ou recurso desconhecido.");
  return week.days.map((day) => ({
    ...day,
    blocks: resource.days.find((item) => item.iso === day.iso)?.segments ?? [],
    empty: resource.id === "bloco" && day.weekday === 3,
  }));
}

export function getDoctorWeek(doctorId: string, weekStart: string) {
  const monthId = weekStart.slice(0, 7);
  const week = listWeeks(monthId).find((item) => item.start === weekStart);
  const doctor = snapshot(monthId).doctors.find((item) => item.id === doctorId);
  if (!week || !doctor) throw new Error("Semana ou médico desconhecido.");
  return week.days.map((day) => ({
    ...day,
    blocks: doctorBlocks(doctor, day),
  }));
}

function doctorBlocks(doctor: DoctorOccupancy, day: CalendarDay): TimelineBlock[] {
  if (!doctor.shiftDays.includes(day.weekday)) return [];
  if (doctor.blockedDays.includes(day.day)) {
    return [{ start: doctor.shiftFrom, end: doctor.shiftTo, state: "bloqueado", label: "Ausência" }];
  }
  const slots: number[] = [];
  for (let start = doctor.shiftFrom; start < doctor.shiftTo; start += 30) slots.push(start);
  const bookedCount = Math.round(slots.length * (doctor.occupancy / 100));
  const faltaCount = Math.min(bookedCount, Math.round(bookedCount * (doctor.noshowRate / 100)));
  const ranked = slots
    .slice()
    .sort((a, b) => unitHash(`${doctor.id}:${day.iso}:${a}`) - unitHash(`${doctor.id}:${day.iso}:${b}`));
  const falta = new Set(ranked.slice(0, faltaCount));
  const marcado = new Set(ranked.slice(faltaCount, bookedCount));
  const segments: TimelineBlock[] = slots.map((start) => {
    if (falta.has(start)) return { start, end: start + 30, state: "falta" as const, label: doctor.specialty };
    if (marcado.has(start)) return { start, end: start + 30, state: "marcado" as const, label: doctor.specialty };
    return { start, end: start + 30, state: "livre" as const, label: "Livre" };
  });
  return mergeSegments(segments);
}

export function getDoctorOccupancy(monthId: string) {
  return snapshot(monthId).doctors;
}

export type AlertItem = {
  id: string;
  hours: number;
  text: string;
  rule: string;
  resourceId?: string;
  doctorId?: string;
};

export function getAlerts(monthId: string, thresholds: Thresholds): AlertItem[] {
  const current = snapshot(monthId);
  const alerts: AlertItem[] = [];
  const belowRule = `Regra: abaixo de ${formatPercentPT(thresholds.equipmentBelow, 0)}`;
  const absenceRule = `Regra: faltas acima de ${formatPercentPT(thresholds.absencesAbove, 0)}`;
  const doctorRule = `Regra: abaixo de ${formatPercentPT(thresholds.doctorsBelow, 0)}`;

  for (const resource of current.resources) {
    const meta = RESOURCES.find((item) => item.id === resource.id)!;
    if (meta.group === "gabinete") continue;
    const below = resource.occupancy < thresholds.equipmentBelow;
    if (resource.id === "bloco" && resource.emptyWednesdays >= 3) {
      alerts.push({
        id: "bloco-quartas",
        hours: resource.wednesdayIdleHours,
        text: `Bloco — sem cirurgias em ${resource.emptyWednesdays} quartas-feiras.`,
        rule: below ? belowRule : "Regra: dias sem cirurgias",
        resourceId: resource.id,
      });
    } else if (below) {
      const hours = formatHoursPT(resource.idleHours);
      let text = `${resource.short} — ${hours} paradas em ${current.monthName} (${formatPercentPT(resource.occupancy, 0)}).`;
      if (resource.id === "tc" && resource.reading.includes("sexta")) {
        text = `TC — ${hours} paradas em ${current.monthName}, sobretudo sextas à tarde e sábados.`;
      }
      if (resource.id === "eco2") {
        text = `Ecógrafo 2 — ${hours} paradas em ${current.monthName}. O equipamento só funciona de tarde.`;
      }
      alerts.push({ id: `${resource.id}-ocupacao`, hours: resource.idleHours, text, rule: belowRule, resourceId: resource.id });
    }
    if (resource.noshowRate > thresholds.absencesAbove && resource.noshowHours > 0) {
      const rate = formatPercentPT(Math.round(resource.noshowRate * 10) / 10, Number.isInteger(Math.round(resource.noshowRate * 10) / 10) ? 0 : 1);
      const text =
        resource.id === "endo"
          ? `Endoscopia — ${rate} de faltas; ${formatHoursPT(resource.noshowHours)} perdidas em exames com preparação.`
          : `${resource.short} — ${rate} de faltas; ${formatHoursPT(resource.noshowHours)} perdidas.`;
      alerts.push({
        id: `${resource.id}-faltas`,
        hours: resource.noshowHours,
        text,
        rule: absenceRule,
        resourceId: resource.id,
      });
    }
  }

  for (const doctor of current.doctors) {
    if (doctor.occupancy >= thresholds.doctorsBelow) continue;
    const text = doctor.blockedLabel
      ? `${doctor.name} — agenda bloqueada de 13 a 24 de ${current.monthName} (${formatPercentPT(doctor.occupancy, 0)}).`
      : `${doctor.name} — agenda a ${formatPercentPT(doctor.occupancy, 0)} em ${current.monthName}.`;
    alerts.push({
      id: `medico-${doctor.id}`,
      hours: doctor.idleHours,
      text,
      rule: doctorRule,
      doctorId: doctor.id,
    });
  }

  return alerts.sort((a, b) => b.hours - a.hours || a.text.localeCompare(b.text, "pt")).slice(0, 6);
}

function rateShown(value: number) {
  return Math.round(value * 10) / 10;
}

function assertCoherence() {
  const problems: string[] = [];
  const fail = (message: string) => problems.push(message);
  for (const item of SNAPSHOTS) {
    const report = getMonth(item.monthId);
    const resource = (id: string) => item.resources.find((entry) => entry.id === id)!;
    const tc = resource("tc");
    const rx = resource("rx");
    const mamo = resource("mamo");
    const eco1 = resource("eco1");
    const eco2 = resource("eco2");
    const endo = resource("endo");
    const bloco = resource("bloco");
    const cardio = resource("cardio");
    if (tc.exams[0]?.value !== examValue(report, "tc")) fail(`${item.monthId} TC ${tc.exams[0]?.value}`);
    if (rx.exams[0]?.value !== examValue(report, "rx")) fail(`${item.monthId} RX`);
    if (mamo.exams[0]?.value !== examValue(report, "mamo")) fail(`${item.monthId} mamo`);
    if ((eco1.exams[0]?.value ?? 0) + (eco2.exams[0]?.value ?? 0) !== examValue(report, "eco")) fail(`${item.monthId} eco`);
    if ((endo.exams[0]?.value ?? 0) !== examValue(report, "endoscopia") || (endo.exams[1]?.value ?? 0) !== examValue(report, "colo")) {
      fail(`${item.monthId} endo`);
    }
    if (bloco.exams[0]?.value !== report.cirurgias) fail(`${item.monthId} bloco`);
    const cardioSum = sum(cardio.exams.map((line) => line.value));
    const expectedCardio =
      examValue(report, "ecg") + examValue(report, "ecocard") + examValue(report, "holter") + examValue(report, "mapa");
    if (cardioSum !== expectedCardio) fail(`${item.monthId} cardio`);
    const equipmentIdle = sum(item.resources.filter((entry) => entry.kind === "equipamento").map((entry) => entry.idleHours));
    if (Math.abs(equipmentIdle - item.equipmentIdleHours) > 0.05) fail(`${item.monthId} soma horas`);
    for (const entry of item.resources) {
      const dayCap = sum(entry.days.map((day) => day.capacityMin));
      const dayBooked = sum(entry.days.map((day) => day.bookedMin));
      const dayPerformed = sum(entry.days.map((day) => day.performedMin));
      if (Math.abs(dayCap / 60 - entry.capacityHours) > 0.05) fail(`${item.monthId} ${entry.id} dias capacidade`);
      if (Math.abs(dayBooked / 60 - entry.bookedHours) > 0.05) fail(`${item.monthId} ${entry.id} dias marcados`);
      if (Math.abs((dayCap - dayPerformed) / 60 - entry.idleHours) > 0.05) fail(`${item.monthId} ${entry.id} dias parados`);
    }
    for (const doctor of report.doctors.filter((entry) => entry.active)) {
      const row = item.doctors.find((entry) => entry.id === doctor.id);
      if (!row || row.occupancy !== doctor.ocupacao) fail(`${item.monthId} ${doctor.id} ocupação`);
    }
    for (const specialty of report.specialties) {
      const doctors = item.doctors.filter((doctor) => doctor.specialtyId === specialty.id);
      const missed = sum(doctors.map((doctor) => Math.round((doctor.noshowRate / 100) * (report.doctors.find((entry) => entry.id === doctor.id)?.consultas ?? 0))));
      if (missed !== specialty.faltasCount) fail(`${item.monthId} faltas ${specialty.id} ${missed}≠${specialty.faltasCount}`);
    }
  }

  const oct = snapshot("2026-10");
  const sep = snapshot("2026-09");
  const aug = snapshot("2026-08");
  const tc = oct.resources.find((resource) => resource.id === "tc")!;
  const weak = tc.cells.filter((cell) => !cell.closed && (cell.weekday === 6 || (cell.weekday === 5 && cell.start >= 14 * 60)));
  const strong = tc.cells.filter((cell) => !cell.closed && cell.weekday <= 4);
  const weakCap = sum(weak.map((cell) => cell.capacityMin));
  const weakBooked = sum(weak.map((cell) => ((cell.occupancy ?? 0) / 100) * cell.capacityMin));
  const strongCap = sum(strong.map((cell) => cell.capacityMin));
  const strongBooked = sum(strong.map((cell) => ((cell.occupancy ?? 0) / 100) * cell.capacityMin));
  const weakOcc = (weakBooked / weakCap) * 100;
  const strongOcc = (strongBooked / strongCap) * 100;
  if (tc.occupancy < 65 || tc.occupancy > 69) fail(`TC out ${tc.occupancy.toFixed(1)}`);
  if (weakOcc < 25 || weakOcc > 40) fail(`TC fraca ${weakOcc.toFixed(1)}`);
  if (strongOcc < 70) fail(`TC forte ${strongOcc.toFixed(1)}`);
  const rx = oct.resources.find((resource) => resource.id === "rx")!;
  const rxSep = sep.resources.find((resource) => resource.id === "rx")!;
  if (rx.occupancy < 84 || rx.occupancy > 88) fail(`RX out ${rx.occupancy.toFixed(1)}`);
  if (rxSep.occupancy < 70 || rxSep.occupancy > 80) fail(`RX set ${rxSep.occupancy.toFixed(1)}`);
  const mornings = rx.cells.filter((cell) => !cell.closed && cell.weekday <= 5 && cell.start < 13 * 60);
  const morningOcc =
    (sum(mornings.map((cell) => ((cell.occupancy ?? 0) / 100) * cell.capacityMin)) / sum(mornings.map((cell) => cell.capacityMin))) * 100;
  if (morningOcc < 90) fail(`RX manhã ${morningOcc.toFixed(1)}`);
  const endo = oct.resources.find((resource) => resource.id === "endo")!;
  const gastro = getMonth("2026-10").specialties.find((specialty) => specialty.id === "gastro")!;
  if (endo.occupancy < 68 || endo.occupancy > 74) fail(`endo ${endo.occupancy.toFixed(1)}`);
  if (rateShown(endo.noshowRate) !== gastro.faltas) fail(`endo faltas ${rateShown(endo.noshowRate)}≠${gastro.faltas}`);
  const bloco = oct.resources.find((resource) => resource.id === "bloco")!;
  if (bloco.occupancy < 58 || bloco.occupancy > 66) fail(`bloco ${bloco.occupancy.toFixed(1)}`);
  if (bloco.emptyWednesdays < 4) fail(`quartas ${bloco.emptyWednesdays}`);
  const eco2 = oct.resources.find((resource) => resource.id === "eco2")!;
  if (eco2.occupancy >= 50) fail(`eco2 ${eco2.occupancy.toFixed(1)}`);
  const tavares = oct.doctors.find((doctor) => doctor.id === "melo")!;
  const noronha = oct.doctors.find((doctor) => doctor.id === "noronha")!;
  const bulcao = oct.doctors.find((doctor) => doctor.id === "bulcao")!;
  if (tavares.occupancy !== 38 || !tavares.blockedDays.includes(13) || tavares.blockedDays.includes(12)) fail("bloqueio Tavares");
  if (noronha.occupancy !== 91 || bulcao.occupancy !== 59) fail("ortopedia ocupação");
  if (aug.resources.find((resource) => resource.id === "tc")!.occupancy >= tc.occupancy) fail("agosto TC");
  const alerts = getAlerts("2026-10", DEFAULT_THRESHOLDS);
  if (alerts.length < 3 || alerts.length > 6) fail(`alertas ${alerts.length}`);
  if (!alerts.some((alert) => alert.resourceId === "tc")) fail("alerta TC");
  if (problems.length > 0) throw new Error(problems.join("\n"));
}

assertCoherence();

export function resourceMatches(kind: ResourceKind, id: string, filter: ViewFilter) {
  if (filter === "todos" || filter === "medicos") return filter === "todos";
  if (filter === "equipamentos") return kind === "equipamento";
  if (filter === "salas") return kind === "sala";
  return id.length > 0;
}

export const HEAT_COLUMNS = slotStarts(1);
export const WEEKDAY_LABELS = ["", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const WEEKDAY_LONG = WEEKDAY_NAME;
