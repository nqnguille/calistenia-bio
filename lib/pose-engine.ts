// Motor de pose compartido: carga de MediaPipe, tracking con feed único,
// dibujo del esqueleto y motores de medición (conteo de repeticiones por
// ángulo articular, sostenes isométricos). Lo usan la evaluación y la sesión
// de entrenamiento guiada.
import { logEvent } from "./evlog";

export type Landmark = { x: number; y: number; z?: number; visibility?: number };
export type PoseRuntime = { stop: () => void };
export type PoseHandler = (landmarks: Landmark[] | null, quality: number) => void;

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

export function loadMediaPipe() {
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

/* ─── Landmarks y helpers ─────────────────── */
export const LM = {
  NOSE: 0,
  L_SHOULDER: 11, R_SHOULDER: 12,
  L_ELBOW: 13, R_ELBOW: 14,
  L_WRIST: 15, R_WRIST: 16,
  L_HIP: 23, R_HIP: 24,
  L_KNEE: 25, R_KNEE: 26,
  L_ANKLE: 27, R_ANKLE: 28,
} as const;

// Esqueleto COMPLETO de BlazePose: 33 landmarks (cara, torso, manos y pies).
export const FULL_CONNECTIONS: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8], [9, 10],
  [11, 12], [11, 23], [12, 24], [23, 24],
  [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
  [23, 25], [25, 27], [27, 29], [29, 31], [27, 31],
  [24, 26], [26, 28], [28, 30], [30, 32], [28, 32],
];

const CORE_POINTS = new Set<number>([11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]);
export const isDetailPoint = (i: number) => !CORE_POINTS.has(i) && i !== LM.NOSE;

export function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }
export function avg(nums: number[]) { return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0; }
export function visOk(lm?: Landmark, threshold = 0.42) { return !!lm && (lm.visibility ?? 1) >= threshold; }

export function angle(a: Landmark, b: Landmark, c: Landmark) {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const mag = Math.hypot(ab.x, ab.y) * Math.hypot(cb.x, cb.y);
  if (!mag) return 0;
  return Math.acos(clamp(dot / mag, -1, 1)) * (180 / Math.PI);
}

// Umbral bajo a propósito: con luz tenue MediaPipe reporta visibilidades ~0.3
// aun con el cuerpo entero en cuadro. El gate fino lo hace poseQuality.
export function essentialVisible(lms: Landmark[]) {
  return [LM.L_SHOULDER, LM.R_SHOULDER, LM.L_HIP, LM.R_HIP].every((i) => visOk(lms[i], 0.22));
}

// Confianza de detección 0-100: promedio de visibilidad de hombros, cadera y rodillas.
export function poseQuality(lms: Landmark[] | null) {
  if (!lms) return 0;
  const pts = [LM.L_SHOULDER, LM.R_SHOULDER, LM.L_HIP, LM.R_HIP, LM.L_KNEE, LM.R_KNEE];
  return Math.round(clamp(avg(pts.map((i) => lms[i]?.visibility ?? 0)) * 100, 0, 100));
}

// Un landmark "cuenta" solo si además de visibilidad está DENTRO del cuadro:
// MediaPipe devuelve siempre 33 puntos y alucina posiciones fuera de pantalla
// (ej. cara en primer plano → caderas inventadas debajo del encuadre).
function inFrame(lm?: Landmark, margin = 0.03) {
  return !!lm && lm.x > -margin && lm.x < 1 + margin && lm.y > -margin && lm.y < 1 + margin;
}

// Gate tolerante pero anti-primer-plano: esqueleto coherente + torso completo
// dentro del cuadro + extensión vertical real (una cara en primer plano tiene
// hombros y "caderas" apiladas sin distancia entre sí).
export function bodyPresent(lms: Landmark[] | null): lms is Landmark[] {
  if (!lms || lms.length < 33) return false;
  const ls = lms[LM.L_SHOULDER], rs = lms[LM.R_SHOULDER], lh = lms[LM.L_HIP], rh = lms[LM.R_HIP];
  const lk = lms[LM.L_KNEE], rk = lms[LM.R_KNEE];
  if (![ls, rs, lh, rh].every((p) => inFrame(p))) return false;
  if (!inFrame(lk, 0.08) && !inFrame(rk, 0.08)) return false;
  // Torso con extensión real (euclidiana: vale parado u horizontal en plancha):
  // con el cuerpo entero en cuadro, hombro→cadera mide ≥ ~14% de la imagen.
  // Una cara en primer plano tiene los puntos apilados y no llega.
  const torso = Math.hypot(
    avg([lh.x, rh.x]) - avg([ls.x, rs.x]),
    avg([lh.y, rh.y]) - avg([ls.y, rs.y])
  );
  if (torso < 0.14) return false;
  return essentialVisible(lms) || poseQuality(lms) >= 28;
}

export function shoulderMidpoint(lms: Landmark[]) {
  const ls = lms[LM.L_SHOULDER], rs = lms[LM.R_SHOULDER];
  return { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };
}

/* ─── Canvas / dibujo del esqueleto ──────── */
export function resizeCanvas(canvas: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.round((canvas.clientWidth || 1) * dpr);
  const h = Math.round((canvas.clientHeight || 1) * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
}

export function coverMapper(canvas: HTMLCanvasElement, video: HTMLVideoElement) {
  const vw = video.videoWidth || 1280;
  const vh = video.videoHeight || 720;
  const scale = Math.max(canvas.width / vw, canvas.height / vh);
  const dw = vw * scale, dh = vh * scale;
  const ox = (canvas.width - dw) / 2, oy = (canvas.height - dh) / 2;
  return (lm: Landmark) => ({ x: ox + lm.x * dw, y: oy + lm.y * dh });
}

export function drawPose(canvas: HTMLCanvasElement, video: HTMLVideoElement, lms: Landmark[] | null, quality = 80) {
  resizeCanvas(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!lms) return;

  const good = quality >= 68;
  const color = good ? "#00E5FF" : quality >= 48 ? "#FFB020" : "#FF5A5A";
  const dim = good ? "rgba(0,229,255,0.28)" : "rgba(255,90,90,0.25)";
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
export async function startPoseTracking({
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
  // En celular el modelo pesado no llega a buen framerate: bajamos a 1.
  const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
  pose.setOptions({
    modelComplexity: isMobile ? 1 : 2,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.4,
    minTrackingConfidence: 0.4,
  });
  logEvent("modelo", `complexity ${isMobile ? 1 : 2} (${isMobile ? "mobile" : "desktop"})`);

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

  // Wake Lock: que la pantalla del celu no se apague en medio de una serie.
  // Se re-adquiere al volver de background (el SO lo libera solo).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wakeLock: any = null;
  const acquireWakeLock = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      wakeLock = await (navigator as any).wakeLock?.request("screen");
      if (wakeLock) logEvent("camara", "wake lock activo");
    } catch { /* no soportado o denegado: seguimos igual */ }
  };
  const onVisible = () => { if (!stopped && document.visibilityState === "visible") acquireWakeLock(); };
  acquireWakeLock();
  document.addEventListener("visibilitychange", onVisible);

  return {
    stop: () => {
      stopped = true;
      logEvent("camara", "stream detenido");
      document.removeEventListener("visibilitychange", onVisible);
      try { wakeLock?.release(); } catch {}
      try { camera.stop(); } catch {}
      try { pose.close(); } catch {}
      const stream = video.srcObject as MediaStream | null;
      stream?.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    },
  };
}

/* ─── Motores de medición ──────────────────
   Todo se mide como CONTEO, TIEMPO o evento de umbral — nunca ángulos
   absolutos ni eje Z — que es donde MediaPipe es confiable. */

// Motor genérico de repeticiones por ciclo de ángulo articular.
export type RepPattern = "elbowFlex" | "kneeFlex" | "hipHinge";

export interface RepState { phase: "up" | "down" | "unknown"; reps: number; }
export const REP_INIT: RepState = { phase: "unknown", reps: 0 };

const REP_CONFIG: Record<RepPattern, {
  joints: Array<[number, number, number]>; // dos lados: [a, vértice, c]
  downBelow: number;
  upAbove: number;
}> = {
  // Flexión/extensión de codo: flexiones, dominadas, remo, fondos, pike, diamante…
  elbowFlex: {
    joints: [[LM.L_SHOULDER, LM.L_ELBOW, LM.L_WRIST], [LM.R_SHOULDER, LM.R_ELBOW, LM.R_WRIST]],
    downBelow: 100, upAbove: 155,
  },
  // Flexión/extensión de rodilla: sentadillas, zancadas, búlgaras, step-ups…
  kneeFlex: {
    joints: [[LM.L_HIP, LM.L_KNEE, LM.L_ANKLE], [LM.R_HIP, LM.R_KNEE, LM.R_ANKLE]],
    downBelow: 110, upAbove: 155,
  },
  // Bisagra de cadera: peso muerto rumano, puente de glúteos, elevación de piernas…
  hipHinge: {
    joints: [[LM.L_SHOULDER, LM.L_HIP, LM.L_KNEE], [LM.R_SHOULDER, LM.R_HIP, LM.R_KNEE]],
    downBelow: 125, upAbove: 160,
  },
};

export function stepReps(pattern: RepPattern, lms: Landmark[] | null, prev: RepState): RepState {
  if (!lms) return prev;
  const cfg = REP_CONFIG[pattern];
  const angles: number[] = [];
  for (const [a, b, c] of cfg.joints) {
    const pa = lms[a], pb = lms[b], pc = lms[c];
    if (![pa, pb, pc].every((p) => visOk(p, 0.3))) continue;
    angles.push(angle(pa, pb, pc));
  }
  if (!angles.length) return prev;
  const jointAngle = avg(angles);
  if (jointAngle < cfg.downBelow) return { phase: "down", reps: prev.reps };
  if (jointAngle > cfg.upAbove) {
    if (prev.phase === "down") return { phase: "up", reps: prev.reps + 1 };
    return { phase: "up", reps: prev.reps };
  }
  return prev;
}

// Sostenes isométricos: cronómetro mientras la condición del ejercicio se
// mantiene. "generic" = cuerpo presente (honesto para lo que la cámara no
// puede validar en detalle: plancha lateral, hollow, cuelgues).
export type HoldPattern = "oneLeg" | "plank" | "generic";

export function holdConditionMet(pattern: HoldPattern, lms: Landmark[] | null): boolean {
  if (!bodyPresent(lms)) return false;
  if (pattern === "oneLeg") {
    const la = lms[LM.L_ANKLE], ra = lms[LM.R_ANKLE], lk = lms[LM.L_KNEE], rk = lms[LM.R_KNEE], lh = lms[LM.L_HIP], rh = lms[LM.R_HIP];
    if (![la, ra, lk, rk, lh, rh].every((p) => visOk(p, 0.3))) return false;
    const ankleDiff = Math.abs(la.y - ra.y);
    const oneKneeBent = Math.min(angle(lh, lk, la), angle(rh, rk, ra)) < 150;
    return ankleDiff > 0.06 && oneKneeBent;
  }
  if (pattern === "plank") {
    const sh = shoulderMidpoint(lms);
    const la = lms[LM.L_ANKLE], ra = lms[LM.R_ANKLE];
    if (![la, ra].every((p) => visOk(p, 0.25))) return true; // tobillos ocultos: no penalizamos
    // Cuerpo aproximadamente horizontal: hombros y tobillos a altura similar.
    return Math.abs(sh.y - avg([la.y, ra.y])) < 0.22;
  }
  return true;
}

/* ─── Motores específicos de la evaluación ── */

// Equilibrio unipodal: cronómetro hold-until-fail con tope.
export interface OlsState { legUp: boolean; upSince: number | null; heldMs: number; attempted: boolean; done: boolean; }
export const OLS_INIT: OlsState = { legUp: false, upSince: null, heldMs: 0, attempted: false, done: false };

export function stepOLS(lms: Landmark[] | null, prev: OlsState, capMs: number): OlsState {
  if (prev.done || !lms) return prev;
  const la = lms[LM.L_ANKLE], ra = lms[LM.R_ANKLE], lk = lms[LM.L_KNEE], rk = lms[LM.R_KNEE], lh = lms[LM.L_HIP], rh = lms[LM.R_HIP];
  if (![la, ra, lk, rk, lh, rh].every((p) => visOk(p, 0.3))) return prev;

  const ankleDiff = Math.abs(la.y - ra.y);
  const oneKneeBent = Math.min(angle(lh, lk, la), angle(rh, rk, ra)) < 150;
  const legIsUp = ankleDiff > 0.06 && oneKneeBent;
  const now = performance.now();

  if (legIsUp && !prev.legUp) return { ...prev, legUp: true, upSince: now, attempted: true };
  if (legIsUp && prev.legUp && prev.upSince != null) {
    const heldMs = now - prev.upSince;
    if (heldMs >= capMs) return { ...prev, heldMs: capMs, done: true };
    return { ...prev, heldMs };
  }
  if (!legIsUp && prev.legUp) {
    // El pie volvió a tocar el piso: se termina el intento (mínimo 0.5s para contar).
    return { ...prev, legUp: false, upSince: null, done: prev.heldMs > 500 };
  }
  return prev;
}

// Sit-to-stand y flexiones de la evaluación: el motor genérico con sus patrones.
export function stepSTS(lms: Landmark[] | null, prev: RepState): RepState {
  return stepReps("kneeFlex", lms, prev);
}

export function stepPushup(lms: Landmark[] | null, prev: RepState): RepState {
  return stepReps("elbowFlex", lms, prev);
}

// Sentadilla profunda: test de UN intento, sin fatiga — se registra la mejor
// posición sostenida en la ventana de tiempo, no se cuentan repeticiones.
export interface SquatState { bestDelta: number; armsUpAtBest: boolean; }
export const SQUAT_INIT: SquatState = { bestDelta: -1, armsUpAtBest: false };

export function stepSquat(lms: Landmark[] | null, prev: SquatState): SquatState {
  if (!lms) return prev;
  const lh = lms[LM.L_HIP], rh = lms[LM.R_HIP], lk = lms[LM.L_KNEE], rk = lms[LM.R_KNEE];
  const ls = lms[LM.L_SHOULDER], rs = lms[LM.R_SHOULDER], lw = lms[LM.L_WRIST], rw = lms[LM.R_WRIST];
  if (![lh, rh, lk, rk].every((p) => visOk(p, 0.3))) return prev;
  const hipY = avg([lh.y, rh.y]);
  const kneeY = avg([lk.y, rk.y]);
  const delta = hipY - kneeY; // más alto = sentadilla más profunda
  const armsUp = [ls, rs, lw, rw].every((p) => visOk(p, 0.3)) && avg([lw.y, rw.y]) < avg([ls.y, rs.y]) - 0.03;
  if (delta > prev.bestDelta) return { bestDelta: delta, armsUpAtBest: armsUp };
  return prev;
}

// 0 = sin datos todavía; 1 limitada, 2 parcial, 3 profundidad completa.
export function squatScore(state: SquatState): 0 | 1 | 2 | 3 {
  if (state.bestDelta <= -1) return 0;
  if (state.bestDelta >= 0 && state.armsUpAtBest) return 3;
  if (state.bestDelta >= -0.06) return 2;
  return 1;
}
