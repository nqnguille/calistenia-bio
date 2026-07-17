"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { movementAgeV2, type TestId, type TestResults, type MovementAgeResult } from "@/lib/movementAge";
import { OLS_SOURCE, STS_SOURCE, PUSHUP_SOURCE, SQUAT_SOURCE, type Sex } from "@/lib/norms";
import { IS_DEV, logEvent } from "@/lib/evlog";
import { speak, speakSeq, stopSpeaking, warmVoices, loadVoiceManifest } from "@/lib/voice";
import {
  type PoseRuntime, type PoseHandler,
  bodyPresent, shoulderMidpoint, clamp, startPoseTracking,
  stepOLS, stepSTS, stepPushup, stepSquat, squatScore,
  OLS_INIT, REP_INIT, SQUAT_INIT,
  type OlsState, type RepState, type SquatState,
} from "@/lib/pose-engine";
import { useVoiceCommands, useCountdown } from "@/components/shared/hooks";
import { EventMonitor } from "@/components/shared/EventMonitor";
import { GoogleLogin } from "@/components/shared/GoogleLogin";
import type { AuthUser } from "@/lib/authConfig";

const C = {
  cream: "#F8F6F2", ink: "#151716", ink2: "#343A36",
  sage: "#7A8F74", muted: "#8E9188", border: "#DED9CE",
  dark: "#080B0F", dark2: "#111821", red: "#ef4444",
};

const EVAL_BUILD = "v14 · sesión guiada";

/* ─── Types ─────────────────────────────── */
type Step = "hook" | "intake" | "camera" | "movement" | "calculating" | "reveal" | "plan" | "save";

type TestMode = "maxHold" | "timedReps" | "amrap" | "holdCheck";

interface MovementTest {
  id: TestId;
  title: string;
  instruction: string;
  emoji: string;
  mode: TestMode;
  duration: number; // segundos: tope (maxHold/amrap) o duración fija (timedReps)
  hint: string;
  metricLabel: string;
}

// Orden pensado para alternar esfuerzo y descanso: equilibrio (liviano) →
// piernas (exigente) → movilidad (liviano, sin fatiga, pausa activa) →
// flexiones (exigente, cierra el bloque — y se puede terminar antes diciendo
// "listo", no hace falta llegar al fallo).
const MOVEMENTS: MovementTest[] = [
  {
    id: "ols", title: "Equilibrio a una pierna", emoji: "🦩", mode: "maxHold", duration: 45,
    instruction: "Levantá un pie del piso y sostenete parado en la otra pierna, sin apoyarte en nada.",
    hint: "Predictor validado de salud a largo plazo (Araujo 2022, BJSM)",
    metricLabel: "segundos sostenidos",
  },
  {
    id: "sts", title: "Fuerza de piernas — 30 segundos", emoji: "🪑", mode: "timedReps", duration: 30,
    instruction: "Sentate en el borde de una silla firme, brazos cruzados sobre el pecho. Parate del todo y sentate, tantas veces como puedas.",
    hint: "Test estándar de fuerza funcional (Rikli & Jones)",
    metricLabel: "repeticiones",
  },
  {
    id: "squat", title: "Movilidad de piernas", emoji: "🧘", mode: "holdCheck", duration: 8,
    instruction: "Con los brazos estirados arriba de la cabeza, agachate lo más profundo que puedas y sostenete dos segundos.",
    hint: "Test de movilidad, sin esfuerzo — una sola vez, no hay que repetir (Cook et al., FMS)",
    metricLabel: "profundidad",
  },
  {
    id: "pushup", title: "Flexiones de brazos", emoji: "💪", mode: "amrap", duration: 45,
    instruction: "Hacé flexiones completas, bajando hasta noventa grados de codo. Las que puedas con buena técnica — no hace falta llegar al fallo, parás cuando quieras diciendo listo.",
    hint: "Predictor de salud cardiovascular (Yang 2019, JAMA)",
    metricLabel: "repeticiones",
  },
];

const MOVEMENT_CUES: Record<TestId, string> = {
  ols: "Fijá la mirada en un punto quieto, eso ayuda a sostener el equilibrio.",
  sts: "Sin usar las manos. Parate del todo cada vez.",
  squat: "Bajá un poco más si podés, con los brazos bien arriba.",
  pushup: "Bajá completo. Si ya te cuesta, decime listo y lo dejamos ahí.",
};

const TEST_META: Record<TestId, { label: string; source: string; fmt: (v: number) => string }> = {
  ols: { label: "Equilibrio", source: OLS_SOURCE, fmt: (v) => `${Math.round(v)} s` },
  sts: { label: "Fuerza de piernas", source: STS_SOURCE, fmt: (v) => `${Math.round(v)} reps` },
  squat: { label: "Movilidad de piernas", source: SQUAT_SOURCE, fmt: (v) => (v >= 3 ? "Profundidad completa" : v >= 2 ? "Profundidad parcial" : "Profundidad limitada") },
  pushup: { label: "Flexiones", source: PUSHUP_SOURCE, fmt: (v) => `${Math.round(v)} reps` },
};

/* ─── Plan FLORA: del resultado al primer bloque ── */
type Ejercicio = { n: string; series: string };
type Sesion = { dia: string; titulo: string; ejercicios: Ejercicio[] };
type PlanFlora = {
  nivel: string;
  dias: number;
  foco: string;
  focoDetalle: string;
  sesiones: Sesion[];
  vozPartes: string[];
};

const FOCUS_META: Record<TestId, { label: string; detalle: string; extra: Ejercicio }> = {
  ols: { label: "equilibrio y control", detalle: "Tu equilibrio fue el punto más flojo: el bloque suma trabajo a una pierna en cada sesión.", extra: { n: "Equilibrio a una pierna (ojos al frente)", series: "2 × 30-45 s c/p" } },
  sts: { label: "fuerza de piernas", detalle: "Tu fuerza de piernas fue el punto más flojo: el bloque prioriza sentadillas y trabajo unilateral.", extra: { n: "Sentadilla búlgara (mochila opcional)", series: "3 × 8-12 c/p" } },
  pushup: { label: "fuerza de tren superior", detalle: "Tus flexiones fueron el punto más flojo: el bloque suma volumen de empuje en cada sesión.", extra: { n: "Flexiones con pausa abajo", series: "3 × 6-10" } },
  squat: { label: "movilidad de piernas", detalle: "Tu movilidad de sentadilla fue el punto más flojo: el bloque suma trabajo de rango completo en cada sesión.", extra: { n: "Sentadilla profunda con pausa (movilidad)", series: "3 × 8-10" } },
};

function buildPlanFlora(breakdown: Partial<Record<TestId, number>>, movementAge: number | null, chronoAge: number): PlanFlora {
  const measured = Object.keys(breakdown) as TestId[];
  const focoId = measured.length
    ? measured.reduce((worst, id) => ((breakdown[id] ?? 0) > (breakdown[worst] ?? 0) ? id : worst), measured[0])
    : "sts";
  const foco = FOCUS_META[focoId];

  const nivel = movementAge == null ? "Base" : movementAge <= chronoAge - 5 ? "Sólido" : movementAge <= chronoAge + 8 ? "Base" : "Inicial";
  const dias = nivel === "Sólido" ? 4 : 3;

  const base: Sesion[] =
    nivel === "Inicial"
      ? [
          { dia: "Día A", titulo: "Empuje + tracción", ejercicios: [
            { n: "Flexiones (inclinadas si hace falta)", series: "3 × 6-10" },
            { n: "Remo invertido bajo mesa firme", series: "3 × 6-10" },
            { n: "Sentadilla a una silla", series: "3 × 8-12" },
            { n: "Plancha", series: "3 × 20-30 s" },
          ]},
          { dia: "Día B", titulo: "Piernas + equilibrio", ejercicios: [
            { n: "Zancada atrás", series: "3 × 8 c/p" },
            { n: "Puente de glúteos", series: "3 × 12-15" },
            { n: "Equilibrio a una pierna", series: "3 × 30 s c/p" },
            { n: "Gemelos en escalón", series: "3 × 15-20" },
          ]},
          { dia: "Día C", titulo: "Cuerpo completo", ejercicios: [
            { n: "Flexiones", series: "3 × 6-10" },
            { n: "Remo invertido", series: "3 × 6-10" },
            { n: "Sentadilla a una silla", series: "3 × 10-12" },
            { n: "Plancha lateral", series: "2 × 20 s por lado" },
          ]},
        ]
      : nivel === "Base"
      ? [
          { dia: "Día A", titulo: "Empuje + tracción", ejercicios: [
            { n: "Flexiones", series: "4 × 6-10" },
            { n: "Remo invertido (o dominadas si tenés barra)", series: "4 × 6-12" },
            { n: "Pike push-up", series: "3 × 6-10" },
            { n: "Plancha", series: "3 × 30-45 s" },
          ]},
          { dia: "Día B", titulo: "Piernas", ejercicios: [
            { n: "Sentadilla búlgara (mochila opcional)", series: "4 × 8-12 c/p" },
            { n: "Puente de isquios a una pierna", series: "3 × 10-15 c/p" },
            { n: "Zancada atrás", series: "3 × 10 c/p" },
            { n: "Gemelos a una pierna", series: "3 × 15-25" },
          ]},
          { dia: "Día C", titulo: "Cuerpo completo", ejercicios: [
            { n: "Dominadas o remo invertido", series: "4 × 6-10" },
            { n: "Flexiones con pausa abajo", series: "3 × 8-12" },
            { n: "Sentadilla con salto suave", series: "3 × 8-10" },
            { n: "Hollow hold", series: "3 × 20-40 s" },
          ]},
        ]
      : [
          { dia: "Día A", titulo: "Superior — tracción", ejercicios: [
            { n: "Dominadas", series: "4 × 5-10" },
            { n: "Fondos en paralelas o sillas", series: "3 × 8-12" },
            { n: "Remo invertido", series: "3 × 10-15" },
            { n: "Elevación de piernas colgado", series: "3 × 8-12" },
          ]},
          { dia: "Día B", titulo: "Inferior — cuádriceps", ejercicios: [
            { n: "Sentadilla búlgara con mochila", series: "4 × 8-12 c/p" },
            { n: "Sentadilla sissy asistida", series: "3 × 8-12" },
            { n: "Zancada inversa", series: "3 × 10 c/p" },
            { n: "Gemelos a una pierna", series: "3 × 15-25" },
          ]},
          { dia: "Día C", titulo: "Superior — empuje", ejercicios: [
            { n: "Fondos (lastre si superás 12)", series: "4 × 6-10" },
            { n: "Dominadas agarre ancho", series: "3 × 5-8" },
            { n: "Flexión pseudo-planche", series: "3 × 8-12" },
            { n: "Flexión diamante", series: "2 × 8-12" },
          ]},
          { dia: "Día D", titulo: "Inferior — cadena posterior", ejercicios: [
            { n: "Peso muerto rumano a 1 pierna (mochila)", series: "4 × 8-12 c/p" },
            { n: "Sentadilla a una pierna al banco", series: "3 × 5-8 c/p" },
            { n: "Puente de glúteos con pausa", series: "3 × 12-15" },
            { n: "Plancha con toques de hombro", series: "2 × 30-45 s" },
          ]},
        ];

  const sesiones = base.map((s) => ({ ...s, ejercicios: [...s.ejercicios, foco.extra] }));

  // Secuencia de átomos con clip pre-generado (una sola voz, sin cortes a síntesis).
  const vozPartes = [
    "Tu plan está listo. Un bloque de cinco semanas.",
    dias === 3 ? "Tres días por semana." : "Cuatro días por semana.",
    `Con foco en ${foco.label}.`,
    "Cuatro semanas subiendo de a poco y una de descarga. En cada serie guardate una o dos repeticiones. Y si un día estás corto de tiempo, hacé la sesión mínima: quince minutos y tu consistencia sigue arriba.",
  ];

  return { nivel, dias, foco: foco.label, focoDetalle: foco.detalle, sesiones, vozPartes };
}

/* ─── Progress dots ───────────────────── */
function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 20 : 6, height: 6, borderRadius: 3,
          background: i <= current ? C.sage : "rgba(255,255,255,0.2)",
          transition: "all 0.3s",
        }} />
      ))}
    </div>
  );
}

/* ─── STEP: HOOK ──────────────────────── */
function StepHook({ onNext }: { onNext: () => void }) {
  return (
    <motion.div key="hook" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}
      style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px", gap: 32 }}>

      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        style={{ display:"inline-flex", alignItems:"center", gap:10, fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:C.sage }}>
        <span style={{ width:20, height:1, background:C.sage }} />CALISTENIA.bio<span style={{ width:20, height:1, background:C.sage }} />
      </motion.div>

      <motion.h1 initial={{ opacity:0, y:32 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2, ease:[0.16,1,0.3,1] }}
        style={{ fontSize:"clamp(2.2rem,5vw,3.8rem)", fontWeight:900, color:"#F8F6F2", lineHeight:0.95, letterSpacing:"-0.03em", maxWidth:600 }}>
        ¿Cuántos años tiene<br/>
        <span style={{ background:"linear-gradient(135deg,#7A8F74,#AFC3A5)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
          realmente tu cuerpo?
        </span>
      </motion.h1>

      <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
        style={{ fontSize:"1.1rem", color:"rgba(248,246,242,0.6)", lineHeight:1.7, fontWeight:300, maxWidth:460 }}>
        3 pruebas de equilibrio y fuerza, comparadas con normas científicas publicadas por edad y sexo. ~6 minutos, con tu cámara.
      </motion.p>

      <motion.button initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
        onClick={onNext}
        whileHover={{ scale:1.04, boxShadow:"0 20px 50px rgba(122,143,116,0.4)" }}
        whileTap={{ scale:0.97 }}
        style={{ background:C.sage, color:"#fff", fontWeight:700, fontSize:"1.1rem", padding:"18px 44px", borderRadius:999, border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:12 }}>
        Descubrirlo — es gratis
        <span style={{ fontSize:"1.2rem" }}>→</span>
      </motion.button>

      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.7 }}
        style={{ display:"flex", gap:24, flexWrap:"wrap", justifyContent:"center" }}>
        {["Demo pública gratuita","Sin registro previo","Solo tu cámara","Con fuentes citadas"].map(t => (
          <span key={t} style={{ display:"flex", alignItems:"center", gap:6, fontSize:"0.8rem", color:"rgba(248,246,242,0.4)", fontWeight:500 }}>
            <span style={{ color:C.sage }}>✓</span>{t}
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
}

/* ─── STEP: INTAKE (edad exacta + sexo, antes de la cámara) ── */
function StepIntake({ onDone }: { onDone: (age: number, sex: Sex) => void }) {
  const [sub, setSub] = useState<"age" | "sex">("age");
  const [age, setAge] = useState("");

  useEffect(() => {
    if (sub === "age") {
      speak("Antes de arrancar, dos preguntas rápidas para comparar tu desempeño con las normas correctas. ¿Cuántos años tenés?", { key: "intake-age", minGap: 0 });
    } else {
      speak("¿Cuál es tu sexo? Las normas de fuerza son distintas por sexo, así que ajusto la comparación a eso.", { key: "intake-sex", minGap: 0 });
    }
  }, [sub]);

  const ageNum = parseInt(age, 10);
  const ageValid = Number.isFinite(ageNum) && ageNum >= 14 && ageNum <= 95;

  const confirmAge = () => { if (ageValid) setSub("sex"); };

  return (
    <motion.div key="intake" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px", gap: 28 }}>
      <p style={{ fontSize: "0.7rem", fontWeight: 800, color: C.sage, letterSpacing: "0.2em", textTransform: "uppercase" }}>
        {sub === "age" ? "Paso 1 de 2" : "Paso 2 de 2"}
      </p>

      {sub === "age" ? (
        <>
          <h2 style={{ fontSize: "clamp(1.9rem,4.4vw,2.8rem)", fontWeight: 900, color: "#F8F6F2", letterSpacing: "-0.03em", maxWidth: 560 }}>
            ¿Cuántos años tenés?
          </h2>
          <p style={{ color: "rgba(248,246,242,0.55)", fontSize: "0.95rem", maxWidth: 460, fontWeight: 300 }}>
            Tu edad exacta — la uso para comparar tu desempeño con las normas publicadas.
          </p>
          <form onSubmit={(e) => { e.preventDefault(); confirmAge(); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, width: "100%", maxWidth: 260 }}>
            <input
              type="number" inputMode="numeric" min={14} max={95} placeholder="Ej: 34"
              value={age} onChange={(e) => setAge(e.target.value)} autoFocus
              style={{ width: "100%", textAlign: "center", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 16, padding: "20px 12px", color: "#F8F6F2", fontWeight: 900, fontSize: "2.4rem", outline: "none" }}
            />
            <motion.button type="submit" disabled={!ageValid} whileHover={ageValid ? { scale: 1.04 } : undefined} whileTap={ageValid ? { scale: 0.96 } : undefined}
              style={{ width: "100%", background: ageValid ? C.sage : "rgba(255,255,255,0.1)", color: ageValid ? "#fff" : "rgba(248,246,242,0.35)", fontWeight: 800, fontSize: "1rem", padding: "16px", borderRadius: 999, border: "none", cursor: ageValid ? "pointer" : "not-allowed" }}>
              Confirmar →
            </motion.button>
          </form>
        </>
      ) : (
        <>
          <h2 style={{ fontSize: "clamp(1.9rem,4.4vw,2.8rem)", fontWeight: 900, color: "#F8F6F2", letterSpacing: "-0.03em", maxWidth: 560 }}>
            ¿Cuál es tu sexo?
          </h2>
          <p style={{ color: "rgba(248,246,242,0.55)", fontSize: "0.95rem", maxWidth: 460, fontWeight: 300 }}>
            Las normas de fuerza (piernas y flexiones) son distintas por sexo. El equilibrio no cambia.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            {([["F", "Mujer"], ["M", "Hombre"]] as const).map(([val, label]) => (
              <motion.button key={val} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => onDone(ageNum, val)}
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 20, padding: "28px 40px", color: "#F8F6F2", fontWeight: 800, fontSize: "1.15rem", cursor: "pointer", minWidth: 160 }}>
                {label}
              </motion.button>
            ))}
          </div>
          <button onClick={() => setSub("age")} style={{ background: "transparent", border: "none", color: "rgba(248,246,242,0.35)", fontSize: "0.85rem", cursor: "pointer" }}>
            ← Volver a editar la edad ({ageNum})
          </button>
        </>
      )}
    </motion.div>
  );
}

/* ─── STEP: CAMERA (overlay sobre el feed único) ── */
function StepCamera({ cameraState, camStatus, startCamera, setPoseHandler, onNext }: {
  cameraState: "idle" | "starting" | "on" | "error";
  camStatus: string;
  startCamera: () => void;
  setPoseHandler: (fn: PoseHandler | null) => void;
  onNext: () => void;
}) {
  const detectedFrames = useRef(0);
  const presentFrames = useRef(0);
  const advancedRef = useRef(false);
  const prevMidRef = useRef<{ x: number; y: number } | null>(null);
  const startedAtRef = useRef(0);
  const [detected, setDetected] = useState(false);
  const [partial, setPartial] = useState(false);
  const [quality, setQuality] = useState(0);

  const forceAdvance = useCallback((phrase: string) => {
    if (advancedRef.current) return;
    advancedRef.current = true;
    logEvent("fase", "cámara → pruebas");
    speak(phrase, { key: "cam-advance", minGap: 0 }).then(() => onNext());
  }, [onNext]);

  useVoiceCommands(cameraState === "on", () => forceAdvance("Dale, seguimos."));

  useEffect(() => {
    if (cameraState !== "on") return;
    startedAtRef.current = Date.now();
    setPoseHandler((landmarks, poseConfidence) => {
      const ok = bodyPresent(landmarks);
      setDetected(ok);
      setPartial(!!landmarks && !ok);
      setQuality(poseConfidence);
      if (landmarks) presentFrames.current += 1;

      // Quietud: si vos o la cámara se están moviendo (acomodando la laptop,
      // buscando el ángulo), los landmarks se mueven y NO arrancamos.
      let motion = 1;
      if (ok && landmarks) {
        const mid = shoulderMidpoint(landmarks);
        const prev = prevMidRef.current;
        motion = prev ? Math.hypot(mid.x - prev.x, mid.y - prev.y) : 1;
        prevMidRef.current = mid;
      } else {
        prevMidRef.current = null;
      }

      if (ok && motion < 0.012) detectedFrames.current += 1;
      else if (!ok || motion > 0.025) detectedFrames.current = 0;

      if (detectedFrames.current === 1) logEvent("pose", `cuerpo detectado (vis ${poseConfidence}%)`);

      if (ok && motion > 0.025) {
        speak("Terminá de acomodar la cámara y quedate quieto un momento.", { key: "cam-moving", minGap: 9000 });
      }
      if (!ok && landmarks) {
        speak("Casi. Necesito ver tus hombros y tu cadera. Si no avanzo, decime: listo.", { key: "cam-partial", minGap: 10000 });
      }
      if (!landmarks && presentFrames.current === 0) {
        speak("No logro verte. Prendé una luz de frente y ponete a dos o tres metros.", { key: "cam-nobody", minGap: 12000 });
      }

      // Tiempo mínimo de encuadre: nunca antes de 4s de cámara activa,
      // y solo tras ~2s de cuerpo detectado Y quieto.
      const elapsed = Date.now() - startedAtRef.current;
      if (elapsed > 4000 && detectedFrames.current > 50) {
        forceAdvance("¡Te veo! Arrancamos con la primera prueba.");
      }
      // Red de seguridad anti-trabas (~12s de esqueleto presente).
      if (elapsed > 6000 && presentFrames.current > 300) {
        forceAdvance("La luz no ayuda, pero te veo lo suficiente. Seguimos.");
      }
    });
    return () => setPoseHandler(null);
  }, [cameraState, setPoseHandler, forceAdvance]);

  if (cameraState === "idle" || cameraState === "starting" || cameraState === "error") {
    return (
      <motion.div key="camera-gate" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 20px" }}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", gap:26, maxWidth:560 }}>
          {cameraState === "starting" ? (
            <>
              <motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:"linear" }}
                style={{ width:46, height:46, border:"3px solid rgba(122,143,116,0.22)", borderTopColor:C.sage, borderRadius:"50%" }} />
              <p style={{ color:"rgba(248,246,242,0.72)", fontWeight:700, fontSize:"1.1rem" }}>{camStatus}</p>
            </>
          ) : (
            <>
              <div style={{ width:78, height:78, borderRadius:"50%", background:"rgba(122,143,116,0.15)", border:`2px solid rgba(122,143,116,0.4)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem" }}>
                {cameraState === "error" ? "🚫" : "📷"}
              </div>
              <h2 style={{ fontSize:"clamp(1.9rem,4vw,3rem)", fontWeight:900, color:"#F8F6F2", lineHeight:0.95, letterSpacing:"-0.04em" }}>
                {cameraState === "error" ? "No pudimos iniciar la cámara" : "Activá tu cámara"}
              </h2>
              <p style={{ fontSize:"1rem", color:"rgba(248,246,242,0.58)", lineHeight:1.75, fontWeight:300 }}>
                {cameraState === "error"
                  ? `${camStatus}. Revisá permisos del navegador y conexión a internet para cargar el modelo.`
                  : "La cámara se prende UNA sola vez y te acompaña todo el journey. Te guío por voz: no vas a tener que tocar nada más."}
              </p>
              <button onClick={startCamera}
                style={{ background:C.sage, color:"#fff", fontWeight:800, fontSize:"1rem", padding:"16px 40px", borderRadius:999, border:"none", cursor:"pointer" }}>
                {cameraState === "error" ? "Intentar de nuevo" : "Activar cámara →"}
              </button>
              <p style={{ fontSize:"0.75rem", color:"rgba(248,246,242,0.25)" }}>Nada se graba ni se sube. El análisis ocurre en el navegador.</p>
            </>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div key="camera-live" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:"absolute", inset:0, pointerEvents:"none" }}>

      <div style={{ position:"absolute", top:"calc(env(safe-area-inset-top) + 66px)", left:16, right:16, display:"flex", flexWrap:"wrap", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
        <div style={{ maxWidth:"min(560px, 58vw)", background:"rgba(8,11,15,0.56)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:999, padding:"10px 16px", display:"flex", alignItems:"center", gap:10, backdropFilter:"blur(16px)" }}>
          <motion.div animate={{ opacity:[0.35,1,0.35] }} transition={{ duration:1.25, repeat:Infinity }}
            style={{ width:9, height:9, borderRadius:"50%", background:detected?"#AFC3A5":"#F0C36A", flexShrink:0 }} />
          <span style={{ color:"rgba(248,246,242,0.86)", fontWeight:900, fontSize:"0.78rem", letterSpacing:"0.12em", textTransform:"uppercase", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {detected ? "Cuerpo detectado" : camStatus}
          </span>
        </div>

        <div style={{ minWidth:150, background:"rgba(8,11,15,0.58)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:22, padding:"16px 18px", backdropFilter:"blur(16px)" }}>
          <p style={{ fontSize:"0.62rem", color:"rgba(248,246,242,0.40)", fontWeight:900, letterSpacing:"0.16em", textTransform:"uppercase", marginBottom:8 }}>Calidad pose</p>
          <div style={{ display:"flex", alignItems:"end", gap:6 }}>
            <span style={{ color:"#F8F6F2", fontSize:"2.35rem", fontWeight:900, lineHeight:1 }}>{Math.round(quality)}</span>
            <span style={{ color:"rgba(248,246,242,0.38)", fontSize:"0.85rem", fontWeight:800, marginBottom:4 }}>%</span>
          </div>
        </div>
      </div>

      {!detected && (
        <div style={{ position:"absolute", left:16, right:16, bottom:"calc(env(safe-area-inset-bottom) + 48px)", display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
          <div style={{ maxWidth:900, background:"rgba(8,11,15,0.68)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:28, padding:"22px 34px", color:"#F8F6F2", fontSize:"clamp(1.3rem,3vw,2.1rem)", fontWeight:700, lineHeight:1.35, letterSpacing:"-0.01em", textAlign:"center", backdropFilter:"blur(16px)" }}>
            {partial
              ? "Casi: que entren hombros y cadera en el cuadro"
              : "Ponete a 2-3 metros, de frente y con luz"}
          </div>
          <div style={{ color:"rgba(248,246,242,0.65)", fontSize:"clamp(1rem,2.2vw,1.4rem)", fontWeight:600, textShadow:"0 4px 20px rgba(0,0,0,0.6)" }}>
            🎤 Si no avanzo solo, decí «listo»
          </div>
        </div>
      )}

      {detected && (
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <motion.div initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
            style={{ textAlign:"center", textShadow:"0 8px 40px rgba(0,0,0,0.6)" }}>
            <p style={{ fontSize:"clamp(3.5rem,9vw,6.5rem)", lineHeight:1 }}>✓</p>
            <p style={{ color:"#F8F6F2", fontSize:"clamp(1.8rem,4.5vw,3.2rem)", fontWeight:900, letterSpacing:"-0.02em" }}>¡Te veo!</p>
            <p style={{ color:"rgba(248,246,242,0.75)", fontSize:"clamp(1.1rem,2.4vw,1.6rem)", fontWeight:700, marginTop:8 }}>Quedate quieto un momento…</p>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

/* ─── STEP: MOVEMENT (overlay sobre el feed único) ── */
type MovPhase = "intro" | "prep" | "counting" | "done";

function StepMovement({ setPoseHandler, onComplete }: {
  setPoseHandler: (fn: PoseHandler | null) => void;
  onComplete: (results: TestResults) => void;
}) {
  const phaseRef = useRef<MovPhase>("intro");
  const currentIdRef = useRef<TestId>("ols");
  const stableRef = useRef(0);
  const introAtRef = useRef(0);
  const attemptRef = useRef(0);
  const framesWithBodyRef = useRef(0);
  const prevMidRef = useRef<{ x: number; y: number } | null>(null);
  const introReadyRef = useRef(false);
  const olsRef = useRef<OlsState>(OLS_INIT);
  const repRef = useRef<RepState>(REP_INIT);
  const squatRef = useRef<SquatState>(SQUAT_INIT);
  const cueFiredRef = useRef(false);
  const resultsRef = useRef<TestResults>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState<MovPhase>("intro");
  const [prepLeft, setPrepLeft] = useState(3);
  const [detected, setDetected] = useState(false);
  const [liveMetric, setLiveMetric] = useState(0);
  const [feedback, setFeedback] = useState("Posicionate frente a la cámara");

  const current = MOVEMENTS[Math.min(currentIdx, MOVEMENTS.length - 1)];

  useEffect(() => { phaseRef.current = phase; logEvent("fase", `prueba ${currentIdx + 1} (${current.id}) · ${phase}`); }, [phase, currentIdx, current.id]);

  const resetAttempt = useCallback(() => {
    olsRef.current = OLS_INIT;
    repRef.current = REP_INIT;
    squatRef.current = SQUAT_INIT;
    stableRef.current = 0;
    framesWithBodyRef.current = 0;
    cueFiredRef.current = false;
    setLiveMetric(0);
  }, []);

  useEffect(() => {
    currentIdRef.current = current.id;
    resetAttempt();
    attemptRef.current = 0;
    introReadyRef.current = false;
    introAtRef.current = Date.now();
    speak(`Prueba ${currentIdx + 1}. ${current.title}. ${current.instruction}`, { key: `mov-${currentIdx}`, minGap: 0 })
      .then(() => { introReadyRef.current = true; introAtRef.current = Date.now(); });
  }, [current.id, current.title, current.instruction, currentIdx, resetAttempt]);

  // Cuenta regresiva hablada de 3 antes de medir.
  useEffect(() => {
    if (phase !== "prep") return;
    setPrepLeft(3);
    speak("Tres", { key: `prep-${currentIdx}-3`, minGap: 0 });
    let n = 3;
    const t = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(t);
        speak("¡Ya!", { key: `prep-${currentIdx}-go`, minGap: 0 });
        resetAttempt();
        setPhase("counting");
      } else {
        setPrepLeft(n);
        speak(n === 2 ? "Dos" : "Uno", { key: `prep-${currentIdx}-${n}`, minGap: 0 });
      }
    }, 1000);
    return () => clearInterval(t);
  }, [phase, currentIdx, resetAttempt]);

  useVoiceCommands(phase === "intro", () => setPhase("prep"));
  // En flexiones (amrap), "listo" durante la medición termina el intento ya.
  useVoiceCommands(phase === "counting" && current.mode === "amrap", () => finishRef.current());

  useEffect(() => {
    if (phase !== "intro") return;
    const remind = setTimeout(() => {
      speak("Si estás en posición, decime: listo. Y arrancamos.", { key: `mov-remind-${currentIdx}`, minGap: 0 });
    }, 20000);
    const force = setTimeout(() => {
      speak("Arrancamos igual. Hacé el movimiento lo mejor que puedas.", { key: `mov-force-${currentIdx}`, minGap: 0 });
      setPhase("prep");
    }, 35000);
    return () => { clearTimeout(remind); clearTimeout(force); };
  }, [phase, currentIdx]);

  const getRaw = useCallback((id: TestId) => {
    if (id === "ols") return Math.round(olsRef.current.heldMs / 100) / 10;
    if (id === "squat") return Math.max(1, squatScore(squatRef.current));
    return repRef.current.reps;
  }, []);

  const handleMoveDone = useCallback((override?: number) => {
    const id = current.id;
    const raw = override ?? getRaw(id);
    const bodySeen = framesWithBodyRef.current;
    logEvent("test", `fin prueba ${currentIdx + 1} (${id}): raw=${raw}, framesConCuerpo=${bodySeen}`);

    if (bodySeen < 5 && attemptRef.current < 1) {
      attemptRef.current += 1;
      resetAttempt();
      introReadyRef.current = false;
      introAtRef.current = Date.now();
      setPhase("intro");
      speakSeq(["No pude verte bien en esa prueba. Probemos de nuevo.", current.instruction], { key: `retry-${currentIdx}`, minGap: 0 })
        .then(() => { introReadyRef.current = true; introAtRef.current = Date.now(); });
      return;
    }

    resultsRef.current = { ...resultsRef.current, [id]: raw } as TestResults;
    logEvent("test", `resultado ${id}: ${raw}`);

    if (currentIdx < MOVEMENTS.length - 1) {
      speak("¡Buenísimo! Vamos con la siguiente.", { key: `done-${currentIdx}`, minGap: 0 });
      setPhase("intro");
      setCurrentIdx((i) => Math.min(i + 1, MOVEMENTS.length - 1));
    } else {
      speak("¡Terminamos! Estoy calculando tu resultado.", { key: "done-all", minGap: 0 });
      setPhase("done");
      onComplete(resultsRef.current);
    }
  }, [currentIdx, current.id, current.instruction, getRaw, onComplete, resetAttempt]);

  const finishRef = useRef(handleMoveDone);
  useEffect(() => { finishRef.current = handleMoveDone; }, [handleMoveDone]);

  // Suscripción al feed de pose compartido.
  useEffect(() => {
    setPoseHandler((landmarks) => {
      const ok = bodyPresent(landmarks);
      setDetected(ok);
      if (ok) framesWithBodyRef.current += 1;

      let motion = 1;
      if (ok && landmarks) {
        const mid = shoulderMidpoint(landmarks);
        const prev = prevMidRef.current;
        motion = prev ? Math.hypot(mid.x - prev.x, mid.y - prev.y) : 1;
        prevMidRef.current = mid;
      } else {
        prevMidRef.current = null;
      }

      if (phaseRef.current === "counting") {
        const id = currentIdRef.current;
        if (id === "ols") {
          const st = stepOLS(landmarks, olsRef.current, MOVEMENTS[0].duration * 1000);
          olsRef.current = st;
          setLiveMetric(Math.round(st.heldMs / 100) / 10);
          setFeedback(st.legUp ? "Sostenido… seguí así" : st.attempted ? "Volvé a levantar el pie" : "Levantá un pie del piso");
          if (st.done) finishRef.current(Math.round(st.heldMs / 100) / 10);
        } else if (id === "sts") {
          const st = stepSTS(landmarks, repRef.current);
          repRef.current = st;
          setLiveMetric(st.reps);
          setFeedback(st.phase === "down" ? "Ahora parate del todo" : "Sentate y volvé a pararte");
        } else if (id === "squat") {
          const st = stepSquat(landmarks, squatRef.current);
          squatRef.current = st;
          const score = squatScore(st);
          setLiveMetric(score);
          setFeedback(score >= 3 ? "¡Ahí! Profundidad completa" : score >= 2 ? "Cerca — un poco más abajo" : "Bajá más, brazos bien arriba");
        } else if (id === "pushup") {
          const st = stepPushup(landmarks, repRef.current);
          repRef.current = st;
          setLiveMetric(st.reps);
          setFeedback("Bajá completo — decí listo cuando termines");
        }
      }

      // Arranque manos libres: consigna terminada + 1s de aire + cuerpo
      // detectado Y QUIETO (acomodar la cámara/caminar resetea).
      if (phaseRef.current === "intro") {
        if (introReadyRef.current && ok && motion < 0.012 && Date.now() - introAtRef.current > 1000) {
          stableRef.current += 1;
          if (stableRef.current > 40) { stableRef.current = 0; setPhase("prep"); }
        } else if (!ok || motion > 0.025) {
          stableRef.current = 0;
        }
      }
    });
    return () => setPoseHandler(null);
  }, [setPoseHandler]);

  const timer = useCountdown(current.duration, phase === "counting", () => handleMoveDone());
  const progress = phase === "counting" ? ((current.duration - timer) / current.duration) * 100 : 0;

  // Coaching en vivo a mitad de prueba.
  useEffect(() => {
    if (phase !== "counting") return;
    if (timer === Math.ceil(current.duration / 2) && !cueFiredRef.current) {
      cueFiredRef.current = true;
      speak(MOVEMENT_CUES[current.id], { key: `cue-${currentIdx}-${attemptRef.current}`, minGap: 0 });
    }
  }, [timer, phase, current.duration, current.id, currentIdx]);

  const metricDisplay = current.id === "ols" ? liveMetric.toFixed(1)
    : current.id === "squat" ? "●".repeat(clamp(liveMetric, 0, 3)) + "○".repeat(3 - clamp(liveMetric, 0, 3))
    : String(liveMetric);

  return (
    <motion.div key="movement" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:"absolute", inset:0, pointerEvents:"none" }}>

      {/* Barra superior: qué prueba es + métrica en vivo */}
      <div style={{ position:"absolute", top:"calc(env(safe-area-inset-top) + 66px)", left:16, right:16, display:"flex", flexWrap:"wrap", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
        <div style={{ background:"rgba(8,11,15,0.62)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:22, padding:"14px 22px", backdropFilter:"blur(14px)" }}>
          <p style={{ color:C.sage, fontWeight:900, letterSpacing:"0.14em", fontSize:"0.72rem", textTransform:"uppercase", marginBottom:6 }}>
            Prueba {currentIdx + 1} de {MOVEMENTS.length}
          </p>
          <p style={{ color:"#F8F6F2", fontWeight:900, fontSize:"clamp(1.3rem,3vw,2.2rem)", letterSpacing:"-0.02em", lineHeight:1 }}>
            {current.emoji} {current.title}
          </p>
        </div>
        <div style={{ background:"rgba(8,11,15,0.62)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:22, padding:"14px 22px", textAlign:"right", backdropFilter:"blur(14px)" }}>
          <p style={{ color:"rgba(248,246,242,0.4)", fontWeight:900, letterSpacing:"0.14em", fontSize:"0.62rem", textTransform:"uppercase", marginBottom:6 }}>{current.metricLabel}</p>
          <p style={{ color:"#AFC3A5", fontWeight:900, fontSize:"clamp(2rem,4.5vw,3.4rem)", lineHeight:1 }}>
            {phase === "counting" ? metricDisplay : "—"}
          </p>
        </div>
      </div>

      {/* INTRO: consigna gigante en el centro */}
      {phase === "intro" && (
        <div style={{ position:"absolute", left:0, right:0, top:"50%", transform:"translateY(-50%)", display:"flex", justifyContent:"center", padding:"0 24px" }}>
          <div style={{ textAlign:"center", textShadow:"0 8px 40px rgba(0,0,0,0.75)" }}>
            <p style={{ fontSize:"clamp(3rem,8vw,5.5rem)", lineHeight:1, marginBottom:16 }}>{current.emoji}</p>
            <p style={{ color:"#F8F6F2", fontSize:"clamp(1.7rem,4.2vw,3.1rem)", fontWeight:900, letterSpacing:"-0.02em", lineHeight:1.25, maxWidth:900, margin:"0 auto" }}>
              {current.instruction}
            </p>
            <p style={{ color:"rgba(248,246,242,0.78)", fontSize:"clamp(1.2rem,2.6vw,1.8rem)", fontWeight:700, marginTop:20 }}>
              {detected ? "Quedate así — arrancamos en un momento" : "Esperando verte… o decí «listo»"}
            </p>
          </div>
        </div>
      )}

      {/* PREP: cuenta regresiva gigante */}
      {phase === "prep" && (
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(8,11,15,0.28)" }}>
          <motion.p key={prepLeft} initial={{ opacity:0, scale:1.6 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.35 }}
            style={{ fontSize:"clamp(9rem,30vw,20rem)", fontWeight:900, color:"#F8F6F2", lineHeight:1, textShadow:"0 10px 60px rgba(0,0,0,0.7)" }}>
            {prepLeft}
          </motion.p>
        </div>
      )}

      {/* COUNTING: métrica gigante centrada */}
      {phase === "counting" && (
        <div style={{ position:"absolute", left:0, right:0, top:"46%", transform:"translateY(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
          <p style={{ fontSize:"clamp(6rem,20vw,13rem)", fontWeight:900, fontFamily:"monospace", color:"rgba(248,246,242,0.92)", lineHeight:1, textShadow:"0 8px 50px rgba(0,0,0,0.6)" }}>
            {metricDisplay}
          </p>
          <p style={{ color:"rgba(248,246,242,0.5)", fontSize:"clamp(1rem,2.2vw,1.4rem)", fontWeight:700 }}>{current.metricLabel}</p>
        </div>
      )}

      {/* Abajo: feedback del trainer + barra + progreso */}
      <div style={{ position:"absolute", left:16, right:16, bottom:"calc(env(safe-area-inset-bottom) + 30px)", display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
        <div style={{ maxWidth:1000, background:"rgba(8,11,15,0.70)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:28, padding:"18px 34px", textAlign:"center", backdropFilter:"blur(16px)" }}>
          <p style={{ color:"#F8F6F2", fontWeight:800, fontSize:"clamp(1.4rem,3.4vw,2.4rem)", lineHeight:1.3, letterSpacing:"-0.01em" }}>
            {phase === "counting" ? feedback : current.hint}
          </p>
        </div>
        <div style={{ width:"min(560px, 78vw)", height:6, borderRadius:999, background:"rgba(255,255,255,0.14)", overflow:"hidden" }}>
          <motion.div animate={{ width: phase === "counting" ? `${progress}%` : "0%" }} transition={{ duration:0.25 }}
            style={{ height:"100%", borderRadius:999, background: C.sage }} />
        </div>
        <ProgressDots current={currentIdx} total={MOVEMENTS.length} />
      </div>
    </motion.div>
  );
}

/* ─── STEP: CALCULATING ───────────────── */
function StepCalculating({ results, onDone }: { results: TestResults; onDone: () => void }) {
  const items = MOVEMENTS.filter((m) => results[m.id] != null).map((m) => `${TEST_META[m.id].label}: ${TEST_META[m.id].fmt(results[m.id] as number)}`);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((i) => (i >= items.length - 1 ? i : i + 1));
    }, 550);
    return () => clearInterval(t);
  }, []); // eslint-disable-line

  useEffect(() => {
    const t = setTimeout(onDone, Math.max(1400, items.length * 550 + 700));
    return () => clearTimeout(t);
  }, []); // eslint-disable-line

  return (
    <motion.div key="calculating" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:28, textAlign:"center", padding:"0 24px" }}>

      <div style={{ position:"relative", width:100, height:100 }}>
        {[0,1,2].map(i => (
          <motion.div key={i}
            animate={{ scale:[1,1.3,1], opacity:[0.6,0.15,0.6] }}
            transition={{ duration:2, repeat:Infinity, delay:i*0.5, ease:"easeInOut" }}
            style={{ position:"absolute", inset:0, borderRadius:"50%", border:`2px solid ${C.sage}`, margin: i*(-14) }}
          />
        ))}
      </div>

      <h2 style={{ fontSize:"1.5rem", fontWeight:800, color:"#F8F6F2", letterSpacing:"-0.02em" }}>Comparando con las normas</h2>

      <div style={{ display:"flex", flexDirection:"column", gap:10, minHeight:120 }}>
        {items.map((line, i) => (
          <motion.p key={line} initial={{ opacity:0, y:10 }} animate={{ opacity: i <= idx ? 1 : 0.15, y:0 }} transition={{ duration:0.3 }}
            style={{ color: i <= idx ? "#AFC3A5" : "rgba(248,246,242,0.3)", fontSize:"1rem", fontWeight:700 }}>
            {line}
          </motion.p>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── STEP: REVEAL ───────────────────── */
function StepReveal({ maResult, chronoAge, results, onNext }: {
  maResult: MovementAgeResult;
  chronoAge: number;
  results: TestResults;
  onNext: () => void;
}) {
  const { age, ci, measured } = maResult;
  const diff = age != null ? age - chronoAge : 0;
  const isYounger = diff < 0;
  const isEqual = Math.abs(diff) <= 1;
  const color = age == null ? C.muted : isYounger ? "#4ade80" : isEqual ? C.sage : C.red;

  useEffect(() => {
    if (age == null) {
      speak("No junté suficientes datos para calcular tu Edad de Movimiento esta vez. Mirá el detalle de cada prueba en pantalla.", { key: "reveal", minGap: 0 });
      return;
    }
    // Secuencia de átomos con clip: la edad es un número pre-generado (1-90).
    const diffPhrase = isYounger
      ? "Tu cuerpo rinde como el de alguien más joven que tu edad, comparado con las normas publicadas. ¡Felicitaciones!"
      : isEqual
      ? "Tu desempeño está alineado con tu edad, según las normas publicadas."
      : "Tu cuerpo rinde como el de alguien mayor, comparado con las normas publicadas. Es tu punto de partida, y se puede mejorar.";
    speakSeq(["Tu Edad de Movimiento es", String(age), "años.", "con un margen de más menos", String(ci ?? 5), diffPhrase], { key: "reveal", minGap: 0 });
  }, []); // eslint-disable-line

  return (
    <motion.div key="reveal" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:"absolute", inset:0, overflowY:"auto", display:"flex", flexDirection:"column", alignItems:"center", padding:"84px 24px 40px", gap:24 }}>

      <p style={{ fontSize:"0.75rem", fontWeight:700, color:C.sage, letterSpacing:"0.2em", textTransform:"uppercase" }}>Tu resultado</p>

      {age != null ? (
        <>
          <div style={{ textAlign:"center" }}>
            <p style={{ fontSize:"0.85rem", color:"rgba(248,246,242,0.5)", marginBottom:4, fontWeight:500 }}>Edad de Movimiento</p>
            <p style={{ fontSize:"clamp(4.5rem,13vw,7rem)", fontWeight:900, color:"#F8F6F2", lineHeight:0.9, letterSpacing:"-0.05em", filter:`drop-shadow(0 0 40px ${color}60)` }}>
              {age}<span style={{ fontSize:"0.35em", color:"rgba(248,246,242,0.4)" }}> ± {ci}</span>
            </p>
            <p style={{ fontSize:"0.9rem", color, fontWeight:700, marginTop:8, maxWidth:420 }}>
              {isYounger ? `Rendís como alguien ${Math.abs(diff)} años más joven. 🎉`
                : isEqual ? "Tu desempeño está alineado con tu edad."
                : `Rendís como alguien ${diff} años mayor — tu punto de partida.`}
            </p>
          </div>

          <div style={{ display:"flex", gap:32, padding:"18px 30px", background:"rgba(8,11,15,0.5)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16 }}>
            <div style={{ textAlign:"center" }}>
              <p style={{ fontSize:"1.7rem", fontWeight:900, color:"rgba(248,246,242,0.3)", lineHeight:1 }}>{chronoAge}</p>
              <p style={{ fontSize:"0.68rem", color:"rgba(248,246,242,0.35)", textTransform:"uppercase", letterSpacing:"0.1em", marginTop:4 }}>Edad real</p>
            </div>
            <div style={{ width:1, background:"rgba(255,255,255,0.1)" }} />
            <div style={{ textAlign:"center" }}>
              <p style={{ fontSize:"1.7rem", fontWeight:900, color, lineHeight:1 }}>{age}</p>
              <p style={{ fontSize:"0.68rem", color:"rgba(248,246,242,0.35)", textTransform:"uppercase", letterSpacing:"0.1em", marginTop:4 }}>Edad de mov.</p>
            </div>
          </div>
        </>
      ) : (
        <p style={{ color:"rgba(248,246,242,0.6)", fontSize:"1rem", maxWidth:420, textAlign:"center" }}>
          No pudimos calcular tu Edad de Movimiento con suficiente certeza — necesitamos al menos 2 pruebas bien medidas. Mirá el detalle abajo.
        </p>
      )}

      {/* Desglose por prueba con fuente citada */}
      <div style={{ display:"flex", flexDirection:"column", gap:10, width:"min(560px, 92vw)" }}>
        {MOVEMENTS.map((m) => {
          const v = results[m.id];
          const eq = maResult.breakdown[m.id];
          return (
            <div key={m.id} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"14px 18px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
              <div>
                <p style={{ color:"#F8F6F2", fontWeight:700, fontSize:"0.92rem" }}>{TEST_META[m.id].label}</p>
                <p style={{ color:"rgba(248,246,242,0.4)", fontSize:"0.72rem" }}>Fuente: {TEST_META[m.id].source}</p>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ color:"#AFC3A5", fontWeight:800, fontSize:"1rem" }}>{v != null ? TEST_META[m.id].fmt(v) : "sin datos"}</p>
                {eq != null && <p style={{ color:"rgba(248,246,242,0.45)", fontSize:"0.72rem" }}>~{Math.round(eq)} años</p>}
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ fontSize:"0.85rem", color:"rgba(248,246,242,0.4)", lineHeight:1.65, maxWidth:460, textAlign:"center" }}>
        Es una estimación de bienestar, no un diagnóstico médico: compara tu desempeño con normas publicadas para tu edad y sexo ({measured.length} de {MOVEMENTS.length} pruebas medidas). Volvé a hacer la evaluación en unas semanas para ver tu progreso en tus propios números.
      </p>

      <motion.button initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }}
        onClick={onNext}
        whileHover={{ scale:1.04, boxShadow:"0 20px 50px rgba(122,143,116,0.4)" }}
        whileTap={{ scale:0.97 }}
        style={{ background:C.sage, color:"#fff", fontWeight:700, fontSize:"1rem", padding:"16px 40px", borderRadius:999, border:"none", cursor:"pointer" }}>
        Ver mi plan del Método FLORA →
      </motion.button>

      <button onClick={() => window.location.href = "/"}
        style={{ background:"transparent", border:"none", color:"rgba(248,246,242,0.3)", fontSize:"0.85rem", cursor:"pointer", fontWeight:500 }}>
        Volver al inicio
      </button>
    </motion.div>
  );
}

/* ─── STEP: PLAN (Método FLORA) ───────── */
function StepPlan({ breakdown, movementAge, chronoAge, onNext }: {
  breakdown: Partial<Record<TestId, number>>;
  movementAge: number | null;
  chronoAge: number;
  onNext: () => void;
}) {
  const plan = buildPlanFlora(breakdown, movementAge, chronoAge);

  useEffect(() => {
    logEvent("plan", `nivel ${plan.nivel} · ${plan.dias} días · foco ${plan.foco}`);
    speakSeq(plan.vozPartes, { key: "plan", minGap: 0 });
  }, []); // eslint-disable-line

  const SEMANAS = [
    { s: "S1", l: "arranque", w: 34 },
    { s: "S2", l: "+ series", w: 52 },
    { s: "S3", l: "+ series", w: 70 },
    { s: "S4", l: "pico", w: 92 },
    { s: "S5", l: "descarga", w: 26, deload: true },
  ];

  return (
    <motion.div key="plan" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:"absolute", inset:0, overflowY:"auto", padding:"84px 20px 40px" }}>
      <div style={{ maxWidth:680, margin:"0 auto", display:"flex", flexDirection:"column", gap:18 }}>

        <div style={{ textAlign:"center" }}>
          <p style={{ fontSize:"0.72rem", fontWeight:800, color:C.sage, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:10 }}>
            Método FLORA · Bloque 1
          </p>
          <h2 style={{ fontSize:"clamp(1.9rem,5vw,2.8rem)", fontWeight:900, color:"#F8F6F2", lineHeight:1, letterSpacing:"-0.03em", marginBottom:12 }}>
            Tu primer bloque de 5 semanas
          </h2>
          <p style={{ color:"rgba(248,246,242,0.6)", fontSize:"0.95rem", lineHeight:1.65, fontWeight:300, maxWidth:520, margin:"0 auto" }}>
            {plan.focoDetalle}
          </p>
        </div>

        <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
          {[`Nivel ${plan.nivel}`, `${plan.dias} días/semana`, `Foco: ${plan.foco}`, "45-55 min/sesión"].map((t) => (
            <span key={t} style={{ background:"rgba(122,143,116,0.16)", border:"1px solid rgba(122,143,116,0.35)", borderRadius:999, padding:"8px 16px", color:"#AFC3A5", fontSize:"0.82rem", fontWeight:700 }}>
              {t}
            </span>
          ))}
        </div>

        <div style={{ background:"rgba(8,11,15,0.66)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:20, padding:"18px 20px", backdropFilter:"blur(14px)" }}>
          <p style={{ fontSize:"0.62rem", fontWeight:900, letterSpacing:"0.18em", textTransform:"uppercase", color:C.sage, marginBottom:14 }}>
            Cómo progresa el bloque: 4 semanas subiendo series, 1 de descarga
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
            {SEMANAS.map((w, i) => (
              <div key={w.s} style={{ display:"grid", gridTemplateColumns:"34px 1fr 82px", gap:12, alignItems:"center" }}>
                <span style={{ fontSize:"0.75rem", fontWeight:800, color: w.deload ? "#AFC3A5" : "rgba(248,246,242,0.65)" }}>{w.s}</span>
                <motion.div initial={{ width:0 }} animate={{ width:`${w.w}%` }} transition={{ duration:0.8, delay:0.2 + i*0.12, ease:"easeOut" }}
                  style={{ height:9, borderRadius:99, background: w.deload ? "linear-gradient(90deg,#1E3A2B,#7A8F74)" : "linear-gradient(90deg,#AFC3A5,#7A8F74)" }} />
                <span style={{ fontSize:"0.7rem", color:"rgba(248,246,242,0.45)" }}>{w.l}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <p style={{ fontSize:"0.62rem", fontWeight:900, letterSpacing:"0.18em", textTransform:"uppercase", color:C.sage, textAlign:"center" }}>
            Tu semana 1 — todas las series con 1-2 repeticiones en reserva
          </p>
          {plan.sesiones.map((s, i) => (
            <motion.div key={s.dia} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 + i*0.1 }}
              style={{ background:"rgba(8,11,15,0.66)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:20, padding:"16px 20px", backdropFilter:"blur(14px)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:10 }}>
                <p style={{ color:"#F8F6F2", fontWeight:900, fontSize:"1.05rem" }}>{s.dia} <span style={{ color:C.sage, fontWeight:700, fontSize:"0.9rem" }}>— {s.titulo}</span></p>
              </div>
              {s.ejercicios.map((e) => (
                <div key={e.n} style={{ display:"flex", justifyContent:"space-between", gap:12, padding:"7px 0", borderTop:"1px solid rgba(255,255,255,0.07)" }}>
                  <span style={{ color:"rgba(248,246,242,0.78)", fontSize:"0.9rem", fontWeight:400 }}>{e.n}</span>
                  <span style={{ color:"#AFC3A5", fontSize:"0.88rem", fontWeight:800, whiteSpace:"nowrap", fontVariantNumeric:"tabular-nums" }}>{e.series}</span>
                </div>
              ))}
            </motion.div>
          ))}
        </div>

        <div style={{ background:"rgba(30,58,43,0.5)", border:"1px solid rgba(122,143,116,0.3)", borderRadius:20, padding:"16px 20px", backdropFilter:"blur(14px)" }}>
          <p style={{ fontSize:"0.62rem", fontWeight:900, letterSpacing:"0.18em", textTransform:"uppercase", color:"#AFC3A5", marginBottom:10 }}>
            Las 3 reglas del bloque
          </p>
          {[
            "Guardate 1-2 repeticiones en cada serie: las últimas tienen que costar, el fallo se usa poco.",
            "¿Día corto? Sesión mínima: 15 minutos con los 2 primeros ejercicios. Cuenta para tu consistencia.",
            "La meta no es la sesión perfecta: es cumplir el 80% del mes. Anotá series, reps y cuánto te costó.",
          ].map((r) => (
            <p key={r} style={{ color:"rgba(248,246,242,0.72)", fontSize:"0.88rem", lineHeight:1.6, margin:"6px 0", fontWeight:300 }}>
              <span style={{ color:C.sage, fontWeight:900 }}>· </span>{r}
            </p>
          ))}
        </div>

        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, marginTop:6 }}>
          <motion.button onClick={onNext}
            whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
            style={{ background:C.sage, color:"#fff", fontWeight:800, fontSize:"1.05rem", padding:"17px 42px", borderRadius:999, border:"none", cursor:"pointer" }}>
            Recibir mi plan completo →
          </motion.button>
          <a href="/metodo/" style={{ color:"rgba(248,246,242,0.4)", fontSize:"0.82rem", fontWeight:600 }}>
            Conocer el Método FLORA: Fuerza · Longevidad · Orden · Recuperación · Alimentación
          </a>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── STEP: SAVE ──────────────────────── */
function resultUrl(id: string) {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/resultado/?id=${encodeURIComponent(id)}`;
}

function sesionUrl(id: string) {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/sesion/?id=${encodeURIComponent(id)}`;
}

function StepSave({ movementAge, chronoAge, results, resultId }: { movementAge: number | null; chronoAge: number; results: TestResults; resultId: string | null }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  // Persistir localmente SIEMPRE (además del autoguardado en el servidor
  // que ya ocurrió apenas se calculó el resultado, en handleMovementsComplete).
  useEffect(() => {
    try {
      localStorage.setItem("calistenia_eval_result", JSON.stringify({ ts: Date.now(), chronoAge, movementAge, results, resultId, build: EVAL_BUILD }));
    } catch {}
  }, [chronoAge, movementAge, results, resultId]);

  const link = resultId ? resultUrl(resultId) : "";

  const handleCopy = () => {
    navigator.clipboard?.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setSent(true); return; }
    setSaving(true);
    try {
      // Actualiza el mismo registro ya guardado, sumándole el email
      // (en vez de crear uno nuevo con datos incompletos).
      const r = await fetch("/api/evaluacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resultId, email, chronoAge, build: EVAL_BUILD }),
      });
      const data: { ok: boolean; emailSent?: boolean } = await r.json();
      setEmailSent(!!data.emailSent);
      logEvent("save", `email sumado: ${email} · enviado=${data.emailSent}`);
    } catch (err) {
      logEvent("error", `save email falló: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSaving(false);
      setSent(true);
    }
  };

  if (sent) {
    return (
      <motion.div initial={{ opacity:0,scale:0.95 }} animate={{ opacity:1,scale:1 }}
        style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:24, textAlign:"center", padding:"0 24px" }}>
        <motion.div animate={{ scale:[1,1.2,1] }} transition={{ duration:0.5 }}
          style={{ fontSize:"4rem" }}>🎉</motion.div>
        <h2 style={{ fontSize:"1.8rem", fontWeight:900, color:"#F8F6F2", letterSpacing:"-0.02em" }}>¡Listo!</h2>
        <p style={{ color:"rgba(248,246,242,0.55)", fontSize:"1rem", lineHeight:1.7, maxWidth:380, fontWeight:300 }}>
          {emailSent
            ? <>Guardamos tu resultado y te lo mandamos a <strong style={{ color:C.sage }}>{email}</strong>.</>
            : "Guardamos tu resultado. Usá el link de abajo para verlo cuando quieras."}
        </p>
        {link && (
          <div style={{ display:"flex", gap:8, width:"min(480px, 92vw)" }}>
            <div style={{ flex:1, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"12px 14px", color:"rgba(248,246,242,0.7)", fontSize:"0.82rem", textAlign:"left", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {link}
            </div>
            <button onClick={handleCopy} style={{ background:C.sage, color:"#fff", fontWeight:700, fontSize:"0.85rem", padding:"0 18px", borderRadius:12, border:"none", cursor:"pointer", whiteSpace:"nowrap" }}>
              {copied ? "¡Copiado!" : "Copiar"}
            </button>
          </div>
        )}
        {resultId && (
          <a href={sesionUrl(resultId)} style={{ background:C.sage, color:"#fff", fontWeight:800, fontSize:"1.05rem", padding:"16px 40px", borderRadius:999, textDecoration:"none" }}>
            Empezar mi primera sesión →
          </a>
        )}
        <a href="/" style={{ background:"transparent", color:"rgba(248,246,242,0.4)", fontWeight:600, fontSize:"0.9rem", textDecoration:"none" }}>
          Explorar CALISTENIA.bio
        </a>
      </motion.div>
    );
  }

  return (
    <motion.div key="save" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:28, textAlign:"center", padding:"0 24px" }}>

      <div style={{ maxWidth:480 }}>
        <p style={{ fontSize:"0.75rem", color:C.sage, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:8 }}>Ya guardamos tu resultado</p>
        <h2 style={{ fontSize:"clamp(1.8rem,4vw,2.4rem)", fontWeight:900, color:"#F8F6F2", lineHeight:0.95, letterSpacing:"-0.03em", marginBottom:12 }}>
          {movementAge != null ? <>Tu Edad de Movimiento es <span style={{ color:C.sage }}>{movementAge}</span></> : "Guardado con éxito"}
        </h2>
        <p style={{ color:"rgba(248,246,242,0.5)", fontSize:"0.95rem", lineHeight:1.65, fontWeight:300 }}>
          Dejanos tu email (opcional) para recibir tu plan completo, o copiá el link de abajo para volver a verlo.
        </p>
      </div>

      {link && (
        <div style={{ display:"flex", gap:8, width:"min(480px, 92vw)" }}>
          <div style={{ flex:1, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"12px 14px", color:"rgba(248,246,242,0.7)", fontSize:"0.8rem", textAlign:"left", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {link}
          </div>
          <button onClick={handleCopy} style={{ background:"rgba(122,143,116,0.2)", color:C.sage, fontWeight:700, fontSize:"0.85rem", padding:"0 18px", borderRadius:12, border:`1px solid ${C.sage}55`, cursor:"pointer", whiteSpace:"nowrap" }}>
            {copied ? "¡Copiado!" : "Copiar link"}
          </button>
        </div>
      )}

      {authUser ? (
        <p style={{ color:C.sage, fontSize:"0.88rem", fontWeight:600 }}>✓ Progreso guardado en tu cuenta ({authUser.email})</p>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
          <GoogleLogin evalId={resultId} onLogin={(u) => setAuthUser(u)} />
          <p style={{ color:"rgba(248,246,242,0.3)", fontSize:"0.72rem" }}>Creá tu cuenta y retomá tu plan desde cualquier dispositivo</p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ width:"min(480px, 92vw)", display:"flex", flexDirection:"column", gap:12 }}>
        <input type="email" placeholder="tu@email.com (opcional)" value={email} onChange={e => setEmail(e.target.value)}
          style={{ width:"100%", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"14px 18px", color:"#F8F6F2", fontSize:"1rem", outline:"none" }} />
        <motion.button type="submit" disabled={saving} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
          style={{ width:"100%", background:C.sage, color:"#fff", fontWeight:700, fontSize:"1rem", padding:"16px", borderRadius:12, border:"none", cursor:"pointer", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Guardando…" : "Continuar →"}
        </motion.button>
      </form>
    </motion.div>
  );
}

/* ─── MAIN FLOW ───────────────────────── */
// Arquitectura de feed único: la cámara y el modelo de pose se crean UNA vez
// y viven a nivel del flow. Los pasos son overlays (slides) que se suscriben
// al stream de landmarks.
export function OnboardingFlow() {
  const [step, setStep] = useState<Step>("hook");
  const [chronoAge, setChronoAge] = useState(40);
  const [sex, setSex] = useState<Sex>("M");
  const [testResults, setTestResults] = useState<TestResults>({});
  const [maResult, setMaResult] = useState<MovementAgeResult>({ age: null, ci: null, breakdown: {}, measured: [] });
  const [resultId, setResultId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<PoseRuntime | null>(null);
  const poseSubRef = useRef<PoseHandler | null>(null);
  const [cameraState, setCameraState] = useState<"idle"|"starting"|"on"|"error">("idle");
  const [camStatus, setCamStatus] = useState("Listo para activar cámara");
  const [hud, setHud] = useState("");

  const setPoseHandler = useCallback((fn: PoseHandler | null) => {
    poseSubRef.current = fn;
  }, []);

  const startCamera = useCallback(async () => {
    if (runtimeRef.current || cameraState === "starting") return;
    setCameraState("starting");
    warmVoices();
    logEvent("camara", "activación solicitada");
    speak("Activando tu cámara. Ponete a dos o tres metros, de frente, que se vea tu cuerpo entero.", { key: "cam-on", minGap: 4000 });
    try {
      const runtime = await startPoseTracking({
        video: videoRef.current!,
        canvas: canvasRef.current!,
        onStatus: setCamStatus,
        onResults: (lms, quality) => {
          if (IS_DEV) setHud(`${EVAL_BUILD} · ${videoRef.current?.videoWidth ?? 0}×${videoRef.current?.videoHeight ?? 0} · ${lms?.length ?? 0} pts · vis ${(quality / 100).toFixed(2)}`);
          poseSubRef.current?.(lms, quality);
        },
      });
      runtimeRef.current = runtime;
      setCameraState("on");
    } catch (err) {
      console.error(err);
      logEvent("error", `cámara/modelo: ${err instanceof Error ? err.message : String(err)}`);
      setCameraState("error");
      setCamStatus("No pudimos iniciar la cámara o el modelo de pose");
    }
  }, [cameraState]);

  // Captura global de errores + limpieza al desmontar.
  useEffect(() => {
    warmVoices();
    loadVoiceManifest();
    logEvent("app", `journey iniciado (${EVAL_BUILD})`);
    const onErr = (e: ErrorEvent) => logEvent("error", `${e.message} @ ${e.filename?.split("/").pop() ?? "?"}:${e.lineno}`);
    const onRej = (e: PromiseRejectionEvent) => logEvent("promise", String(e.reason).slice(0, 140));
    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", onRej);
    return () => {
      window.removeEventListener("error", onErr);
      window.removeEventListener("unhandledrejection", onRej);
      runtimeRef.current?.stop();
      runtimeRef.current = null;
      stopSpeaking();
    };
  }, []);

  const handleIntakeDone = useCallback((age: number, s: Sex) => {
    setChronoAge(age);
    setSex(s);
    try { localStorage.setItem("calistenia_intake", JSON.stringify({ age, sex: s })); } catch {}
    logEvent("fase", `intake → cámara (edad ${age}, sexo ${s})`);
    setStep("camera");
  }, []);

  const handleMovementsComplete = useCallback((results: TestResults) => {
    logEvent("fase", `pruebas completas: ${JSON.stringify(results)}`);
    setTestResults(results);
    setStep("calculating");
    const ma = movementAgeV2(chronoAge, sex, results);
    setMaResult(ma);

    // Autoguardado inmediato: el resultado se persiste apenas se calcula,
    // sin depender de que el usuario llegue al paso de email. Genera un
    // link permanente (`resultId`) para consultarlo después.
    const plan = buildPlanFlora(ma.breakdown, ma.age, chronoAge);
    fetch("/api/evaluacion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chronoAge, sex, results, maResult: ma, plan, build: EVAL_BUILD }),
    })
      .then((r) => r.json())
      .then((data: { ok: boolean; id?: string }) => {
        if (data.ok && data.id) {
          setResultId(data.id);
          try { localStorage.setItem("calistenia_result_id", data.id); } catch {}
          logEvent("save", `autoguardado ok: ${data.id}`);
        }
      })
      .catch((err) => logEvent("error", `autoguardado falló: ${err instanceof Error ? err.message : String(err)}`));
  }, [chronoAge, sex]);

  const stepIndex = ["hook","intake","camera","movement","calculating","reveal","plan","save"].indexOf(step);
  const TOTAL_STEPS = 7;

  // El feed queda visible todo el journey; se atenúa en las etapas de resultado.
  const feedOpacity =
    cameraState !== "on" ? 0
    : step === "camera" || step === "movement" ? 0.85
    : step === "calculating" ? 0.22
    : 0.14;

  return (
    <div style={{ position:"fixed", inset:0, background:C.dark, overflow:"hidden" }}>

      {/* ── Feed único de video + esqueleto (persistente) ── */}
      <div style={{ position:"absolute", inset:0, opacity: feedOpacity, transition:"opacity 0.7s ease" }}>
        <video ref={videoRef} autoPlay playsInline muted
          style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", transform:"scaleX(-1)", display:"block" }} />
        <canvas ref={canvasRef}
          style={{ position:"absolute", inset:0, width:"100%", height:"100%", transform:"scaleX(-1)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:"radial-gradient(circle at 50% 45%, transparent 0%, rgba(8,11,15,0.10) 48%, rgba(8,11,15,0.72) 100%)" }} />
      </div>

      {/* Top bar */}
      <div style={{ position:"absolute", top:0, left:0, right:0, zIndex:10, padding:"calc(env(safe-area-inset-top) + 12px) 24px 12px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <a href="/" style={{ fontWeight:900, fontSize:"1.1rem", letterSpacing:"-0.03em", color:"#F8F6F2", textDecoration:"none" }}>
          CALISTENIA<span style={{ color:C.sage }}>.bio</span>
        </a>
        {step !== "hook" && step !== "intake" && step !== "reveal" && step !== "save" && (
          <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:"0.78rem", color:"rgba(248,246,242,0.35)", fontWeight:500 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:C.sage }} />
            {step === "camera" ? "Cámara"
              : step === "movement" ? "Evaluación"
              : step === "calculating" ? "Analizando"
              : ""}
          </div>
        )}
        {step === "hook" && (
          <div style={{ fontSize:"0.75rem", color:"rgba(248,246,242,0.25)", fontWeight:500 }}>
            Demo gratuita · ~6 minutos · Sin registro
          </div>
        )}
      </div>

      {/* ── Slides encima del feed ── */}
      <div style={{ position:"absolute", inset:0, zIndex:5 }}>
        <AnimatePresence mode="wait">
          {step === "hook" && <StepHook key="hook" onNext={() => { logEvent("fase", "hook → intake"); setStep("intake"); }} />}
          {step === "intake" && <StepIntake key="intake" onDone={handleIntakeDone} />}
          {step === "camera" && (
            <StepCamera key="camera"
              cameraState={cameraState}
              camStatus={camStatus}
              startCamera={startCamera}
              setPoseHandler={setPoseHandler}
              onNext={() => setStep("movement")} />
          )}
          {step === "movement" && (
            <StepMovement key="movement" setPoseHandler={setPoseHandler} onComplete={handleMovementsComplete} />
          )}
          {step === "calculating" && (
            <StepCalculating key="calculating" results={testResults} onDone={() => { logEvent("fase", "→ reveal"); setStep("reveal"); }} />
          )}
          {step === "reveal" && (
            <StepReveal key="reveal" maResult={maResult} chronoAge={chronoAge} results={testResults} onNext={() => { logEvent("fase", "→ plan"); setStep("plan"); }} />
          )}
          {step === "plan" && (
            <StepPlan key="plan" breakdown={maResult.breakdown} movementAge={maResult.age} chronoAge={chronoAge} onNext={() => setStep("save")} />
          )}
          {step === "save" && <StepSave key="save" movementAge={maResult.age} chronoAge={chronoAge} results={testResults} resultId={resultId} />}
        </AnimatePresence>
      </div>

      {/* HUD de diagnóstico + monitor de eventos (solo dev) */}
      {IS_DEV && cameraState === "on" && (
        <div style={{ position:"absolute", left:16, bottom:10, zIndex:30, color:"rgba(248,246,242,0.38)", fontSize:"0.68rem", fontFamily:"monospace", pointerEvents:"none" }}>
          {hud}
        </div>
      )}
      <EventMonitor />

      {/* Bottom progress bar */}
      {step !== "hook" && (
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:"rgba(255,255,255,0.06)", zIndex:20 }}>
          <motion.div
            initial={{ width: `${(stepIndex/TOTAL_STEPS)*100}%` }}
            animate={{ width: `${(stepIndex/TOTAL_STEPS)*100}%` }}
            transition={{ duration:0.5 }}
            style={{ height:"100%", background:C.sage }} />
        </div>
      )}
    </div>
  );
}
