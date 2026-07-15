// Runtime del plan de entrenamiento: convierte el plan del Método FLORA
// (strings tipo "4 × 5-10 c/p") en sesiones ejecutables por la cámara, y
// calcula qué toca hoy según el historial de sesiones (día en rotación,
// semana del bloque, progresión de series, descarga y fin de bloque).
import type { RepPattern, HoldPattern } from "./pose-engine";

/* ─── Tipos del registro guardado en KV ─── */
export interface PlanEjercicio { n: string; series: string }
export interface PlanSesion { dia: string; titulo: string; ejercicios: PlanEjercicio[] }
export interface StoredPlan {
  nivel: string;
  dias: number;
  foco: string;
  focoDetalle: string;
  sesiones: PlanSesion[];
}

export interface SerieLog { reps: number | null; segundos: number | null }
export interface EjercicioLog { n: string; series: SerieLog[]; rir: number | null; skipped: boolean }
export interface SessionLog {
  ts: string;
  week: number;
  diaIdx: number;
  dia: string;
  minima: boolean;
  ejercicios: EjercicioLog[];
}
export interface Progress { sessions: SessionLog[] }

/* ─── Medición por ejercicio ─── */
export type ExerciseMeasure =
  | { kind: "reps"; pattern: RepPattern }
  | { kind: "hold"; pattern: HoldPattern }
  | { kind: "manual" };

// Mapeo nombre de ejercicio → cómo lo mide la cámara. Cuatro patrones cubren
// los ~20 ejercicios del plan; lo que la cámara no puede contar con confianza
// (gemelos: el talón se mueve poco a 2-3 m) va a "manual": lo hacés a tu
// ritmo y decís "listo" — honesto en vez de contar mal.
const MEASURE_RULES: Array<{ re: RegExp; measure: ExerciseMeasure }> = [
  { re: /equilibrio/i, measure: { kind: "hold", pattern: "oneLeg" } },
  { re: /plancha/i, measure: { kind: "hold", pattern: "plank" } },
  { re: /hollow|cuelgue/i, measure: { kind: "hold", pattern: "generic" } },
  { re: /gemelo/i, measure: { kind: "manual" } },
  { re: /flexi|fondo|dominada|remo|pike|diamante|planche/i, measure: { kind: "reps", pattern: "elbowFlex" } },
  { re: /sentadilla|zancada|step/i, measure: { kind: "reps", pattern: "kneeFlex" } },
  { re: /peso muerto|puente|elevaci/i, measure: { kind: "reps", pattern: "hipHinge" } },
];

export function measureFor(nombre: string): ExerciseMeasure {
  for (const rule of MEASURE_RULES) {
    if (rule.re.test(nombre)) return rule.measure;
  }
  return { kind: "manual" };
}

/* ─── Parseo de la prescripción ("4 × 5-10 c/p", "3 × 20-30 s") ─── */
export interface Prescripcion {
  sets: number;
  repMin: number;
  repMax: number;
  isTime: boolean; // objetivo en segundos en vez de repeticiones
  perSide: boolean;
}

export function parseSeries(s: string): Prescripcion {
  const m = s.match(/(\d+)\s*×\s*(\d+)(?:\s*-\s*(\d+))?/);
  const sets = m ? parseInt(m[1], 10) : 3;
  const repMin = m ? parseInt(m[2], 10) : 8;
  const repMax = m && m[3] ? parseInt(m[3], 10) : repMin;
  const isTime = /\ds?\s*s\b|\bs\b|seg/.test(s.replace(/c\/p/i, ""));
  const perSide = /c\/p|por lado|c\/pierna/i.test(s);
  return { sets, repMin, repMax, isTime, perSide };
}

/* ─── Sesión ejecutable de hoy ─── */
export interface TodayExercise {
  nombre: string;
  seriesLabel: string;
  presc: Prescripcion;
  measure: ExerciseMeasure;
  setsHoy: number; // con progresión semanal / descarga aplicada
}

export interface TodaySession {
  week: number; // 1..5
  diaIdx: number;
  dia: string;
  titulo: string;
  isDeload: boolean;
  blockDone: boolean; // terminó el bloque de 5 semanas → invitar a re-evaluar
  sessionNumber: number; // 1-based, global
  ejercicios: TodayExercise[];
}

const WEEKS_PER_BLOCK = 5;

export function buildTodaySession(plan: StoredPlan, progress: Progress | undefined, minima = false): TodaySession {
  const done = progress?.sessions?.length ?? 0;
  const perWeek = Math.max(1, plan.dias);
  const week = Math.min(Math.floor(done / perWeek) + 1, WEEKS_PER_BLOCK + 1);
  const blockDone = week > WEEKS_PER_BLOCK;
  const isDeload = week === WEEKS_PER_BLOCK;
  const diaIdx = done % plan.sesiones.length;
  const sesion = plan.sesiones[diaIdx];

  let ejercicios: TodayExercise[] = sesion.ejercicios.map((e, i) => {
    const presc = parseSeries(e.series);
    // Progresión del Método FLORA: S2-S4 suman +1 serie al primer ejercicio
    // (el compuesto principal), acumulativo con tope +2. S5 descarga: mitad.
    let sets = presc.sets;
    if (!isDeload && i === 0 && week >= 2) sets += Math.min(week - 1, 2);
    if (isDeload) sets = Math.max(1, Math.ceil(presc.sets / 2));
    return {
      nombre: e.n,
      seriesLabel: e.series,
      presc,
      measure: measureFor(e.n),
      setsHoy: sets,
    };
  });

  // Sesión mínima: 15 minutos con los 2 primeros ejercicios (cuenta para la
  // consistencia — regla del método).
  if (minima) ejercicios = ejercicios.slice(0, 2);

  return {
    week: Math.min(week, WEEKS_PER_BLOCK),
    diaIdx,
    dia: sesion.dia,
    titulo: sesion.titulo,
    isDeload,
    blockDone,
    sessionNumber: done + 1,
    ejercicios,
  };
}

// Instrucción hablada por ejercicio (voseo, técnico+coloquial, con el porqué
// cuando aporta). Fallback genérico si el nombre no matchea.
const INSTRUCTION_RULES: Array<{ re: RegExp; text: string }> = [
  { re: /dominada/i, text: "Colgate de la barra y subí hasta pasar el mentón. Bajá controlado, estirando del todo." },
  { re: /remo invertido/i, text: "Debajo de la mesa firme o la barra baja: cuerpo en tabla, llevá el pecho a la barra y bajá controlado." },
  { re: /fondo/i, text: "En las paralelas o entre dos sillas firmes: bajá hasta noventa grados de codo y subí completo." },
  { re: /pseudo-planche/i, text: "Manos a la altura de la cintura, hombros por delante de las muñecas. Flexiones cortas y controladas." },
  { re: /diamante/i, text: "Manos juntas bajo el pecho formando un diamante. Codos pegados al cuerpo al bajar." },
  { re: /pike/i, text: "Cadera bien arriba, cabeza entre los brazos. Bajá la cabeza hacia el piso y empujá." },
  { re: /flexi/i, text: "Cuerpo en tabla, bajá hasta noventa grados de codo y estirá completo arriba." },
  { re: /búlgara/i, text: "Pie trasero apoyado en la silla. Bajá con la pierna de adelante hasta noventa grados. Primero una pierna, después la otra." },
  { re: /sissy/i, text: "Agarrado de un marco: rodillas adelante, torso atrás en línea. Bajá lo que controles." },
  { re: /zancada/i, text: "Paso atrás profundo, rodilla cerca del piso, empujá con el talón de adelante. Alterná piernas." },
  { re: /sentadilla a una pierna|al banco/i, text: "Sentate y levantate de la silla con una sola pierna. Primero una, después la otra." },
  { re: /sentadilla con salto/i, text: "Sentadilla completa y salto suave arriba. Amortiguá al caer." },
  { re: /sentadilla profunda/i, text: "Brazos arriba, bajá lo más profundo que puedas con talones en el piso, pausa de dos segundos, y subí." },
  { re: /sentadilla/i, text: "Pies al ancho de hombros, bajá hasta que la cadera pase la rodilla si podés, y subí completo." },
  { re: /peso muerto/i, text: "Con la mochila en las manos: bisagra de cadera, espalda neutra, bajá el peso por delante de la pierna. Una pierna por vez." },
  { re: /puente de isquios/i, text: "Acostado, talón en la silla: subí la cadera apretando glúteo e isquio. Bajada lenta." },
  { re: /puente/i, text: "Acostado, pies en el piso: subí la cadera hasta alinear rodilla, cadera y hombro. Pausa arriba." },
  { re: /elevaci/i, text: "Colgado o acostado: subí las piernas controladas, sin balanceo, y bajá lento." },
  { re: /step/i, text: "Subí a la silla empujando solo con la pierna de arriba y bajá controlado." },
  { re: /gemelo/i, text: "En un escalón: subí en puntas de pie con pausa arriba y bajada lenta. Hacelas a tu ritmo y decime listo al terminar." },
  { re: /plancha lateral/i, text: "De costado, apoyado en el antebrazo, cuerpo en línea recta. Aguantá." },
  { re: /plancha con toques/i, text: "En plancha alta, tocá el hombro contrario con cada mano, sin rotar la cadera." },
  { re: /plancha/i, text: "Antebrazos y puntas de pie, cuerpo en línea recta de cabeza a talones. Aguantá." },
  { re: /hollow/i, text: "Acostado boca arriba, lumbar pegada al piso, brazos y piernas estirados en el aire. Aguantá." },
  { re: /equilibrio/i, text: "Parate en una pierna, mirada en un punto fijo. Aguantá. Después cambiá de pierna." },
  { re: /cuelgue/i, text: "Colgate de la barra con los brazos estirados y aguantá, hombros activos." },
];

export function instructionFor(nombre: string): string {
  for (const rule of INSTRUCTION_RULES) {
    if (rule.re.test(nombre)) return rule.text;
  }
  return "Hacé el ejercicio con buena técnica, a ritmo controlado.";
}

// Descanso entre series: compuestos grandes descansan más.
export function restSecondsFor(nombre: string): number {
  if (/dominada|fondo|búlgara|peso muerto|sentadilla a una pierna/i.test(nombre)) return 120;
  if (/plancha|equilibrio|hollow|gemelo/i.test(nombre)) return 45;
  return 90;
}

/* ─── Frases habladas atómicas ───
   Cada helper produce EXACTAMENTE una key del catálogo de clips
   (lib/voice-script.json) para que la voz pre-generada haga hit; si el valor
   no está contemplado, el texto igual se lee por síntesis del navegador. */
const NUM_SPOKEN: Record<number, string> = {
  2: "dos", 3: "tres", 4: "cuatro", 5: "cinco", 6: "seis", 8: "ocho", 10: "diez",
  12: "doce", 15: "quince", 20: "veinte", 25: "veinticinco", 30: "treinta",
  40: "cuarenta", 45: "cuarenta y cinco",
};
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function seriesSpoken(sets: number): string {
  return `${cap(NUM_SPOKEN[sets] ?? String(sets))} series.`;
}

export function rangoSpoken(p: Prescripcion): string {
  const unidad = p.isTime ? "segundos" : "repeticiones";
  if (p.repMin === p.repMax) return `${cap(NUM_SPOKEN[p.repMin] ?? String(p.repMin))} ${unidad}.`;
  return `De ${NUM_SPOKEN[p.repMin] ?? p.repMin} a ${NUM_SPOKEN[p.repMax] ?? p.repMax} ${unidad}.`;
}

export function restSpoken(secs: number): string {
  if (secs === 120) return "Buena serie. Descanso de dos minutos.";
  if (secs === 90) return "Buena serie. Descanso de un minuto y medio.";
  if (secs === 45) return "Buena serie. Descanso de cuarenta y cinco segundos.";
  return `Buena serie. Descanso de ${secs} segundos.`;
}

export function ejercicioSpoken(i: number, n: number): string {
  return `Ejercicio ${i} de ${n}.`;
}
