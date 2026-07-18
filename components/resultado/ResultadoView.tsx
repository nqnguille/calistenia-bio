"use client";
import { useEffect, useState } from "react";

const C = {
  chalk: "#EDEDED", void: "#0A0A0A",
  cyan: "#00E5FF", cement: "#8A8A8A",
  red: "#FF5A5A",
};

const DISPLAY = "var(--font-display)";
const MONO = "var(--font-mono-b)";

type TestId = "ols" | "squat" | "sts" | "pushup";

const TEST_META: Record<TestId, { label: string; source: string; fmt: (v: number) => string }> = {
  ols: { label: "Equilibrio", source: "Springer 2007, J Geriatr Phys Ther", fmt: (v) => `${Math.round(v)} s` },
  squat: { label: "Movilidad de piernas", source: "Functional Movement Screen — Cook et al.", fmt: (v) => (v >= 3 ? "Profundidad completa" : v >= 2 ? "Profundidad parcial" : "Profundidad limitada") },
  sts: { label: "Fuerza de piernas (30s)", source: "Rikli & Jones 1999 / CDC STEADI", fmt: (v) => `${Math.round(v)} reps` },
  pushup: { label: "Flexiones", source: "ACSM / Cooper Institute; Yang 2019, JAMA", fmt: (v) => `${Math.round(v)} reps` },
};
const TEST_ORDER: TestId[] = ["ols", "sts", "squat", "pushup"];

interface Ejercicio { n: string; series: string }
interface Sesion { dia: string; titulo: string; ejercicios: Ejercicio[] }
interface StoredRecord {
  ts: string;
  chronoAge: number | null;
  sex: "M" | "F";
  results: Partial<Record<TestId, number>>;
  maResult: { age: number | null; ci: number | null; breakdown: Partial<Record<TestId, number>>; measured: TestId[] } | null;
  plan: { nivel: string; dias: number; foco: string; focoDetalle: string; sesiones: Sesion[] } | null;
}

export function ResultadoView() {
  const [state, setState] = useState<"loading" | "ok" | "notfound" | "noid">("loading");
  const [rec, setRec] = useState<StoredRecord | null>(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) { setState("noid"); return; }
    fetch(`/api/evaluacion?id=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((data: { ok: boolean; item?: StoredRecord }) => {
        if (data.ok && data.item) { setRec(data.item); setState("ok"); }
        else setState("notfound");
      })
      .catch(() => setState("notfound"));
  }, []);

  if (state === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: C.void, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(237,237,237,0.5)", fontFamily: MONO, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Buscando tu resultado…</p>
      </div>
    );
  }

  if (state === "noid" || state === "notfound") {
    return (
      <div style={{ minHeight: "100vh", background: C.void, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: "0 24px", textAlign: "center" }}>
        <p style={{ fontSize: "2.5rem" }}>🔍</p>
        <h1 style={{ color: C.chalk, fontSize: "2rem", fontFamily: DISPLAY, fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.01em", lineHeight: 0.95 }}>No encontramos ese resultado</h1>
        <p style={{ color: "rgba(237,237,237,0.5)", maxWidth: 380 }}>
          {state === "noid" ? "Falta el link completo — usá el que te dimos al terminar la evaluación." : "El link puede estar mal copiado, o el resultado ya no está disponible."}
        </p>
        <a href="/evaluacion/" style={{ background: C.cyan, color: "#000", fontFamily: MONO, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", padding: "14px 32px", borderRadius: 0, border: `1px solid ${C.cyan}`, boxShadow: "5px 5px 0 rgba(255,255,255,0.18)", textDecoration: "none" }}>
          Hacer la evaluación →
        </a>
      </div>
    );
  }

  const { chronoAge, maResult, plan, results } = rec!;
  const age = maResult?.age ?? null;
  const diff = age != null && chronoAge != null ? age - chronoAge : 0;
  const color = age == null ? C.cement : diff < 0 ? C.cyan : Math.abs(diff) <= 1 ? C.cyan : C.red;

  return (
    <div style={{ minHeight: "100vh", background: C.void, padding: "60px 20px 80px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>
        <a href="/" style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "1.2rem", textTransform: "uppercase", letterSpacing: "0.01em", color: C.chalk, textDecoration: "none" }}>
          CALISTENIA<span style={{ color: C.cyan }}>.bio</span>
        </a>

        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: C.cyan, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: MONO }}>[RES_01 // TU_RESULTADO]</p>
          {age != null ? (
            <>
              <p style={{ fontSize: "clamp(5rem,15vw,8rem)", fontFamily: DISPLAY, fontWeight: 400, color: C.chalk, lineHeight: 0.9, letterSpacing: "0.01em", margin: "12px 0 6px" }}>
                {age}<span style={{ fontSize: "0.35em", color: "rgba(237,237,237,0.4)", fontFamily: MONO }}> ± {maResult?.ci}</span>
              </p>
              <p style={{ color, fontWeight: 700, fontSize: "0.85rem", fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {diff < 0 ? `${Math.abs(diff)} años más joven que tu edad real (${chronoAge})` : Math.abs(diff) <= 1 ? "Alineado con tu edad real" : `${diff} años por encima de tu edad real (${chronoAge})`}
              </p>
            </>
          ) : (
            <p style={{ color: "rgba(237,237,237,0.6)", marginTop: 12 }}>No hubo suficientes datos para calcular una edad esta vez.</p>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TEST_ORDER.filter((id) => results[id] != null).map((id) => (
            <div key={id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 0, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ color: C.chalk, fontWeight: 700, fontSize: "0.92rem" }}>{TEST_META[id].label}</p>
                <p style={{ color: "rgba(237,237,237,0.4)", fontSize: "0.68rem", fontFamily: MONO }}>Fuente: {TEST_META[id].source}</p>
              </div>
              <p style={{ color: C.cyan, fontWeight: 800, fontFamily: MONO }}>{TEST_META[id].fmt(results[id] as number)}</p>
            </div>
          ))}
        </div>

        {plan && (
          <>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.14)", paddingTop: 24 }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: C.cyan, letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center", marginBottom: 16, fontFamily: MONO }}>
                [RES_02 // MÉTODO_FLORA · BLOQUE_1]
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
                {[`Nivel ${plan.nivel}`, `${plan.dias} días/semana`, `Foco: ${plan.foco}`].map((t) => (
                  <span key={t} style={{ background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.4)", borderRadius: 0, padding: "7px 14px", color: C.cyan, fontSize: "0.72rem", fontWeight: 700, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.04em" }}>{t}</span>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {plan.sesiones.map((s) => (
                  <div key={s.dia} style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 0, padding: "16px 18px" }}>
                    <p style={{ color: C.chalk, fontFamily: DISPLAY, fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.01em", fontSize: "1.05rem", marginBottom: 8 }}>{s.dia} <span style={{ color: C.cyan, fontFamily: MONO, fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.04em" }}>— {s.titulo}</span></p>
                    {s.ejercicios.map((e) => (
                      <div key={e.n} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: "0.88rem" }}>
                        <span style={{ color: "rgba(237,237,237,0.78)" }}>{e.n}</span>
                        <span style={{ color: C.cyan, fontWeight: 800, fontFamily: MONO, fontVariantNumeric: "tabular-nums" }}>{e.series}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, marginTop: 8 }}>
          <a href={typeof window !== "undefined" ? `/sesion/${window.location.search}` : "/sesion/"}
            style={{ background: C.cyan, color: "#000", fontFamily: MONO, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.95rem", padding: "16px 40px", borderRadius: 0, border: `1px solid ${C.cyan}`, boxShadow: "5px 5px 0 rgba(255,255,255,0.18)", textDecoration: "none" }}>
            Entrenar mi sesión de hoy →
          </a>
          <a href="/evaluacion/" style={{ color: "rgba(237,237,237,0.4)", fontSize: "0.78rem", fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.04em" }}>Volver a hacer la evaluación →</a>
        </div>
      </div>
    </div>
  );
}
