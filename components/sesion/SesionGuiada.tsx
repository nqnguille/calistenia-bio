"use client";
// Sesión de entrenamiento guiada: el personal trainer en vivo. Recorre los
// ejercicios del día del plan FLORA con el feed único de cámara — consigna
// hablada, conteo de repeticiones en vivo por patrón de movimiento, descansos
// cronometrados, RIR al cierre de cada ejercicio, y registro de todo en el
// mismo registro KV del usuario.
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IS_DEV, logEvent } from "@/lib/evlog";
import { speak, speakSeq, stopSpeaking, warmVoices, ADVANCE_WORDS, SKIP_WORDS, loadVoiceManifest, setCoach, getCoach, availableCoaches } from "@/lib/voice";
import {
  type PoseRuntime, type Landmark,
  bodyPresent, startPoseTracking, stepReps, holdConditionMet,
  REP_INIT, type RepState,
} from "@/lib/pose-engine";
import { useVoiceCommands, useCountdown } from "@/components/shared/hooks";
import { EventMonitor } from "@/components/shared/EventMonitor";
import { GoogleLogin } from "@/components/shared/GoogleLogin";
import type { AuthUser } from "@/lib/authConfig";
import {
  buildTodaySession, instructionFor, restSecondsFor,
  seriesSpoken, rangoSpoken, restSpoken, ejercicioSpoken,
  type StoredPlan, type Progress, type TodaySession, type TodayExercise,
  type SessionLog, type EjercicioLog,
} from "@/lib/planRuntime";

const C = {
  sage: "#00E5FF", sage2: "#00E5FF", muted: "#8A8A8A",
  dark: "#0A0A0A", red: "#FF5A5A",
};

const SESSION_BUILD = "sesión v1";

interface StoredRecord {
  chronoAge: number | null;
  sex: "M" | "F";
  plan: StoredPlan | null;
  progress?: Progress;
  coach?: string;
}

type View = "loading" | "notfound" | "noplan" | "blockdone" | "resumen" | "training" | "fin";
type Phase = "exIntro" | "serie" | "rest" | "rir";

export function SesionGuiada() {
  const [view, setView] = useState<View>("loading");
  const [record, setRecord] = useState<StoredRecord | null>(null);
  const [session, setSession] = useState<TodaySession | null>(null);
  const idRef = useRef<string | null>(null);
  const progressRef = useRef<Progress>({ sessions: [] });

  // ── Máquina de entrenamiento ──
  const [exIdx, setExIdx] = useState(0);
  const [serieNum, setSerieNum] = useState(1);
  const [phase, setPhase] = useState<Phase>("exIntro");
  const phaseRef = useRef<Phase>("exIntro");
  const exRef = useRef<TodayExercise | null>(null);
  const repRef = useRef<RepState>(REP_INIT);
  const holdMsRef = useRef(0);
  const lastHoldTsRef = useRef<number | null>(null);
  const finishLatchRef = useRef(false);
  const lastProgressAtRef = useRef(0);
  const logRef = useRef<EjercicioLog[]>([]);
  const [liveMetric, setLiveMetric] = useState(0);
  const [detected, setDetected] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState<"idle" | "saving" | "ok" | "error">("idle");
  const [coaches, setCoaches] = useState<Array<{ id: string; nombre: string; emoji: string }>>([]);
  const [coachSel, setCoachSel] = useState<string>(getCoach());
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  const pickCoach = useCallback((id: string) => {
    setCoach(id);
    setCoachSel(id);
    // Preview inmediato: el coach elegido saluda con su propia voz.
    speak("Dale, seguimos.", { key: `coach-preview-${id}`, minGap: 0 });
    // Persistir la elección en el registro del usuario.
    if (idRef.current) {
      fetch("/api/evaluacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: idRef.current, coach: id }),
      }).catch(() => {});
    }
  }, []);

  // ── Cámara (feed único, se crea una vez) ──
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<PoseRuntime | null>(null);
  const [cameraState, setCameraState] = useState<"idle" | "starting" | "on" | "error">("idle");
  const [hud, setHud] = useState("");

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  /* ── Carga del registro ── */
  const loadRecord = useCallback((id: string) => {
    idRef.current = id;
    fetch(`/api/evaluacion?id=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((data: { ok: boolean; item?: StoredRecord }) => {
        if (!data.ok || !data.item) { setView("notfound"); return; }
        setRecord(data.item);
        if (data.item.coach) { setCoach(data.item.coach); setCoachSel(data.item.coach); }
        if (!data.item.plan?.sesiones?.length) { setView("noplan"); return; }
        progressRef.current = data.item.progress ?? { sessions: [] };
        const today = buildTodaySession(data.item.plan, progressRef.current);
        setSession(today);
        setView(today.blockDone ? "blockdone" : "resumen");
        logEvent("sesion", `cargada: sesión #${today.sessionNumber}, ${today.dia}, semana ${today.week}${today.isDeload ? " (descarga)" : ""}`);
      })
      .catch(() => setView("notfound"));
  }, []);

  useEffect(() => {
    warmVoices();
    loadVoiceManifest().then(() => setCoaches(availableCoaches()));
    const id = new URLSearchParams(window.location.search).get("id")
      ?? (() => { try { return localStorage.getItem("calistenia_result_id"); } catch { return null; } })();

    // Resolución de identidad: link/dispositivo primero; si no hay nada,
    // la CUENTA (cookie de sesión) recupera el progreso desde cualquier lado.
    fetch("/api/auth")
      .then((r) => r.json())
      .then((auth: { ok: boolean; user?: AuthUser; currentEvalId?: string | null }) => {
        if (auth.ok && auth.user) setAuthUser(auth.user);
        const resolved = id ?? (auth.ok ? auth.currentEvalId ?? null : null);
        if (!resolved) { setView("notfound"); return; }
        if (!id && resolved) { try { localStorage.setItem("calistenia_result_id", resolved); } catch {} }
        loadRecord(resolved);
      })
      .catch(() => {
        if (!id) { setView("notfound"); return; }
        loadRecord(id);
      });

    return () => {
      runtimeRef.current?.stop();
      runtimeRef.current = null;
      stopSpeaking();
    };
  }, [loadRecord]);

  /* ── Handler de pose por frame ── */
  const onPoseFrame = useCallback((landmarks: Landmark[] | null) => {
    const ok = bodyPresent(landmarks);
    setDetected(ok);
    if (phaseRef.current !== "serie") return;
    const ex = exRef.current;
    if (!ex) return;

    if (finishLatchRef.current) return;

    if (ex.measure.kind === "reps") {
      const prev = repRef.current;
      const st = stepReps(ex.measure.pattern, landmarks, prev);
      repRef.current = st;
      if (st.reps !== prev.reps) {
        setLiveMetric(st.reps);
        lastProgressAtRef.current = Date.now();
        // El trainer cuenta en voz alta cada repetición (clips hasta 90).
        if (st.reps <= 90) speak(String(st.reps), { key: `rep-${st.reps}-${Date.now() >> 11}`, minGap: 0 });
        const target = ex.presc.repMax;
        if (st.reps === target) {
          speak("¡Tope del rango! Si vas con buena técnica seguí, o decí listo.", { key: `top-${Date.now() >> 12}`, minGap: 0 });
        }
      }
    } else if (ex.measure.kind === "hold") {
      const now = performance.now();
      if (holdConditionMet(ex.measure.pattern, landmarks)) {
        if (lastHoldTsRef.current != null) holdMsRef.current += now - lastHoldTsRef.current;
        lastHoldTsRef.current = now;
        lastProgressAtRef.current = Date.now();
        const secs = holdMsRef.current / 1000;
        setLiveMetric(Math.round(secs * 10) / 10);
        const target = ex.presc.repMax; // en holds el rango es en segundos
        if (secs >= target) finishSerieRef.current();
      } else {
        lastHoldTsRef.current = null;
      }
    }
    // manual: no medimos nada — el usuario dice "listo".
  }, []);
  const onPoseFrameRef = useRef(onPoseFrame);
  useEffect(() => { onPoseFrameRef.current = onPoseFrame; }, [onPoseFrame]);

  /* ── Arranque de cámara + primera consigna ── */
  const startTraining = useCallback(async (minima: boolean) => {
    if (!record?.plan || cameraState === "starting") return;
    const today = buildTodaySession(record.plan, progressRef.current, minima);
    setSession(today);
    setCameraState("starting");
    logEvent("sesion", `empezando${minima ? " (mínima)" : ""}`);
    speak(
      today.isDeload
        ? "Semana de descarga: hoy va la mitad de series, sin exigirte al límite. Es la semana donde el esfuerzo del mes se convierte en resultado. Activando tu cámara."
        : minima
        ? "Sesión mínima: quince minutos, los dos ejercicios que más mueven la aguja. Cuenta para tu consistencia. Activando tu cámara."
        : "Arrancamos con tu sesión de hoy. Activando tu cámara.",
      { key: "ses-start", minGap: 0 }
    );
    try {
      const runtime = await startPoseTracking({
        video: videoRef.current!,
        canvas: canvasRef.current!,
        onResults: (lms, quality) => {
          if (IS_DEV) setHud(`${SESSION_BUILD} · ${lms?.length ?? 0} pts · vis ${(quality / 100).toFixed(2)}`);
          onPoseFrameRef.current(lms);
        },
      });
      runtimeRef.current = runtime;
      setCameraState("on");
      setView("training");
      setExIdx(0);
      setSerieNum(1);
      logRef.current = [];
      setPhase("exIntro");
    } catch (err) {
      logEvent("error", `cámara sesión: ${err instanceof Error ? err.message : String(err)}`);
      setCameraState("error");
    }
  }, [record, cameraState]);

  const ex = session?.ejercicios[exIdx] ?? null;
  useEffect(() => { exRef.current = ex; }, [ex]);

  /* ── Intro de cada ejercicio (secuencia de átomos con clip) ── */
  useEffect(() => {
    if (view !== "training" || phase !== "exIntro" || !ex || !session) return;
    const parts = [
      ejercicioSpoken(exIdx + 1, session.ejercicios.length),
      seriesSpoken(ex.setsHoy),
      rangoSpoken(ex.presc),
      ...(ex.presc.perSide ? ["Cada pierna, en la misma serie."] : []),
      instructionFor(ex.nombre),
      "Cuando arranques, yo cuento. Decí listo al terminar la serie.",
    ];
    speakSeq(parts, { key: `ex-${exIdx}`, minGap: 0 }).then(() => {
      startSerie();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, phase, exIdx]);

  const startSerie = useCallback(() => {
    repRef.current = REP_INIT;
    holdMsRef.current = 0;
    lastHoldTsRef.current = null;
    finishLatchRef.current = false;
    lastProgressAtRef.current = Date.now();
    setLiveMetric(0);
    setFeedback("");
    setPhase("serie");
  }, []);

  /* ── Fin de serie (con latch: voz y auto-completado pueden disparar juntos) ── */
  const finishSerie = useCallback(() => {
    const e = exRef.current;
    if (!e || phaseRef.current !== "serie" || finishLatchRef.current) return;
    finishLatchRef.current = true;
    const isHold = e.measure.kind === "hold";
    const value = isHold ? Math.round(holdMsRef.current / 100) / 10 : repRef.current.reps;

    // Registrar la serie en el log del ejercicio actual.
    let current = logRef.current[logRef.current.length - 1];
    if (!current || current.n !== e.nombre) {
      current = { n: e.nombre, series: [], rir: null, skipped: false };
      logRef.current.push(current);
    }
    current.series.push(isHold ? { reps: null, segundos: value } : { reps: value, segundos: null });
    logEvent("sesion", `serie ${serieNum}/${e.setsHoy} de "${e.nombre}": ${value}${isHold ? "s" : " reps"}`);

    if (serieNum < e.setsHoy) {
      const rest = restSecondsFor(e.nombre);
      speak(restSpoken(rest), { key: `rest-${exIdx}-${serieNum}`, minGap: 0 });
      setSerieNum((n) => n + 1);
      setPhase("rest");
    } else {
      speak("Última serie del ejercicio, ¡bien ahí! ¿Cuántas repeticiones te quedaban en el tanque? Marcalo en pantalla, o decí listo para seguir.", { key: `rir-${exIdx}`, minGap: 0 });
      setPhase("rir");
    }
  }, [serieNum, exIdx]);
  const finishSerieRef = useRef(finishSerie);
  useEffect(() => { finishSerieRef.current = finishSerie; }, [finishSerie]);

  /* ── Descanso cronometrado ── */
  const currentRest = ex ? restSecondsFor(ex.nombre) : 90;
  const restLeft = useCountdown(currentRest, phase === "rest", () => {
    speak("¡Vamos! Siguiente serie.", { key: `go-${exIdx}-${serieNum}`, minGap: 0 }).then(startSerie);
  });

  /* ── RIR y pase al siguiente ejercicio ── */
  const advanceExercise = useCallback((rir: number | null) => {
    const current = logRef.current[logRef.current.length - 1];
    if (current && phaseRef.current === "rir") current.rir = rir;
    if (!session) return;
    if (exIdx < session.ejercicios.length - 1) {
      setExIdx((i) => i + 1);
      setSerieNum(1);
      setPhase("exIntro");
    } else {
      finishSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exIdx, session]);

  // Auto-avance del RIR a los 12s si no responde.
  useEffect(() => {
    if (phase !== "rir") return;
    const t = setTimeout(() => advanceExercise(null), 12000);
    return () => clearTimeout(t);
  }, [phase, advanceExercise]);

  /* ── Saltear ejercicio ── */
  const skipExercise = useCallback(() => {
    const e = exRef.current;
    if (!e || phaseRef.current === "rir") return;
    logRef.current.push({ n: e.nombre, series: [], rir: null, skipped: true });
    logEvent("sesion", `salteado: ${e.nombre}`);
    speak("Lo salteamos, no pasa nada. Seguimos.", { key: `skip-${exIdx}`, minGap: 0 });
    if (session && exIdx < session.ejercicios.length - 1) {
      setExIdx((i) => i + 1);
      setSerieNum(1);
      setPhase("exIntro");
    } else {
      finishSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exIdx, session]);

  /* ── Fin de sesión: guardar y despedir ── */
  const finishSession = useCallback(() => {
    if (!session || !idRef.current) return;
    setView("fin");
    setSaving("saving");
    runtimeRef.current?.stop();
    runtimeRef.current = null;

    const log: SessionLog = {
      ts: new Date().toISOString(),
      week: session.week,
      diaIdx: session.diaIdx,
      dia: session.dia,
      minima: session.ejercicios.length <= 2,
      ejercicios: logRef.current,
    };
    const newProgress: Progress = { sessions: [...progressRef.current.sessions, log] };
    progressRef.current = newProgress;

    speak("¡Sesión completa! Quedó todo registrado. Nos vemos en la próxima — la consistencia es lo que manda.", { key: "ses-fin", minGap: 0 });

    fetch("/api/evaluacion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: idRef.current, progress: newProgress, build: SESSION_BUILD }),
    })
      .then((r) => r.json())
      .then((d: { ok: boolean }) => {
        setSaving(d.ok ? "ok" : "error");
        logEvent("sesion", `guardada: ${d.ok}`);
      })
      .catch(() => setSaving("error"));
  }, [session]);

  /* ── Órdenes de voz según fase ── */
  useVoiceCommands(view === "training", () => {
    const p = phaseRef.current;
    if (p === "serie") finishSerieRef.current();
    else if (p === "rest") { speak("Dale, seguimos.", { key: `skiprest-${Date.now() >> 12}`, minGap: 0 }).then(startSerie); }
    else if (p === "rir") advanceExercise(null);
  }, ADVANCE_WORDS);
  useVoiceCommands(view === "training" && phase !== "rir", skipExercise, SKIP_WORDS);

  // Recordatorio si la serie quedó sin actividad.
  useEffect(() => {
    if (view !== "training" || phase !== "serie") return;
    const t = setInterval(() => {
      if (Date.now() - lastProgressAtRef.current > 45000) {
        lastProgressAtRef.current = Date.now();
        speak("¿Todo bien? Decí listo para descansar, o saltar si este ejercicio no va.", { key: "idle-check", minGap: 30000 });
      }
    }, 5000);
    return () => clearInterval(t);
  }, [view, phase]);

  /* ═══════════════ RENDER ═══════════════
     IMPORTANTE: el <video>/<canvas> del feed viven SIEMPRE montados en el
     root (como en la evaluación) — si solo existieran en la vista de
     entrenamiento, startPoseTracking se engancharía a un elemento null al
     apretar "Empezar" desde el resumen. Las vistas son overlays. */

  const overlay =
    view === "loading" ? (
      <Shell><p style={{ color: "rgba(237,237,237,0.5)", fontFamily: "var(--font-mono-b)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.12em" }}>Preparando tu sesión…</p></Shell>
    ) : view === "notfound" || view === "noplan" ? (
      <Shell>
        <p style={{ fontSize: "2.5rem" }}>🔍</p>
        <h1 style={{ color: "#EDEDED", fontSize: "2rem", fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.01em" }}>
          {view === "noplan" ? "Todavía no tenés un plan" : "No encontramos tu plan"}
        </h1>
        <p style={{ color: "rgba(237,237,237,0.5)", maxWidth: 400, textAlign: "center" }}>
          Hacé la evaluación de 6 minutos y salís con tu plan del Método FLORA listo para entrenar.
        </p>
        <a href="/evaluacion/" style={btnStyle}>Hacer la evaluación →</a>
      </Shell>
    ) : view === "blockdone" ? (
      <Shell>
        <p style={{ fontSize: "2.5rem" }}>🏁</p>
        <h1 style={{ color: "#EDEDED", fontSize: "2.1rem", fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.01em", textAlign: "center" }}>¡Terminaste el Bloque 1!</h1>
        <p style={{ color: "rgba(237,237,237,0.55)", maxWidth: 420, textAlign: "center", lineHeight: 1.7 }}>
          Cinco semanas completas. Ahora toca medir el progreso: repetí la evaluación y armamos tu Bloque 2 con tus números nuevos — no a ciegas.
        </p>
        <a href="/evaluacion/" style={btnStyle}>Re-evaluarme y armar el Bloque 2 →</a>
      </Shell>
    ) : view === "resumen" && session ? (
      <Shell wide>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, color: C.sage, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "var(--font-mono-b)" }}>
          Sesión {session.sessionNumber} · Semana {session.week} de 5{session.isDeload ? " · DESCARGA" : ""}
        </p>
        <h1 style={{ color: "#EDEDED", fontSize: "clamp(2rem,5vw,3rem)", fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.01em", textAlign: "center" }}>
          {session.dia} — {session.titulo}
        </h1>
        {session.isDeload && (
          <p style={{ color: C.sage2, fontSize: "0.92rem", textAlign: "center", maxWidth: 440 }}>
            Semana de descarga: mitad de series, sin exigirte al límite. Acá se consolida el mes.
          </p>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "min(520px, 92vw)" }}>
          {session.ejercicios.map((e, i) => (
            <div key={e.nombre} style={{ display: "flex", justifyContent: "space-between", gap: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 0, padding: "13px 16px" }}>
              <span style={{ color: "rgba(237,237,237,0.85)", fontSize: "0.92rem" }}>{i + 1}. {e.nombre}</span>
              <span style={{ color: "#00E5FF", fontWeight: 700, fontSize: "0.88rem", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-mono-b)" }}>
                {e.setsHoy} × {e.presc.repMin}{e.presc.repMax !== e.presc.repMin ? `-${e.presc.repMax}` : ""}{e.presc.isTime ? " s" : ""}
              </span>
            </div>
          ))}
        </div>
        {coaches.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <p style={{ fontSize: "0.68rem", fontWeight: 700, color: C.sage, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "var(--font-mono-b)" }}>¿Quién te entrena hoy?</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              {coaches.map((c) => (
                <button key={c.id} onClick={() => pickCoach(c.id)}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 14px", borderRadius: 0, cursor: "pointer", fontSize: "0.8rem", fontWeight: 700, fontFamily: "var(--font-mono-b)", textTransform: "uppercase", letterSpacing: "0.04em",
                    background: coachSel === c.id ? "rgba(0,229,255,0.14)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${coachSel === c.id ? C.sage : "rgba(255,255,255,0.32)"}`,
                    color: coachSel === c.id ? C.sage2 : "rgba(237,237,237,0.75)" }}>
                  <span>{c.emoji}</span>{c.nombre}
                </button>
              ))}
            </div>
            <p style={{ fontSize: "0.72rem", color: "rgba(237,237,237,0.4)" }}>Tocá uno y escuchalo — misma inteligencia, tu estilo</p>
          </div>
        )}
        <p style={{ color: "rgba(237,237,237,0.45)", fontSize: "0.85rem", textAlign: "center", maxWidth: 440, lineHeight: 1.6 }}>
          Todo por voz: yo cuento tus repeticiones, cronometro tus descansos y registro la sesión. Decí «listo» para cerrar cada serie y «saltar» si un ejercicio no va.
        </p>
        {authUser ? (
          <p style={{ display: "flex", alignItems: "center", gap: 8, color: C.sage2, fontSize: "0.78rem", fontWeight: 600, fontFamily: "var(--font-mono-b)" }}>
            ✓ Progreso guardado en tu cuenta ({authUser.email})
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <GoogleLogin evalId={idRef.current} onLogin={(u) => setAuthUser(u)} />
            <p style={{ color: "rgba(237,237,237,0.4)", fontSize: "0.72rem" }}>Guardá tu progreso y retomalo desde cualquier dispositivo</p>
          </div>
        )}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={() => startTraining(false)} style={btnStyle}>
            {cameraState === "starting" ? "Activando cámara…" : "Empezar la sesión →"}
          </button>
          <button onClick={() => startTraining(true)} style={{ ...btnStyle, background: "transparent", color: "#EDEDED", border: "1px solid rgba(255,255,255,0.32)" }}>
            Sesión mínima (15′)
          </button>
        </div>
        {cameraState === "error" && (
          <p style={{ color: C.red, fontSize: "0.85rem" }}>No pudimos iniciar la cámara — revisá permisos y probá de nuevo.</p>
        )}
      </Shell>
    ) : view === "fin" && session ? (
      <Shell>
        <motion.p animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }} style={{ fontSize: "3.5rem" }}>💪</motion.p>
        <h1 style={{ color: "#EDEDED", fontSize: "2.2rem", fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.01em", textAlign: "center" }}>¡Sesión completa!</h1>
        <div style={{ display: "flex", gap: 28, padding: "18px 30px", background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 0 }}>
          {[
            { n: String(logRef.current.filter((e) => !e.skipped).length), l: "ejercicios" },
            { n: String(logRef.current.reduce((a, e) => a + e.series.length, 0)), l: "series" },
            { n: `S${session.week}`, l: "semana" },
          ].map((s) => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <p style={{ fontSize: "2.2rem", color: "#00E5FF", lineHeight: 1, fontFamily: "var(--font-display)" }}>{s.n}</p>
              <p style={{ fontSize: "0.68rem", color: "rgba(237,237,237,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4, fontFamily: "var(--font-mono-b)" }}>{s.l}</p>
            </div>
          ))}
        </div>
        <p style={{ color: "rgba(237,237,237,0.5)", fontSize: "0.9rem", textAlign: "center", maxWidth: 400, lineHeight: 1.65 }}>
          {saving === "saving" ? "Guardando tu sesión…"
            : saving === "ok" ? "Sesión registrada. La próxima vez que entres, te toca la siguiente del plan — la consistencia es lo que manda."
            : saving === "error" ? "No pudimos guardar en el servidor (queda registrada en este dispositivo). Reintentá desde tu link."
            : ""}
        </p>
        <a href="/" style={btnStyle}>Listo por hoy →</a>
      </Shell>
    ) : null;

  /* ── TRAINING (fullscreen sobre el feed) ── */
  const target = ex ? (ex.presc.isTime ? `${ex.presc.repMin}-${ex.presc.repMax} s` : `${ex.presc.repMin}-${ex.presc.repMax}`) : "";
  const metricDisplay = ex?.measure.kind === "hold" ? liveMetric.toFixed(1) : String(liveMetric);

  return (
    <div style={{ position: "fixed", inset: 0, background: C.dark, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: cameraState === "on" ? 0.85 : 0, transition: "opacity 0.7s ease" }}>
        <video ref={videoRef} autoPlay playsInline muted
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)", display: "block" }} />
        <canvas ref={canvasRef}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: "scaleX(-1)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(circle at 50% 45%, transparent 0%, rgba(10,10,10,0.10) 48%, rgba(10,10,10,0.72) 100%)" }} />
      </div>

      {/* Barra superior */}
      {view === "training" && session && ex && (
        <div style={{ position: "absolute", top: "calc(env(safe-area-inset-top) + 14px)", left: 16, right: 16, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 10, zIndex: 10 }}>
          <div style={{ background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 0, padding: "14px 22px" }}>
            <p style={{ color: C.sage, fontWeight: 700, letterSpacing: "0.14em", fontSize: "0.72rem", textTransform: "uppercase", marginBottom: 6, fontFamily: "var(--font-mono-b)" }}>
              {session.dia} · Ejercicio {exIdx + 1}/{session.ejercicios.length} · Serie {serieNum}/{ex.setsHoy}
            </p>
            <p style={{ color: "#EDEDED", fontSize: "clamp(1.3rem,3vw,2.2rem)", textTransform: "uppercase", letterSpacing: "0.01em", lineHeight: 1.1, fontFamily: "var(--font-display)" }}>
              {ex.nombre}
            </p>
          </div>
          <div style={{ background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 0, padding: "14px 22px", textAlign: "right" }}>
            <p style={{ color: "rgba(237,237,237,0.45)", fontWeight: 700, letterSpacing: "0.14em", fontSize: "0.62rem", textTransform: "uppercase", marginBottom: 6, fontFamily: "var(--font-mono-b)" }}>objetivo {target}</p>
            <p style={{ color: "#00E5FF", fontSize: "clamp(2rem,4.5vw,3.4rem)", lineHeight: 1, fontFamily: "var(--font-display)" }}>
              {phase === "serie" ? metricDisplay : "—"}
            </p>
          </div>
        </div>
      )}

      {/* Centro: métrica gigante / descanso / RIR */}
      <div style={{ position: "absolute", inset: 0, display: view === "training" ? "flex" : "none", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 5 }}>
        <AnimatePresence mode="wait">
          {phase === "serie" && ex && ex.measure.kind !== "manual" && (
            <motion.div key="metric" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: "center" }}>
              <p style={{ fontSize: "clamp(7rem,26vw,17rem)", fontFamily: "var(--font-display)", color: "rgba(237,237,237,0.94)", lineHeight: 1, textShadow: "0 8px 50px rgba(0,0,0,0.6)" }}>
                {metricDisplay}
              </p>
              <p style={{ color: "rgba(237,237,237,0.6)", fontSize: "clamp(1rem,2.4vw,1.5rem)", fontWeight: 700, fontFamily: "var(--font-mono-b)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {ex.measure.kind === "hold" ? "segundos" : "repeticiones"} · decí «listo» al terminar
              </p>
            </motion.div>
          )}
          {phase === "serie" && ex && ex.measure.kind === "manual" && (
            <motion.div key="manual" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: "center", padding: "0 24px" }}>
              <p style={{ fontSize: "clamp(2.5rem,7vw,4.5rem)", lineHeight: 1.1, marginBottom: 14 }}>🏃</p>
              <p style={{ color: "#EDEDED", fontSize: "clamp(1.5rem,3.6vw,2.4rem)", fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.01em", maxWidth: 700, textShadow: "0 8px 40px rgba(0,0,0,0.7)" }}>
                A tu ritmo — decí «listo» al terminar la serie
              </p>
            </motion.div>
          )}
          {phase === "rest" && (
            <motion.div key="rest" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: "center" }}>
              <p style={{ color: C.sage2, fontSize: "clamp(1.1rem,2.6vw,1.6rem)", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8, fontFamily: "var(--font-mono-b)" }}>Descanso</p>
              <p style={{ fontSize: "clamp(6rem,22vw,14rem)", fontFamily: "var(--font-display)", color: "rgba(237,237,237,0.94)", lineHeight: 1, textShadow: "0 8px 50px rgba(0,0,0,0.6)" }}>
                {restLeft}
              </p>
              <p style={{ color: "rgba(237,237,237,0.55)", fontSize: "clamp(0.95rem,2.2vw,1.3rem)", fontWeight: 700, fontFamily: "var(--font-mono-b)", textTransform: "uppercase", letterSpacing: "0.06em" }}>decí «listo» para arrancar antes</p>
            </motion.div>
          )}
          {phase === "exIntro" && ex && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: "center", padding: "0 24px" }}>
              <p style={{ color: "#EDEDED", fontSize: "clamp(1.6rem,4vw,2.8rem)", fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.01em", maxWidth: 800, lineHeight: 1.25, textShadow: "0 8px 40px rgba(0,0,0,0.7)" }}>
                {instructionFor(ex.nombre)}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RIR chips (interactivo) */}
      {phase === "rir" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, zIndex: 20, background: "rgba(0,0,0,0.7)" }}>
          <p style={{ color: "#EDEDED", fontSize: "clamp(1.5rem,3.6vw,2.4rem)", fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.01em", textAlign: "center", padding: "0 24px" }}>
            ¿Cuántas repeticiones te quedaban en el tanque?
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
            {[0, 1, 2, 3, 4].map((r) => (
              <button key={r} onClick={() => advanceExercise(r)}
                style={{ width: 74, height: 74, borderRadius: 0, background: r >= 1 && r <= 2 ? "rgba(0,229,255,0.16)" : "rgba(255,255,255,0.05)", border: `1px solid ${r >= 1 && r <= 2 ? C.sage : "rgba(255,255,255,0.32)"}`, color: "#EDEDED", fontSize: "1.9rem", fontFamily: "var(--font-display)", cursor: "pointer" }}>
                {r === 4 ? "4+" : r}
              </button>
            ))}
          </div>
          <p style={{ color: "rgba(237,237,237,0.5)", fontSize: "0.8rem", fontFamily: "var(--font-mono-b)", textTransform: "uppercase", letterSpacing: "0.06em" }}>1-2 es el punto ideal del método · decí «listo» para saltear</p>
        </div>
      )}

      {/* Feedback inferior */}
      {view === "training" && phase !== "rir" && (
        <div style={{ position: "absolute", left: 16, right: 16, bottom: "calc(env(safe-area-inset-bottom) + 20px)", display: "flex", justifyContent: "center", zIndex: 10, pointerEvents: "none" }}>
          <div style={{ maxWidth: 900, background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 0, padding: "14px 28px", textAlign: "center" }}>
            <p style={{ color: "rgba(237,237,237,0.8)", fontWeight: 700, fontSize: "clamp(0.95rem,2.2vw,1.3rem)", fontFamily: "var(--font-mono-b)" }}>
              {feedback || (detected ? "🎤 «listo» cierra la serie · «saltar» saltea el ejercicio" : "Ubicate donde te vea entera la cámara")}
            </p>
          </div>
        </div>
      )}

      {/* Vistas no-entrenamiento como overlays por encima del feed */}
      {overlay}

      {IS_DEV && cameraState === "on" && (
        <div style={{ position: "absolute", left: 16, bottom: 8, zIndex: 30, color: "rgba(237,237,237,0.4)", fontSize: "0.68rem", fontFamily: "var(--font-mono-b)", pointerEvents: "none" }}>
          {hud}
        </div>
      )}
      <EventMonitor />
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: "#00E5FF", color: "#0A0A0A", fontWeight: 700, fontSize: "0.95rem",
  fontFamily: "var(--font-mono-b)", textTransform: "uppercase", letterSpacing: "0.08em",
  padding: "16px 36px", borderRadius: 0, border: "none", cursor: "pointer", textDecoration: "none",
};

// Overlay de vista completa por ENCIMA del feed siempre-montado (zIndex 40):
// tapa el video mientras no se entrena, sin desmontar los refs de cámara.
function Shell({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 40, overflowY: "auto", background: "#0A0A0A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22, padding: wide ? "60px 20px" : "0 24px" }}>
      <a href="/" style={{ position: "fixed", top: 18, left: 24, display: "flex", alignItems: "center", gap: 8, fontSize: "1.15rem", letterSpacing: "0.02em", color: "#EDEDED", textDecoration: "none", fontFamily: "var(--font-display)", textTransform: "uppercase" }}>
        CALISTENIA<span style={{ color: "#00E5FF" }}>.bio</span>
        <span style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#00E5FF", border: "1px solid rgba(0,229,255,0.45)", borderRadius: 0, padding: "3px 8px", fontFamily: "var(--font-mono-b)" }}>Demo gratis</span>
      </a>
      {children}
    </div>
  );
}
