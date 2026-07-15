"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  cream: "#F8F6F2", ink: "#151716", ink2: "#343A36",
  sage: "#7A8F74", muted: "#8E9188", border: "#DED9CE",
  dark: "#080B0F", dark2: "#111821", red: "#ef4444",
};

const EVAL_BUILD = "v8 · feed único + monitor";

/* ─── Types ─────────────────────────────── */
type Step = "hook" | "camera" | "movement" | "calculating" | "reveal" | "save";

interface MovementTest {
  id: string;
  title: string;
  instruction: string;
  emoji: string;
  duration: number; // seconds
  hint: string;
}

const MOVEMENTS: MovementTest[] = [
  { id: "posture",  title: "Postura en reposo",   instruction: "Quedate quieto, brazos al costado, mirada al frente.", emoji: "🧍", duration: 7,  hint: "Estamos midiendo tu alineación natural" },
  { id: "arms",     title: "Movilidad de hombros", instruction: "Levantá ambos brazos sobre la cabeza, lo más alto que puedas, y sostenelos.", emoji: "🙆", duration: 8, hint: "La movilidad del hombro es clave para la edad funcional" },
  { id: "balance",  title: "Equilibrio a una pierna",  instruction: "Levantá una rodilla bien alto y mantené el equilibrio.", emoji: "🦩", duration: 8, hint: "El equilibrio predice el envejecimiento neuromotor" },
];

// Frase corta que el trainer dice a mitad de prueba si no ve el movimiento.
const MOVEMENT_CUES: Record<MovementTest["id"], string> = {
  posture: "Quedate bien quieto, mirando al frente.",
  arms: "Subí los brazos, bien arriba de la cabeza.",
  balance: "Levantá una rodilla y aguantá ahí.",
};

type Landmark = { x: number; y: number; z?: number; visibility?: number };
type PoseAnalysis = { detected: boolean; score: number; feedback: string; detail: string };
type PoseRuntime = { stop: () => void };
type PoseHandler = (landmarks: Landmark[] | null, quality: number) => void;

declare global {
  interface Window {
    Pose?: new (config: { locateFile: (file: string) => string }) => {
      setOptions: (options: Record<string, unknown>) => void;
      onResults: (cb: (results: { poseLandmarks?: Landmark[] }) => void) => void;
      send: (input: { image: HTMLVideoElement }) => Promise<void>;
      close: () => void;
    };
    Camera?: new (video: HTMLVideoElement, config: {
      onFrame: () => Promise<void>;
      width: number;
      height: number;
      facingMode: "user" | "environment";
    }) => { start: () => Promise<void>; stop: () => void };
  }
}

/* ─── Monitor de eventos ─────────────────── */
// Registro liviano de todo lo que pasa en el front: errores JS, fases, voz,
// detección. Visible en pantalla (panel chico abajo a la derecha) y persistido
// en localStorage("calistenia_evlog") para poder reportar sin capturas.
type EvEntry = { t: number; tag: string; msg: string };
const EVLOG: EvEntry[] = [];
let evSubscribers: Array<() => void> = [];

function logEvent(tag: string, msg: string) {
  EVLOG.push({ t: Date.now(), tag, msg });
  if (EVLOG.length > 300) EVLOG.splice(0, EVLOG.length - 300);
  try { localStorage.setItem("calistenia_evlog", JSON.stringify(EVLOG.slice(-120))); } catch {}
  // eslint-disable-next-line no-console
  console.log(`[ev:${tag}]`, msg);
  evSubscribers.forEach((f) => f());
}

function EventMonitor() {
  const [, force] = useState(0);
  useEffect(() => {
    const f = () => force((x) => x + 1);
    evSubscribers.push(f);
    return () => { evSubscribers = evSubscribers.filter((x) => x !== f); };
  }, []);
  const last = EVLOG.slice(-7);
  if (!last.length) return null;
  return (
    <div style={{ position:"absolute", right:12, bottom:10, zIndex:30, width:330, maxWidth:"44vw", background:"rgba(8,11,15,0.72)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:12, padding:"8px 10px", pointerEvents:"none", backdropFilter:"blur(10px)" }}>
      {last.map((e, i) => (
        <p key={`${e.t}-${i}`} style={{ margin:0, fontSize:"0.6rem", lineHeight:1.5, fontFamily:"monospace", color: e.tag === "error" || e.tag === "promise" ? "#F17464" : "rgba(248,246,242,0.55)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
          {new Date(e.t).toLocaleTimeString("es-AR", { hour12: false })} <b style={{ color: e.tag === "error" ? "#F17464" : C.sage }}>{e.tag}</b> {e.msg}
        </p>
      ))}
    </div>
  );
}

/* ─── Carga de MediaPipe ─────────────────── */
const MP_SCRIPTS = [
  "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3/camera_utils.js",
  "https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/pose.js",
];

let mediaPipePromise: Promise<void> | null = null;

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") resolve();
      else existing.addEventListener("load", () => resolve(), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.crossOrigin = "anonymous";
    script.async = true;
    script.dataset.loaded = "false";
    script.onload = () => { script.dataset.loaded = "true"; resolve(); };
    script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    document.head.appendChild(script);
  });
}

function loadMediaPipe() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Pose && window.Camera) return Promise.resolve();
  mediaPipePromise ??= MP_SCRIPTS.reduce(
    (chain, src) => chain.then(() => loadScript(src)),
    Promise.resolve()
  ).then(() => {
    if (!window.Pose || !window.Camera) throw new Error("MediaPipe no quedó disponible");
  });
  return mediaPipePromise;
}

const LM = {
  NOSE: 0,
  L_SHOULDER: 11, R_SHOULDER: 12,
  L_ELBOW: 13, R_ELBOW: 14,
  L_WRIST: 15, R_WRIST: 16,
  L_HIP: 23, R_HIP: 24,
  L_KNEE: 25, R_KNEE: 26,
  L_ANKLE: 27, R_ANKLE: 28,
} as const;

// Esqueleto COMPLETO de BlazePose: 33 landmarks (cara, torso, manos y pies).
const FULL_CONNECTIONS: Array<[number, number]> = [
  // cara
  [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8], [9, 10],
  // torso
  [11, 12], [11, 23], [12, 24], [23, 24],
  // brazo izquierdo + mano
  [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
  // brazo derecho + mano
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
  // pierna izquierda + pie
  [23, 25], [25, 27], [27, 29], [29, 31], [27, 31],
  // pierna derecha + pie
  [24, 26], [26, 28], [28, 30], [30, 32], [28, 32],
];

const CORE_POINTS = new Set<number>([11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]);
const isDetailPoint = (i: number) => !CORE_POINTS.has(i) && i !== LM.NOSE;

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }
function avg(nums: number[]) { return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0; }
function visOk(lm?: Landmark, threshold = 0.42) { return !!lm && (lm.visibility ?? 1) >= threshold; }

function angle(a: Landmark, b: Landmark, c: Landmark) {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const mag = Math.hypot(ab.x, ab.y) * Math.hypot(cb.x, cb.y);
  if (!mag) return 0;
  return Math.acos(clamp(dot / mag, -1, 1)) * (180 / Math.PI);
}

// Umbral bajo a propósito: con luz tenue MediaPipe reporta visibilidades ~0.3
// aun con el cuerpo entero en cuadro. El gate fino lo hace poseQuality.
function essentialVisible(lms: Landmark[]) {
  return [LM.L_SHOULDER, LM.R_SHOULDER, LM.L_HIP, LM.R_HIP].every((i) => visOk(lms[i], 0.22));
}

// Confianza de detección 0-100: promedio de visibilidad de hombros, cadera y rodillas.
function poseQuality(lms: Landmark[] | null) {
  if (!lms) return 0;
  const pts = [LM.L_SHOULDER, LM.R_SHOULDER, LM.L_HIP, LM.R_HIP, LM.L_KNEE, LM.R_KNEE];
  return Math.round(clamp(avg(pts.map((i) => lms[i]?.visibility ?? 0)) * 100, 0, 100));
}

// Gate tolerante: si el modelo devuelve un esqueleto coherente, hay un cuerpo.
function bodyPresent(lms: Landmark[] | null): lms is Landmark[] {
  if (!lms || lms.length < 33) return false;
  return essentialVisible(lms) || poseQuality(lms) >= 28;
}

function analyzePose(lms: Landmark[] | null, testId: MovementTest["id"]): PoseAnalysis {
  if (!bodyPresent(lms)) {
    return { detected: false, score: 0, feedback: "Posicionate frente a la cámara", detail: "Necesitamos ver hombros y cadera" };
  }

  const ls = lms[LM.L_SHOULDER], rs = lms[LM.R_SHOULDER];
  const lh = lms[LM.L_HIP], rh = lms[LM.R_HIP];
  const shoulderMid = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };
  const hipMid = { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2 };
  const shoulderTilt = Math.abs(ls.y - rs.y);
  const hipTilt = Math.abs(lh.y - rh.y);
  const centerOffset = Math.abs(shoulderMid.x - hipMid.x);

  if (testId === "posture") {
    const raw = 100 - shoulderTilt * 560 - hipTilt * 480 - centerOffset * 260;
    const score = Math.round(clamp(raw, 35, 100));
    const feedback = shoulderTilt > 0.04 ? "Nivelá hombros" : centerOffset > 0.045 ? "Alineá torso y cadera" : "Postura estable detectada";
    return { detected: true, score, feedback, detail: `Alineación ${score}%` };
  }

  if (testId === "arms") {
    const lw = lms[LM.L_WRIST], rw = lms[LM.R_WRIST];
    const le = lms[LM.L_ELBOW], re = lms[LM.R_ELBOW];
    if (![lw, rw, le, re].every((lm) => visOk(lm, 0.3))) {
      return { detected: true, score: 45, feedback: "Mostrá manos y codos", detail: "Levantá ambos brazos dentro del encuadre" };
    }
    const leftLift = ls.y - lw.y;
    const rightLift = rs.y - rw.y;
    const liftScore = clamp(((leftLift + rightLift) / 2 + 0.03) / 0.34, 0, 1);
    const asymmetry = Math.abs(leftLift - rightLift);
    const leftElbow = angle(ls, le, lw);
    const rightElbow = angle(rs, re, rw);
    const elbowExtension = clamp((avg([leftElbow, rightElbow]) - 95) / 75, 0, 1);
    const score = Math.round(clamp(38 + liftScore * 48 + elbowExtension * 18 - asymmetry * 70, 25, 100));
    const feedback = liftScore > 0.75 ? "Buen rango sobre cabeza" : asymmetry > 0.10 ? "Un brazo sube menos" : "Subí las manos un poco más";
    return { detected: true, score, feedback, detail: `Rango hombros ${score}%` };
  }

  const lk = lms[LM.L_KNEE], rk = lms[LM.R_KNEE], la = lms[LM.L_ANKLE], ra = lms[LM.R_ANKLE];
  if (![lk, rk].every((lm) => visOk(lm, 0.3))) {
    return { detected: true, score: 45, feedback: "Necesitamos ver tus rodillas", detail: "Alejate un poco de la cámara" };
  }
  const leftLift = lh.y - lk.y;
  const rightLift = rh.y - rk.y;
  const kneeLift = Math.max(leftLift, rightLift);
  const feetVisible = visOk(la, 0.28) || visOk(ra, 0.28);
  const liftScore = clamp((kneeLift + 0.04) / 0.20, 0, 1);
  const verticalControl = 1 - clamp((shoulderTilt + hipTilt) / 0.12, 0, 1);
  const score = Math.round(clamp(42 + liftScore * 42 + verticalControl * 18 + (feetVisible ? 0 : -6), 25, 100));
  const feedback = liftScore > 0.55 ? "Equilibrio detectado, sostené" : "Levantá una rodilla y sostené";
  return { detected: true, score, feedback, detail: `Control ${score}%` };
}

/* ─── Validación de movimiento real ──────── */
// Un frame solo cuenta para la medición si el usuario está HACIENDO el
// movimiento pedido — sin esto, caminar frente a la cámara "aprueba" el test.
function armsRaised(lms: Landmark[]) {
  const lw = lms[LM.L_WRIST], rw = lms[LM.R_WRIST], ls = lms[LM.L_SHOULDER], rs = lms[LM.R_SHOULDER];
  if (!lw || !rw || !ls || !rs) return false;
  return lw.y < ls.y - 0.02 && rw.y < rs.y - 0.02; // ambas muñecas por encima de los hombros
}

function kneeRaised(lms: Landmark[]) {
  const lh = lms[LM.L_HIP], rh = lms[LM.R_HIP], lk = lms[LM.L_KNEE], rk = lms[LM.R_KNEE];
  if (!lh || !rh || !lk || !rk) return false;
  return Math.max(lh.y - lk.y, rh.y - rk.y) > -0.06;
}

function shoulderMidpoint(lms: Landmark[]) {
  const ls = lms[LM.L_SHOULDER], rs = lms[LM.R_SHOULDER];
  return { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };
}

/* ─── Canvas / dibujo del esqueleto ──────── */
function resizeCanvas(canvas: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.round((canvas.clientWidth || 1) * dpr);
  const h = Math.round((canvas.clientHeight || 1) * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
}

function coverMapper(canvas: HTMLCanvasElement, video: HTMLVideoElement) {
  const vw = video.videoWidth || 1280;
  const vh = video.videoHeight || 720;
  const scale = Math.max(canvas.width / vw, canvas.height / vh);
  const dw = vw * scale, dh = vh * scale;
  const ox = (canvas.width - dw) / 2, oy = (canvas.height - dh) / 2;
  return (lm: Landmark) => ({ x: ox + lm.x * dw, y: oy + lm.y * dh });
}

function drawPose(canvas: HTMLCanvasElement, video: HTMLVideoElement, lms: Landmark[] | null, quality = 80) {
  resizeCanvas(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!lms) return;

  const good = quality >= 68;
  const color = good ? "#AFC3A5" : quality >= 48 ? "#F0C36A" : "#F17464";
  const dim = good ? "rgba(175,195,165,0.28)" : "rgba(241,116,100,0.25)";
  const toCanvas = coverMapper(canvas, video);
  const u = clamp(Math.max(canvas.width, canvas.height) / 1400, 0.6, 2.4);

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = color;
  ctx.shadowBlur = 14 * u;

  const DRAW_VIS = 0.15;
  for (const [a, b] of FULL_CONNECTIONS) {
    const la = lms[a], lb = lms[b];
    if (!la || !lb || !visOk(la, DRAW_VIS) || !visOk(lb, DRAW_VIS)) continue;
    const pa = toCanvas(la), pb = toCanvas(lb);
    const detail = isDetailPoint(a) && isDetailPoint(b);
    ctx.beginPath();
    ctx.strokeStyle = detail ? dim : color;
    ctx.lineWidth = (detail ? 2.5 : 5) * u;
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();
  }

  for (let i = 0; i < lms.length; i++) {
    const lm = lms[i];
    if (!lm || !visOk(lm, DRAW_VIS)) continue;
    const p = toCanvas(lm);
    ctx.beginPath();
    ctx.fillStyle = isDetailPoint(i) ? dim : color;
    ctx.arc(p.x, p.y, (i === LM.NOSE ? 7 : isDetailPoint(i) ? 3 : 6) * u, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/* ─── Runtime de pose (se crea UNA vez por journey) ─ */
async function startPoseTracking({
  video,
  canvas,
  onStatus,
  onResults,
}: {
  video: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  onStatus?: (status: string) => void;
  onResults: (landmarks: Landmark[] | null, quality: number) => void;
}): Promise<PoseRuntime> {
  onStatus?.("Cargando modelo biomecánico…");
  await loadMediaPipe();

  const Pose = window.Pose!;
  const Camera = window.Camera!;
  let stopped = false;

  const pose = new Pose({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}` });
  pose.setOptions({
    modelComplexity: 2, // máxima precisión de landmarks (desktop lo banca)
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.4,
    minTrackingConfidence: 0.4,
  });

  pose.onResults((results) => {
    if (stopped) return;
    const lms = results.poseLandmarks ?? null;
    const quality = poseQuality(lms);
    drawPose(canvas, video, lms, quality);
    onResults(lms, quality);
  });

  const camera = new Camera(video, {
    onFrame: async () => {
      if (stopped) return;
      resizeCanvas(canvas);
      await pose.send({ image: video });
    },
    width: 1280,
    height: 720,
    facingMode: "user",
  });

  onStatus?.("Solicitando permiso de cámara…");
  await camera.start();
  onStatus?.("Cámara activa · buscando cuerpo…");
  logEvent("camara", "stream iniciado");

  return {
    stop: () => {
      stopped = true;
      logEvent("camara", "stream detenido");
      try { camera.stop(); } catch {}
      try { pose.close(); } catch {}
      const stream = video.srcObject as MediaStream | null;
      stream?.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    },
  };
}

/* ─── Voz (guía conversacional) ──────────── */
const speechState = { lastKey: "", lastAt: 0 };

function warmVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener?.("voiceschanged", () => {}, { once: true });
}

// Devuelve una Promise que se resuelve cuando la locución TERMINA de decirse.
function speak(text: string, opts: { key?: string; minGap?: number } = {}): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve();
    const synth = window.speechSynthesis;
    if (!synth) return resolve();
    const key = opts.key ?? text;
    const now = Date.now();
    if (key === speechState.lastKey && now - speechState.lastAt < (opts.minGap ?? 6000)) return resolve();
    speechState.lastKey = key;
    speechState.lastAt = now;
    synth.cancel();
    logEvent("voz", text.slice(0, 64));
    const u = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    const v =
      voices.find((x) => x.lang?.toLowerCase().startsWith("es-ar")) ||
      voices.find((x) => x.lang?.toLowerCase().startsWith("es-419")) ||
      voices.find((x) => x.lang?.toLowerCase().startsWith("es"));
    if (v) u.voice = v;
    u.lang = v?.lang || "es-AR";
    u.rate = 1.04;

    let done = false;
    const finish = () => { if (!done) { done = true; resolve(); } };
    u.onend = finish;
    u.onerror = finish;
    setTimeout(finish, Math.max(1800, text.length * 105));
    synth.speak(u);
  });
}

function stopSpeaking() {
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
}

/* ─── Reconocimiento de voz (órdenes del usuario) ── */
const ADVANCE_WORDS = ["listo", "lista", "avanzar", "avanza", "continuar", "continua", "seguir", "empezar", "empeza", "dale", "vamos", "ya estoy"];

function matchesAdvance(text: string) {
  const t = text.toLowerCase();
  return ADVANCE_WORDS.some((w) => t.includes(w));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionCtor = new () => any;

function useVoiceCommands(enabled: boolean, onAdvance: () => void) {
  const cbRef = useRef(onAdvance);
  useEffect(() => { cbRef.current = onAdvance; }, [onAdvance]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const w = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;

    let alive = true;
    const rec = new Ctor();
    rec.lang = "es-AR";
    rec.continuous = true;
    rec.interimResults = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      if (window.speechSynthesis?.speaking) return; // no escucharse a sí misma
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const text: string = e.results[i]?.[0]?.transcript ?? "";
        if (matchesAdvance(text)) {
          logEvent("mic", `orden reconocida: "${text.trim().slice(0, 40)}"`);
          cbRef.current();
          break;
        }
      }
    };
    rec.onend = () => { if (alive) { try { rec.start(); } catch {} } };
    rec.onerror = () => {};
    try { rec.start(); } catch {}
    return () => {
      alive = false;
      try { rec.onend = null; rec.stop(); } catch {}
    };
  }, [enabled]);
}

/* ─── Countdown sin efectos dentro del updater ── */
// El onDone se dispara desde un efecto que observa remaining===0 — NUNCA desde
// adentro del updater de setState (React lo ejecuta dos veces en dev y eso
// hacía avanzar dos pruebas por cada fin de conteo).
function useCountdown(from: number, active: boolean, onDone: () => void) {
  const [remaining, setRemaining] = useState(from);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const firedRef = useRef(false);
  const onDoneRef = useRef(onDone);
  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);

  useEffect(() => {
    firedRef.current = false;
    if (!active) { setRemaining(from); return; }
    setRemaining(from);
    intervalRef.current = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [active, from]);

  useEffect(() => {
    if (active && remaining === 0 && !firedRef.current) {
      firedRef.current = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      onDoneRef.current();
    }
  }, [remaining, active]);

  return remaining;
}

/* ─── Score generation from real pose samples ─ */
function movementAgeFromScores(age: number, scores: number[]): number {
  const biomechScore = scores.length ? avg(scores) : 58;
  const offset = Math.round((72 - biomechScore) * 0.58);
  return Math.round(clamp(age + offset, 22, 75));
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
        style={{ fontSize:"1.1rem", color:"rgba(248,246,242,0.6)", lineHeight:1.7, fontWeight:300, maxWidth:440 }}>
        8 de cada 10 personas descubren que su cuerpo se mueve de forma diferente a su edad real. Averiguá el tuyo en 4 minutos.
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
        {["Sin registro previo","Solo tu cámara","Resultado inmediato"].map(t => (
          <span key={t} style={{ display:"flex", alignItems:"center", gap:6, fontSize:"0.8rem", color:"rgba(248,246,242,0.4)", fontWeight:500 }}>
            <span style={{ color:C.sage }}>✓</span>{t}
          </span>
        ))}
      </motion.div>
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
  const [detected, setDetected] = useState(false);
  const [partial, setPartial] = useState(false);
  const [quality, setQuality] = useState(0);

  const forceAdvance = useCallback((phrase: string) => {
    if (advancedRef.current) return;
    advancedRef.current = true;
    logEvent("fase", "cámara → pruebas");
    // Espera a que la frase termine antes de cambiar de paso (no se pisa).
    speak(phrase, { key: "cam-advance", minGap: 0 }).then(() => onNext());
  }, [onNext]);

  useVoiceCommands(cameraState === "on", () => forceAdvance("Dale, seguimos."));

  useEffect(() => {
    if (cameraState !== "on") return;
    setPoseHandler((landmarks, poseConfidence) => {
      const ok = bodyPresent(landmarks);
      setDetected(ok);
      setPartial(!!landmarks && !ok);
      setQuality(poseConfidence);
      if (ok) detectedFrames.current += 1;
      else detectedFrames.current = 0;
      if (landmarks) presentFrames.current += 1;

      if (detectedFrames.current === 1) logEvent("pose", `cuerpo detectado (vis ${poseConfidence}%)`);

      if (!ok && landmarks) {
        speak("Casi. Necesito ver tus hombros y tu cadera. Si no avanzo, decime: listo.", { key: "cam-partial", minGap: 10000 });
      }
      if (!landmarks && presentFrames.current === 0) {
        speak("No logro verte. Prendé una luz de frente y ponete a dos o tres metros.", { key: "cam-nobody", minGap: 12000 });
      }

      if (detectedFrames.current > 20) {
        forceAdvance("¡Te veo! Arrancamos con la primera prueba.");
      }
      if (presentFrames.current > 200) {
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

      <div style={{ position:"absolute", top:74, left:20, right:20, display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16 }}>
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
        <div style={{ position:"absolute", left:24, right:24, bottom:60, display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
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
  onComplete: (scores: number[]) => void;
}) {
  const phaseRef = useRef<MovPhase>("intro");
  const currentIdRef = useRef<MovementTest["id"]>("posture");
  const samplesRef = useRef<number[]>([]);
  const collectedScoresRef = useRef<number[]>([]);
  const stableRef = useRef(0);
  const introAtRef = useRef(0);
  const attemptRef = useRef(0);
  const prevMidRef = useRef<{ x: number; y: number } | null>(null);
  const introReadyRef = useRef(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState<MovPhase>("intro");
  const [prepLeft, setPrepLeft] = useState(3);
  const [detected, setDetected] = useState(false);
  const [liveScore, setLiveScore] = useState(0);
  const [feedback, setFeedback] = useState("Posicionate frente a la cámara");

  // Clamp defensivo: currentIdx jamás debe indexar fuera del array.
  const current = MOVEMENTS[Math.min(currentIdx, MOVEMENTS.length - 1)];

  useEffect(() => { phaseRef.current = phase; logEvent("fase", `prueba ${currentIdx + 1} · ${phase}`); }, [phase, currentIdx]);

  // Cada prueba se anuncia por voz y arranca sola cuando el cuerpo está
  // estable Y la consigna terminó de decirse.
  useEffect(() => {
    currentIdRef.current = current.id;
    samplesRef.current = [];
    stableRef.current = 0;
    attemptRef.current = 0;
    introReadyRef.current = false;
    introAtRef.current = Date.now();
    speak(`Prueba ${currentIdx + 1}. ${current.title}. ${current.instruction}`, { key: `mov-${currentIdx}`, minGap: 0 })
      .then(() => {
        introReadyRef.current = true;
        introAtRef.current = Date.now();
      });
  }, [current.id, current.title, current.instruction, currentIdx]);

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
        samplesRef.current = [];
        setPhase("counting");
      } else {
        setPrepLeft(n);
        speak(n === 2 ? "Dos" : "Uno", { key: `prep-${currentIdx}-${n}`, minGap: 0 });
      }
    }, 1000);
    return () => clearInterval(t);
  }, [phase, currentIdx]);

  // Orden por voz para destrabar la intro.
  useVoiceCommands(phase === "intro", () => setPhase("prep"));

  // Red de seguridad de la intro.
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

  // Suscripción al feed de pose compartido.
  useEffect(() => {
    setPoseHandler((landmarks) => {
      const analysis = analyzePose(landmarks, currentIdRef.current);
      setDetected(analysis.detected);
      setLiveScore(analysis.score);
      setFeedback(analysis.feedback);

      // Un frame cuenta solo si el movimiento pedido está pasando.
      let doingIt = analysis.detected;
      if (doingIt && landmarks) {
        const id = currentIdRef.current;
        if (id === "arms") doingIt = armsRaised(landmarks);
        else if (id === "balance") doingIt = kneeRaised(landmarks);
        else if (id === "posture") {
          const mid = shoulderMidpoint(landmarks);
          const prev = prevMidRef.current;
          const motion = prev ? Math.hypot(mid.x - prev.x, mid.y - prev.y) : 1;
          prevMidRef.current = mid;
          doingIt = motion < 0.012;
        }
      }
      if (phaseRef.current === "counting" && doingIt && analysis.score > 0) {
        samplesRef.current.push(analysis.score);
      }

      // Arranque manos libres: consigna terminada + 1s de aire + cuerpo estable.
      if (phaseRef.current === "intro") {
        if (introReadyRef.current && analysis.detected && Date.now() - introAtRef.current > 1000) {
          stableRef.current += 1;
          if (stableRef.current > 20) {
            stableRef.current = 0;
            setPhase("prep");
          }
        } else if (!analysis.detected) {
          stableRef.current = 0;
        }
      }
    });
    return () => setPoseHandler(null);
  }, [setPoseHandler]);

  const MIN_VALID_FRAMES = 15; // ~1 segundo de movimiento real detectado

  const handleMoveDone = useCallback(() => {
    const validSamples = samplesRef.current;
    logEvent("test", `fin prueba ${currentIdx + 1}: ${validSamples.length} frames válidos`);

    if (validSamples.length < MIN_VALID_FRAMES && attemptRef.current < 2) {
      attemptRef.current += 1;
      samplesRef.current = [];
      stableRef.current = 0;
      introReadyRef.current = false;
      introAtRef.current = Date.now();
      setPhase("intro");
      logEvent("test", `reintento ${attemptRef.current} de prueba ${currentIdx + 1}`);
      speak(`No llegué a ver el movimiento. Va de nuevo. ${current.instruction}`, { key: `retry-${currentIdx}-${attemptRef.current}`, minGap: 0 })
        .then(() => {
          introReadyRef.current = true;
          introAtRef.current = Date.now();
        });
      return;
    }

    const measured = validSamples.length >= MIN_VALID_FRAMES
      ? Math.round(avg(validSamples))
      : 40; // tras 2 reintentos sin señal: score honesto bajo, no inventado

    if (validSamples.length < MIN_VALID_FRAMES) {
      speak("No pude medir bien esta prueba. Seguimos con la próxima.", { key: `skip-${currentIdx}`, minGap: 0 });
    }
    collectedScoresRef.current.push(measured);
    samplesRef.current = [];
    logEvent("test", `score prueba ${currentIdx + 1}: ${measured}%`);

    if (currentIdx < MOVEMENTS.length - 1) {
      if (validSamples.length >= MIN_VALID_FRAMES) {
        speak("¡Muy bien! Vamos con la siguiente.", { key: `done-${currentIdx}`, minGap: 0 });
      }
      setPhase("intro");
      setCurrentIdx((i) => Math.min(i + 1, MOVEMENTS.length - 1));
    } else {
      speak("¡Excelente! Terminamos. Estoy analizando tus movimientos.", { key: "done-all", minGap: 0 });
      setPhase("done");
      onComplete(collectedScoresRef.current);
    }
  }, [currentIdx, current.instruction, onComplete]);

  const timer = useCountdown(current.duration, phase === "counting", handleMoveDone);
  const progress = phase === "counting" ? ((current.duration - timer) / current.duration) * 100 : 0;

  // Coaching en vivo a mitad de prueba si no hay señal del movimiento.
  useEffect(() => {
    if (phase !== "counting") return;
    if (timer === Math.ceil(current.duration / 2) && samplesRef.current.length < 5) {
      speak(MOVEMENT_CUES[current.id], { key: `cue-${currentIdx}-${attemptRef.current}`, minGap: 0 });
    }
  }, [timer, phase, current.duration, current.id, currentIdx]);

  return (
    <motion.div key="movement" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:"absolute", inset:0, pointerEvents:"none" }}>

      {/* Barra superior: qué prueba es + señal en vivo */}
      <div style={{ position:"absolute", top:74, left:20, right:20, display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:14 }}>
        <div style={{ background:"rgba(8,11,15,0.62)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:22, padding:"14px 22px", backdropFilter:"blur(14px)" }}>
          <p style={{ color:C.sage, fontWeight:900, letterSpacing:"0.14em", fontSize:"0.72rem", textTransform:"uppercase", marginBottom:6 }}>
            Prueba {currentIdx + 1} de {MOVEMENTS.length}
          </p>
          <p style={{ color:"#F8F6F2", fontWeight:900, fontSize:"clamp(1.3rem,3vw,2.2rem)", letterSpacing:"-0.02em", lineHeight:1 }}>
            {current.emoji} {current.title}
          </p>
        </div>
        <div style={{ background:"rgba(8,11,15,0.62)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:22, padding:"14px 22px", textAlign:"right", backdropFilter:"blur(14px)" }}>
          <p style={{ color:"rgba(248,246,242,0.4)", fontWeight:900, letterSpacing:"0.14em", fontSize:"0.62rem", textTransform:"uppercase", marginBottom:6 }}>Señal</p>
          <p style={{ color: liveScore >= 70 ? "#AFC3A5" : liveScore >= 50 ? "#F0C36A" : "#F17464", fontWeight:900, fontSize:"clamp(2rem,4.5vw,3.4rem)", lineHeight:1 }}>
            {Math.round(liveScore)}<span style={{ fontSize:"1rem", color:"rgba(248,246,242,0.4)" }}>%</span>
          </p>
        </div>
      </div>

      {/* INTRO: consigna gigante en el centro */}
      {phase === "intro" && (
        <div style={{ position:"absolute", left:0, right:0, top:"50%", transform:"translateY(-50%)", display:"flex", justifyContent:"center", padding:"0 24px" }}>
          <div style={{ textAlign:"center", textShadow:"0 8px 40px rgba(0,0,0,0.75)" }}>
            <p style={{ fontSize:"clamp(3rem,8vw,5.5rem)", lineHeight:1, marginBottom:16 }}>{current.emoji}</p>
            <p style={{ color:"#F8F6F2", fontSize:"clamp(1.9rem,4.8vw,3.6rem)", fontWeight:900, letterSpacing:"-0.02em", lineHeight:1.2, maxWidth:900 }}>
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

      {/* COUNTING: timer gigante centrado */}
      {phase === "counting" && (
        <div style={{ position:"absolute", left:0, right:0, top:"46%", transform:"translateY(-50%)", display:"flex", justifyContent:"center" }}>
          <p style={{ fontSize:"clamp(7rem,24vw,16rem)", fontWeight:900, fontFamily:"monospace", color:"rgba(248,246,242,0.55)", lineHeight:1, textShadow:"0 8px 50px rgba(0,0,0,0.6)" }}>
            {timer}
          </p>
        </div>
      )}

      {/* Abajo: feedback del trainer GIGANTE + barra + progreso */}
      <div style={{ position:"absolute", left:20, right:20, bottom:40, display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
        <div style={{ maxWidth:1000, background:"rgba(8,11,15,0.70)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:28, padding:"18px 34px", textAlign:"center", backdropFilter:"blur(16px)" }}>
          <p style={{ color:"#F8F6F2", fontWeight:800, fontSize:"clamp(1.4rem,3.4vw,2.4rem)", lineHeight:1.3, letterSpacing:"-0.01em" }}>
            {feedback}
          </p>
        </div>
        <div style={{ width:"min(560px, 78vw)", height:6, borderRadius:999, background:"rgba(255,255,255,0.14)", overflow:"hidden" }}>
          <motion.div animate={{ width: phase === "counting" ? `${progress}%` : `${liveScore}%` }} transition={{ duration:0.25 }}
            style={{ height:"100%", borderRadius:999, background: liveScore >= 70 ? C.sage : liveScore >= 50 ? "#F0C36A" : C.red }} />
        </div>
        <ProgressDots current={currentIdx} total={MOVEMENTS.length} />
      </div>
    </motion.div>
  );
}

/* ─── STEP: CALCULATING ───────────────── */
function StepCalculating({ onDone }: { onDone: () => void }) {
  const steps = [
    "Procesando patrones de movimiento...",
    "Calibrando modelo biomecánico...",
    "Comparando con perfiles de referencia...",
    "Generando tu Edad de Movimiento...",
  ];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx(i => (i >= steps.length - 1 ? i : i + 1));
    }, 700);
    return () => clearInterval(t);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (idx >= steps.length - 1) {
      const t = setTimeout(onDone, 1300);
      return () => clearTimeout(t);
    }
  }, [idx]); // eslint-disable-line

  return (
    <motion.div key="calculating" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:32, textAlign:"center", padding:"0 24px" }}>

      <div style={{ position:"relative", width:120, height:120 }}>
        {[0,1,2].map(i => (
          <motion.div key={i}
            animate={{ scale:[1,1.3,1], opacity:[0.6,0.15,0.6] }}
            transition={{ duration:2, repeat:Infinity, delay:i*0.5, ease:"easeInOut" }}
            style={{ position:"absolute", inset:0, borderRadius:"50%", border:`2px solid ${C.sage}`, margin: i*(-16) }}
          />
        ))}
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2.5rem" }}>🧬</div>
      </div>

      <div>
        <h2 style={{ fontSize:"1.6rem", fontWeight:800, color:"#F8F6F2", marginBottom:16, letterSpacing:"-0.02em" }}>Calculando tu resultado</h2>
        <AnimatePresence mode="wait">
          <motion.p key={idx} initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-8 }}
            transition={{ duration:0.3 }}
            style={{ color:"rgba(248,246,242,0.5)", fontSize:"0.9rem", fontWeight:300 }}>
            {steps[idx]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div style={{ display:"flex", gap:6 }}>
        {steps.map((_,i) => (
          <div key={i} style={{ width:6, height:6, borderRadius:"50%", background: i<=idx ? C.sage : "rgba(255,255,255,0.15)", transition:"all 0.3s" }} />
        ))}
      </div>
    </motion.div>
  );
}

/* ─── STEP: REVEAL ───────────────────── */
function StepReveal({ movementAge, chronoAge, onNext }: { movementAge: number; chronoAge: number; onNext: () => void }) {
  const diff = movementAge - chronoAge;
  const isYounger = diff < 0;
  const isEqual = Math.abs(diff) <= 1;
  const color = isYounger ? "#4ade80" : isEqual ? C.sage : C.red;

  useEffect(() => {
    const diffPhrase = isYounger
      ? `Tu cuerpo se mueve ${Math.abs(diff)} años más joven que tu edad real. ¡Felicitaciones!`
      : isEqual
      ? "Tu movimiento está alineado con tu edad."
      : `Tu cuerpo se mueve ${diff} años más viejo que tu edad real. Ese es tu punto de partida, y se puede mejorar.`;
    speak(`Tu edad de movimiento es ${movementAge} años. ${diffPhrase}`, { key: "reveal", minGap: 0 });
  }, []); // eslint-disable-line

  return (
    <motion.div key="reveal" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:28, textAlign:"center", padding:"0 24px" }}>

      <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.2 }}
        style={{ fontSize:"0.75rem", fontWeight:700, color:C.sage, letterSpacing:"0.2em", textTransform:"uppercase" }}>
        Tu resultado
      </motion.div>

      <motion.div initial={{ opacity:0,scale:0.8 }} animate={{ opacity:1,scale:1 }}
        transition={{ delay:0.4, ease:[0.16,1,0.3,1], duration:0.8 }}>
        <p style={{ fontSize:"0.85rem", color:"rgba(248,246,242,0.5)", marginBottom:4, fontWeight:500 }}>Edad de Movimiento</p>
        <motion.p
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }}
          style={{ fontSize:"clamp(5rem,15vw,8rem)", fontWeight:900, color:"#F8F6F2", lineHeight:0.9, letterSpacing:"-0.05em", filter:`drop-shadow(0 0 40px ${color}60)` }}>
          {movementAge}
        </motion.p>
        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.9 }}
          style={{ fontSize:"0.9rem", color:color, fontWeight:700, marginTop:8 }}>
          {isYounger ? `Tu cuerpo se mueve ${Math.abs(diff)} años más JOVEN que tu edad real. 🎉`
            : isEqual ? "Tu movimiento está exactamente alineado con tu edad."
            : `Tu cuerpo se mueve ${diff} años más viejo de lo que sos.`}
        </motion.p>
      </motion.div>

      <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:1.1 }}
        style={{ display:"flex", gap:32, padding:"20px 32px", background:"rgba(8,11,15,0.5)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, backdropFilter:"blur(10px)" }}>
        <div style={{ textAlign:"center" }}>
          <p style={{ fontSize:"2rem", fontWeight:900, color:"rgba(248,246,242,0.3)", lineHeight:1 }}>{chronoAge}</p>
          <p style={{ fontSize:"0.7rem", color:"rgba(248,246,242,0.35)", textTransform:"uppercase", letterSpacing:"0.1em", marginTop:4 }}>Edad real</p>
        </div>
        <div style={{ width:1, background:"rgba(255,255,255,0.1)" }} />
        <div style={{ textAlign:"center" }}>
          <p style={{ fontSize:"2rem", fontWeight:900, color, lineHeight:1 }}>{movementAge}</p>
          <p style={{ fontSize:"0.7rem", color:"rgba(248,246,242,0.35)", textTransform:"uppercase", letterSpacing:"0.1em", marginTop:4 }}>Edad de mov.</p>
        </div>
      </motion.div>

      <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.3 }}
        style={{ fontSize:"0.95rem", color:"rgba(248,246,242,0.5)", lineHeight:1.7, maxWidth:380, fontWeight:300 }}>
        Este es tu punto de partida. Con práctica consistente, la mayoría reduce su Edad de Movimiento entre 3 y 9 años en 8 semanas.
      </motion.p>

      <motion.button initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:1.5 }}
        onClick={onNext}
        whileHover={{ scale:1.04, boxShadow:"0 20px 50px rgba(122,143,116,0.4)" }}
        whileTap={{ scale:0.97 }}
        style={{ background:C.sage, color:"#fff", fontWeight:700, fontSize:"1rem", padding:"16px 40px", borderRadius:999, border:"none", cursor:"pointer" }}>
        Guardar mi resultado →
      </motion.button>

      <motion.button initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.7 }}
        onClick={() => window.location.href = "/"}
        style={{ background:"transparent", border:"none", color:"rgba(248,246,242,0.3)", fontSize:"0.85rem", cursor:"pointer", fontWeight:500 }}>
        Volver al inicio
      </motion.button>
    </motion.div>
  );
}

/* ─── STEP: SAVE ──────────────────────── */
function StepSave({ movementAge }: { movementAge: number }) {
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  if (sent) {
    return (
      <motion.div initial={{ opacity:0,scale:0.95 }} animate={{ opacity:1,scale:1 }}
        style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:24, textAlign:"center", padding:"0 24px" }}>
        <motion.div animate={{ scale:[1,1.2,1] }} transition={{ duration:0.5 }}
          style={{ fontSize:"4rem" }}>🎉</motion.div>
        <h2 style={{ fontSize:"1.8rem", fontWeight:900, color:"#F8F6F2", letterSpacing:"-0.02em" }}>¡Listo!</h2>
        <p style={{ color:"rgba(248,246,242,0.55)", fontSize:"1rem", lineHeight:1.7, maxWidth:360, fontWeight:300 }}>
          Te enviamos tu resultado a <strong style={{ color:C.sage }}>{email}</strong>. En tu próxima sesión empezamos a reducir tu Edad de Movimiento.
        </p>
        <a href="/" style={{ background:C.sage, color:"#fff", fontWeight:700, fontSize:"1rem", padding:"14px 36px", borderRadius:999, textDecoration:"none" }}>
          Explorar CALISTENIA.bio →
        </a>
      </motion.div>
    );
  }

  return (
    <motion.div key="save" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:28, textAlign:"center", padding:"0 24px" }}>

      <div style={{ maxWidth:480 }}>
        <p style={{ fontSize:"0.75rem", color:C.sage, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:8 }}>Guardá tu resultado</p>
        <h2 style={{ fontSize:"clamp(1.8rem,4vw,2.4rem)", fontWeight:900, color:"#F8F6F2", lineHeight:0.95, letterSpacing:"-0.03em", marginBottom:12 }}>
          Tu Edad de Movimiento es <span style={{ color:C.sage }}>{movementAge}</span>
        </h2>
        <p style={{ color:"rgba(248,246,242,0.5)", fontSize:"0.95rem", lineHeight:1.65, fontWeight:300 }}>
          Dejanos tu email para guardar el resultado y recibir tu plan personalizado para reducir tu Edad de Movimiento.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ width:"min(480px, 92vw)", display:"flex", flexDirection:"column", gap:12 }}>
        <input type="number" placeholder="Tu edad cronológica" value={age} onChange={e => setAge(e.target.value)} required min={16} max={80}
          style={{ width:"100%", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"14px 18px", color:"#F8F6F2", fontSize:"1rem", outline:"none" }} />
        <input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required
          style={{ width:"100%", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"14px 18px", color:"#F8F6F2", fontSize:"1rem", outline:"none" }} />
        <motion.button type="submit" whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
          style={{ width:"100%", background:C.sage, color:"#fff", fontWeight:700, fontSize:"1rem", padding:"16px", borderRadius:12, border:"none", cursor:"pointer" }}>
          Guardar mi resultado →
        </motion.button>
      </form>

      <p style={{ fontSize:"0.75rem", color:"rgba(248,246,242,0.2)" }}>Sin spam. Podés darte de baja cuando quieras.</p>

      <button onClick={() => window.location.href = "/"}
        style={{ background:"transparent", border:"none", color:"rgba(248,246,242,0.3)", fontSize:"0.85rem", cursor:"pointer" }}>
        Omitir por ahora
      </button>
    </motion.div>
  );
}

/* ─── MAIN FLOW ───────────────────────── */
// Arquitectura de feed único: la cámara y el modelo de pose se crean UNA vez
// y viven a nivel del flow. Los pasos son overlays (slides) que se suscriben
// al stream de landmarks — la página nunca se recarga y la cámara nunca se
// apaga/prende entre pasos (adiós popup de Windows en medio del journey).
export function OnboardingFlow() {
  const [step, setStep] = useState<Step>("hook");
  const [movementAge, setMovementAge] = useState(0);
  const CHRONO_AGE = 40;

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
          setHud(`${EVAL_BUILD} · ${videoRef.current?.videoWidth ?? 0}×${videoRef.current?.videoHeight ?? 0} · ${lms?.length ?? 0} pts · vis ${(quality / 100).toFixed(2)}`);
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

  const handleMovementsComplete = useCallback((scores: number[]) => {
    logEvent("fase", `pruebas completas: [${scores.join(", ")}]`);
    setStep("calculating");
    const ma = movementAgeFromScores(CHRONO_AGE, scores);
    setTimeout(() => { setMovementAge(ma); }, 100);
  }, []);

  const stepIndex = ["hook","camera","movement","calculating","reveal","save"].indexOf(step);

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
      <div style={{ position:"absolute", top:0, left:0, right:0, zIndex:10, padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <a href="/" style={{ fontWeight:900, fontSize:"1.1rem", letterSpacing:"-0.03em", color:"#F8F6F2", textDecoration:"none" }}>
          CALISTENIA<span style={{ color:C.sage }}>.bio</span>
        </a>
        {step !== "hook" && step !== "reveal" && step !== "save" && (
          <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:"0.78rem", color:"rgba(248,246,242,0.35)", fontWeight:500 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:C.sage }} />
            {step === "camera" ? "Paso 1 de 3 — Cámara"
              : step === "movement" ? "Paso 2 de 3 — Evaluación"
              : step === "calculating" ? "Paso 3 de 3 — Analizando"
              : ""}
          </div>
        )}
        {step === "hook" && (
          <div style={{ fontSize:"0.75rem", color:"rgba(248,246,242,0.25)", fontWeight:500 }}>
            ~4 minutos · Sin registro
          </div>
        )}
      </div>

      {/* ── Slides encima del feed ── */}
      <div style={{ position:"absolute", inset:0, zIndex:5 }}>
        <AnimatePresence mode="wait">
          {step === "hook" && <StepHook key="hook" onNext={() => { logEvent("fase", "hook → cámara"); setStep("camera"); }} />}
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
            <StepCalculating key="calculating" onDone={() => { logEvent("fase", "→ reveal"); setStep("reveal"); }} />
          )}
          {step === "reveal" && (
            <StepReveal key="reveal" movementAge={movementAge} chronoAge={CHRONO_AGE} onNext={() => setStep("save")} />
          )}
          {step === "save" && <StepSave key="save" movementAge={movementAge} />}
        </AnimatePresence>
      </div>

      {/* HUD de diagnóstico + monitor de eventos */}
      {cameraState === "on" && (
        <div style={{ position:"absolute", left:16, bottom:10, zIndex:30, color:"rgba(248,246,242,0.38)", fontSize:"0.68rem", fontFamily:"monospace", pointerEvents:"none" }}>
          {hud}
        </div>
      )}
      <EventMonitor />

      {/* Bottom progress bar */}
      {step !== "hook" && (
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:"rgba(255,255,255,0.06)", zIndex:20 }}>
          <motion.div
            initial={{ width: `${(stepIndex/5)*100}%` }}
            animate={{ width: `${(stepIndex/5)*100}%` }}
            transition={{ duration:0.5 }}
            style={{ height:"100%", background:C.sage }} />
        </div>
      )}
    </div>
  );
}
