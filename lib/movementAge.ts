// Edad de Movimiento v2 (KDM-lite): combina el desempeño en varios tests,
// cada uno con norma publicada por edad (y sexo), en una sola edad-equivalente
// ponderada y regularizada hacia la edad real. Reemplaza la heurística
// arbitraria de v10 (72 - score, sin ninguna base).
import { NORM_OLS, NORM_STS, NORM_PUSHUP, ageFromNorm, type Sex } from "./norms";

export type TestId = "ols" | "sts" | "pushup";

export interface TestResults {
  ols?: number; // segundos sostenidos, tope 45
  sts?: number; // repeticiones en 30s
  pushup?: number; // repeticiones máximas
}

export interface MovementAgeResult {
  age: number | null;
  ci: number | null; // ± años de margen honesto
  breakdown: Partial<Record<TestId, number>>; // edad-equivalente por test
  measured: TestId[];
}

// Peso relativo de cada test: cuánto pesa en el promedio ponderado, según
// solidez de la norma publicada y confiabilidad de la medición por cámara.
const TEST_WEIGHTS: Record<TestId, number> = {
  ols: 1.0,
  sts: 1.0,
  pushup: 0.9,
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function movementAgeV2(chronoAge: number, sex: Sex, results: TestResults): MovementAgeResult {
  const equiv: Partial<Record<TestId, number>> = {};
  if (results.ols != null) equiv.ols = clamp(ageFromNorm(NORM_OLS, results.ols), 18, 90);
  if (results.sts != null) equiv.sts = clamp(ageFromNorm(NORM_STS[sex], results.sts), 18, 90);
  if (results.pushup != null) equiv.pushup = clamp(ageFromNorm(NORM_PUSHUP[sex], results.pushup), 18, 90);

  const measured = Object.keys(equiv) as TestId[];
  if (measured.length < 2) {
    return { age: null, ci: null, breakdown: equiv, measured };
  }

  let num = 0;
  let den = 0;
  for (const k of measured) {
    const w = TEST_WEIGHTS[k];
    num += w * (equiv[k] as number);
    den += w;
  }
  const raw = num / den;
  // Regulariza hacia la edad real (α=0.15): evita que un solo test raro
  // desplace demasiado el resultado.
  const age = Math.round(clamp(0.85 * raw + 0.15 * chronoAge, 18, 90));
  const ci = measured.length >= 3 ? 5 : 7;

  return { age, ci, breakdown: equiv, measured };
}
