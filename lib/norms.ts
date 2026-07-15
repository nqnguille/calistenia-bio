// Tablas normativas publicadas para los tests de la evaluación. Cada tabla
// mapea edad → desempeño mediano esperado para esa edad (y sexo, si aplica).
// El desempeño SIEMPRE decrece con la edad en estas tres métricas, así que
// "más alto que la mediana de tu edad" implica una edad-equivalente menor.
export type Sex = "M" | "F";

interface NormPoint {
  age: number;
  median: number;
}

// One-Legged Stance (equilibrio unipodal, ojos abiertos), segundos, mejor intento.
// El equilibrio no difiere de forma significativa por sexo.
export const NORM_OLS: NormPoint[] = [
  { age: 25, median: 44.7 },
  { age: 45, median: 41.9 },
  { age: 55, median: 41.2 },
  { age: 65, median: 32.1 },
  { age: 75, median: 21.5 },
  { age: 85, median: 9.4 },
];
export const OLS_SOURCE = "Springer 2007, J Geriatr Phys Ther";

// 30-second Chair Stand Test, repeticiones. Tramo 35-59 interpolado (sin norma
// robusta publicada para esas edades).
export const NORM_STS: Record<Sex, NormPoint[]> = {
  M: [
    { age: 25, median: 33 },
    { age: 45, median: 24 },
    { age: 62, median: 16 },
    { age: 67, median: 15 },
    { age: 72, median: 14 },
    { age: 82, median: 12 },
    { age: 92, median: 9 },
  ],
  F: [
    { age: 25, median: 33 },
    { age: 45, median: 22 },
    { age: 62, median: 14 },
    { age: 67, median: 13 },
    { age: 72, median: 12 },
    { age: 82, median: 11 },
    { age: 92, median: 7 },
  ],
};
export const STS_SOURCE = "Rikli & Jones 1999 / CDC STEADI";

// Flexiones de brazos máximas, técnica estándar. Mediana ≈ centro de la
// categoría "Promedio" de las normas ACSM/Cooper Institute.
export const NORM_PUSHUP: Record<Sex, NormPoint[]> = {
  M: [
    { age: 25, median: 23 },
    { age: 35, median: 18 },
    { age: 45, median: 15 },
    { age: 55, median: 13 },
    { age: 62, median: 11 },
  ],
  F: [
    { age: 25, median: 11 },
    { age: 35, median: 9 },
    { age: 45, median: 7 },
    { age: 55, median: 6 },
    { age: 62, median: 4 },
  ],
};
export const PUSHUP_SOURCE = "ACSM / Cooper Institute; Yang et al. 2019, JAMA Netw Open";

// Sentadilla profunda (FMS Deep Squat): test cualitativo, no de esfuerzo — se
// mantiene una posición unos segundos, no hay fatiga. Sin norma poblacional
// por edad (es ordinal), así que el mapeo a edad-equivalente es un ancla de
// producto declarada, con peso bajo en la fórmula final.
export const MAP_DEEP_SQUAT: Record<1 | 2 | 3, number> = { 3: 30, 2: 45, 1: 60 };
export const SQUAT_SOURCE = "Functional Movement Screen — Cook et al., IJSPT 2014";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// Invierte la curva edad→mediana: ¿a qué edad el desempeño del usuario sería
// la mediana de su grupo? Es la operación central para "edad-equivalente".
export function ageFromNorm(table: NormPoint[], performance: number): number {
  const pts = [...table].sort((a, b) => a.age - b.age);
  const youngest = pts[0];
  const oldest = pts[pts.length - 1];
  if (performance >= youngest.median) return youngest.age;
  if (performance <= oldest.median) return oldest.age;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const hi = Math.max(a.median, b.median);
    const lo = Math.min(a.median, b.median);
    if (performance <= hi && performance >= lo) {
      const t = a.median === b.median ? 0 : (a.median - performance) / (a.median - b.median);
      return clamp(a.age + t * (b.age - a.age), youngest.age, oldest.age);
    }
  }
  return oldest.age;
}
