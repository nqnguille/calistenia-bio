"use client";
import { useEffect, useState } from "react";

const C = {
  cream: "#F8F6F2", ink: "#151716",
  sage: "#7A8F74", muted: "#8E9188",
  dark: "#080B0F", red: "#ef4444",
};

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
      <div style={{ minHeight: "100vh", background: C.dark, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(248,246,242,0.5)" }}>Buscando tu resultado…</p>
      </div>
    );
  }

  if (state === "noid" || state === "notfound") {
    return (
      <div style={{ minHeight: "100vh", background: C.dark, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: "0 24px", textAlign: "center" }}>
        <p style={{ fontSize: "2.5rem" }}>🔍</p>
        <h1 style={{ color: "#F8F6F2", fontSize: "1.6rem", fontWeight: 900 }}>No encontramos ese resultado</h1>
        <p style={{ color: "rgba(248,246,242,0.5)", maxWidth: 380 }}>
          {state === "noid" ? "Falta el link completo — usá el que te dimos al terminar la evaluación." : "El link puede estar mal copiado, o el resultado ya no está disponible."}
        </p>
        <a href="/evaluacion/" style={{ background: C.sage, color: "#fff", fontWeight: 700, padding: "14px 32px", borderRadius: 999, textDecoration: "none" }}>
          Hacer la evaluación →
        </a>
      </div>
    );
  }

  const { chronoAge, maResult, plan, results } = rec!;
  const age = maResult?.age ?? null;
  const diff = age != null && chronoAge != null ? age - chronoAge : 0;
  const color = age == null ? C.muted : diff < 0 ? "#4ade80" : Math.abs(diff) <= 1 ? C.sage : C.red;

  return (
    <div style={{ minHeight: "100vh", background: C.dark, padding: "60px 20px 80px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>
        <a href="/" style={{ fontWeight: 900, fontSize: "1.1rem", letterSpacing: "-0.03em", color: "#F8F6F2", textDecoration: "none" }}>
          CALISTENIA<span style={{ color: C.sage }}>.bio</span>
        </a>

        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: C.sage, letterSpacing: "0.2em", textTransform: "uppercase" }}>Tu resultado</p>
          {age != null ? (
            <>
              <p style={{ fontSize: "clamp(4rem,12vw,6rem)", fontWeight: 900, color: "#F8F6F2", lineHeight: 0.9, letterSpacing: "-0.05em", margin: "12px 0 6px" }}>
                {age}<span style={{ fontSize: "0.35em", color: "rgba(248,246,242,0.4)" }}> ± {maResult?.ci}</span>
              </p>
              <p style={{ color, fontWeight: 700, fontSize: "0.9rem" }}>
                {diff < 0 ? `${Math.abs(diff)} años más joven que tu edad real (${chronoAge})` : Math.abs(diff) <= 1 ? "Alineado con tu edad real" : `${diff} años por encima de tu edad real (${chronoAge})`}
              </p>
            </>
          ) : (
            <p style={{ color: "rgba(248,246,242,0.6)", marginTop: 12 }}>No hubo suficientes datos para calcular una edad esta vez.</p>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TEST_ORDER.filter((id) => results[id] != null).map((id) => (
            <div key={id} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ color: "#F8F6F2", fontWeight: 700, fontSize: "0.92rem" }}>{TEST_META[id].label}</p>
                <p style={{ color: "rgba(248,246,242,0.4)", fontSize: "0.72rem" }}>Fuente: {TEST_META[id].source}</p>
              </div>
              <p style={{ color: "#AFC3A5", fontWeight: 800 }}>{TEST_META[id].fmt(results[id] as number)}</p>
            </div>
          ))}
        </div>

        {plan && (
          <>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24 }}>
              <p style={{ fontSize: "0.7rem", fontWeight: 800, color: C.sage, letterSpacing: "0.18em", textTransform: "uppercase", textAlign: "center", marginBottom: 16 }}>
                Método FLORA · Bloque 1
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
                {[`Nivel ${plan.nivel}`, `${plan.dias} días/semana`, `Foco: ${plan.foco}`].map((t) => (
                  <span key={t} style={{ background: "rgba(122,143,116,0.16)", border: "1px solid rgba(122,143,116,0.35)", borderRadius: 999, padding: "7px 14px", color: "#AFC3A5", fontSize: "0.78rem", fontWeight: 700 }}>{t}</span>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {plan.sesiones.map((s) => (
                  <div key={s.dia} style={{ background: "rgba(8,11,15,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "16px 18px" }}>
                    <p style={{ color: "#F8F6F2", fontWeight: 900, marginBottom: 8 }}>{s.dia} <span style={{ color: C.sage, fontWeight: 700, fontSize: "0.88rem" }}>— {s.titulo}</span></p>
                    {s.ejercicios.map((e) => (
                      <div key={e.n} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: "0.88rem" }}>
                        <span style={{ color: "rgba(248,246,242,0.78)" }}>{e.n}</span>
                        <span style={{ color: "#AFC3A5", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{e.series}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div style={{ textAlign: "center", marginTop: 8 }}>
          <a href="/evaluacion/" style={{ color: "rgba(248,246,242,0.4)", fontSize: "0.85rem" }}>Volver a hacer la evaluación →</a>
        </div>
      </div>
    </div>
  );
}
