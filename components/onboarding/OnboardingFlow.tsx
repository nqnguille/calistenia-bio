"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  cream: "#F8F6F2", ink: "#151716", ink2: "#343A36",
  sage: "#7A8F74", muted: "#8E9188", border: "#DED9CE",
  dark: "#080B0F", dark2: "#111821", red: "#ef4444",
};

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
  { id: "posture",  title: "Postura en reposo",   instruction: "Quedate quieto, brazos al costado, mirada al frente.", emoji: "🧍", duration: 6,  hint: "Estamos midiendo tu alineación natural" },
  { id: "arms",     title: "Movilidad de hombros", instruction: "Levantá ambos brazos sobre la cabeza, lo más alto que puedas.", emoji: "🙆", duration: 6, hint: "La movilidad del hombro es clave para la edad funcional" },
  { id: "balance",  title: "Equilibrio unipodal",  instruction: "Levantá la rodilla derecha y mantené el equilibrio.", emoji: "🦩", duration: 6, hint: "El equilibrio predice el envejecimiento neuromotor" },
];


type Landmark = { x: number; y: number; z?: number; visibility?: number };
type PoseAnalysis = { detected: boolean; score: number; feedback: string; detail: string };
type PoseRuntime = { stop: () => void };

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

const CONNECTIONS: Array<[number, number]> = [
  [LM.L_SHOULDER, LM.R_SHOULDER],
  [LM.L_SHOULDER, LM.L_ELBOW], [LM.L_ELBOW, LM.L_WRIST],
  [LM.R_SHOULDER, LM.R_ELBOW], [LM.R_ELBOW, LM.R_WRIST],
  [LM.L_SHOULDER, LM.L_HIP], [LM.R_SHOULDER, LM.R_HIP],
  [LM.L_HIP, LM.R_HIP],
  [LM.L_HIP, LM.L_KNEE], [LM.L_KNEE, LM.L_ANKLE],
  [LM.R_HIP, LM.R_KNEE], [LM.R_KNEE, LM.R_ANKLE],
];

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

function analyzePose(lms: Landmark[] | null, testId: MovementTest["id"]): PoseAnalysis {
  if (!lms || !essentialVisible(lms)) {
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
    if (![lw, rw, le, re].every((lm) => visOk(lm))) {
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
  if (![lk, rk].every((lm) => visOk(lm))) {
    return { detected: true, score: 45, feedback: "Necesitamos ver tus rodillas", detail: "Alejate un poco de la cámara" };
  }
  const leftLift = lh.y - lk.y;
  const rightLift = rh.y - rk.y;
  const kneeLift = Math.max(leftLift, rightLift);
  const feetVisible = visOk(la, 0.28) || visOk(ra, 0.28);
  const liftScore = clamp((kneeLift + 0.04) / 0.20, 0, 1);
  const verticalControl = 1 - clamp((shoulderTilt + hipTilt) / 0.12, 0, 1);
  const score = Math.round(clamp(42 + liftScore * 42 + verticalControl * 18 + (feetVisible ? 0 : -6), 25, 100));
  const feedback = liftScore > 0.55 ? "Equilibrio unipodal detectado" : "Levantá una rodilla y sostené";
  return { detected: true, score, feedback, detail: `Control ${score}%` };
}

// El canvas replica el tamaño REAL en pantalla (no el del video): así el dibujo
// nunca se estira. El video se muestra con object-fit: cover, por eso los
// landmarks (normalizados sobre el frame completo) se mapean con el mismo
// recorte centrado que aplica el navegador al video.
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

  // Sin cuerpo no se dibuja nada: el estado lo comunica la UI (el canvas está
  // espejado, cualquier texto acá saldría al revés).
  if (!lms) return;

  const good = quality >= 68;
  const color = good ? "#AFC3A5" : quality >= 48 ? "#F0C36A" : "#F17464";
  const dim = good ? "rgba(175,195,165,0.28)" : "rgba(241,116,100,0.25)";
  const toCanvas = coverMapper(canvas, video);
  const u = clamp(Math.max(canvas.width, canvas.height) / 1400, 0.6, 2.4); // unidad de grosor según resolución

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = color;
  ctx.shadowBlur = 14 * u;

  const armPointSet = new Set<number>([LM.L_ELBOW, LM.R_ELBOW, LM.L_WRIST, LM.R_WRIST]);
  for (const [a, b] of CONNECTIONS) {
    const la = lms[a], lb = lms[b];
    if (!visOk(la, 0.32) || !visOk(lb, 0.32)) continue;
    const pa = toCanvas(la), pb = toCanvas(lb);
    const isArm = armPointSet.has(a) || armPointSet.has(b);
    ctx.beginPath();
    ctx.strokeStyle = isArm ? color : dim;
    ctx.lineWidth = (isArm ? 6 : 4) * u;
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();
  }

  for (const i of Object.values(LM)) {
    const lm = lms[i];
    if (!visOk(lm, 0.32)) continue;
    const p = toCanvas(lm);
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(p.x, p.y, (i === LM.NOSE ? 8 : 7) * u, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

async function startPoseTracking({
  video,
  canvas,
  onStatus,
  onResults,
}: {
  video: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  onStatus?: (status: string) => void;
  onResults: (landmarks: Landmark[] | null, analysis: PoseAnalysis | undefined, quality: number) => void;
}): Promise<PoseRuntime> {
  onStatus?.("Cargando modelo biomecánico…");
  await loadMediaPipe();

  const Pose = window.Pose!;
  const Camera = window.Camera!;
  let stopped = false;

  const pose = new Pose({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}` });
  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.55,
    minTrackingConfidence: 0.55,
  });

  pose.onResults((results) => {
    if (stopped) return;
    const lms = results.poseLandmarks ?? null;
    const quality = poseQuality(lms);
    const genericAnalysis = lms ? analyzePose(lms, "posture") : undefined;
    drawPose(canvas, video, lms, quality);
    onResults(lms, genericAnalysis, quality);
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

  return {
    stop: () => {
      stopped = true;
      try { camera.stop(); } catch {}
      try { pose.close(); } catch {}
      const stream = video.srcObject as MediaStream | null;
      stream?.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    },
  };
}

/* ─── Helpers ────────────────────────────── */
function pad(n: number) { return String(n).padStart(2, "0"); }

function useCountdown(from: number, active: boolean, onDone: () => void) {
  const [remaining, setRemaining] = useState(from);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  const onDoneRef = useRef(onDone);
  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);

  useEffect(() => {
    if (!active) { setRemaining(from); return; }
    setRemaining(from);
    ref.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { clearInterval(ref.current!); onDoneRef.current(); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current!);
  }, [active, from]);

  return remaining;
}

/* ─── Score generation from real pose samples ─ */
function movementAgeFromScores(age: number, scores: number[]): number {
  const biomechScore = scores.length ? avg(scores) : 58;
  // 72 is treated as a healthy baseline. Lower scores age the movement profile;
  // higher scores make it younger. This is still an MVP heuristic, now fed by real landmarks.
  const offset = Math.round((72 - biomechScore) * 0.58);
  return Math.round(clamp(age + offset, 22, 75));
}

/* ─── Skeleton SVG overlay (simplified) ── */
function SkeletonOverlay({ detected }: { detected: boolean }) {
  const color = detected ? C.sage : "rgba(248,246,242,0.3)";
  return (
    <svg viewBox="0 0 300 480" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} aria-hidden>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {detected && (
        <motion.g filter="url(#glow)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          {/* skeleton lines */}
          {[
            [[150,65],[130,90],[120,130],[110,170]],
            [[150,65],[170,90],[180,130],[190,170]],
            [[130,90],[170,90]],
            [[150,65],[150,180]],
            [[150,180],[135,260],[130,340]],
            [[150,180],[165,260],[170,340]],
          ].map((seg, si) => seg.slice(0,-1).map(([x1,y1],pi) => {
            const [x2,y2] = seg[pi+1];
            return <line key={`${si}-${pi}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2.5" strokeLinecap="round" />;
          }))}
          {/* joints */}
          {[[150,65],[130,90],[170,90],[110,170],[190,170],[150,180],[135,260],[165,260],[130,340],[170,340]].map(([cx,cy],i) => (
            <motion.circle key={i} cx={cx} cy={cy} r={i<3?6:4} fill={color}
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i*0.05 }} />
          ))}
          {/* head */}
          <circle cx="150" cy="45" r="20" fill="none" stroke={color} strokeWidth="2" />
        </motion.g>
      )}
      {!detected && (
        <motion.text x="150" y="240" textAnchor="middle" fill="rgba(248,246,242,0.4)"
          fontSize="14" fontWeight="500" animate={{ opacity:[0.4,0.8,0.4] }} transition={{ duration:2, repeat:Infinity }}>
          Buscando tu cuerpo...
        </motion.text>
      )}
    </svg>
  );
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
      style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", padding: "0 24px", gap: 32, maxWidth: 600, margin: "0 auto" }}>

      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        style={{ display:"inline-flex", alignItems:"center", gap:10, fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:C.sage }}>
        <span style={{ width:20, height:1, background:C.sage }} />CALISTENIA.bio<span style={{ width:20, height:1, background:C.sage }} />
      </motion.div>

      <motion.h1 initial={{ opacity:0, y:32 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2, ease:[0.16,1,0.3,1] }}
        style={{ fontSize:"clamp(2.2rem,5vw,3.8rem)", fontWeight:900, color:"#F8F6F2", lineHeight:0.95, letterSpacing:"-0.03em" }}>
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

/* ─── STEP: CAMERA ───────────────────── */
function StepCamera({ onNext }: { onNext: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<PoseRuntime | null>(null);
  const detectedFrames = useRef(0);
  const advancedRef = useRef(false);
  const bootRef = useRef(false);
  const [permission, setPermission] = useState<"idle"|"requesting"|"granted"|"denied">("idle");
  const [detected, setDetected] = useState(false);
  const [partial, setPartial] = useState(false);
  const [status, setStatus] = useState("Listo para activar cámara");
  const [quality, setQuality] = useState(0);

  const stopRuntime = useCallback(() => {
    runtimeRef.current?.stop();
    runtimeRef.current = null;
  }, []);

  useEffect(() => () => stopRuntime(), [stopRuntime]);

  const requestCamera = useCallback(() => {
    stopRuntime();
    setDetected(false);
    setQuality(0);
    setStatus("Preparando panel de cámara…");
    detectedFrames.current = 0;
    advancedRef.current = false;
    bootRef.current = false;
    setPermission("requesting");
  }, [stopRuntime]);

  useEffect(() => {
    if (permission !== "requesting" || bootRef.current) return;
    if (!videoRef.current || !canvasRef.current) return;

    bootRef.current = true;
    let active = true;

    const start = async () => {
      try {
        const runtime = await startPoseTracking({
          video: videoRef.current!,
          canvas: canvasRef.current!,
          onStatus: (value) => active && setStatus(value),
          onResults: (landmarks, _analysis, poseConfidence) => {
            if (!active) return;
            const ok = !!landmarks && essentialVisible(landmarks);
            setDetected(ok);
            setPartial(!!landmarks && !ok);
            setQuality(poseConfidence);
            if (ok) detectedFrames.current += 1;
            else detectedFrames.current = 0;

            if (detectedFrames.current > 22 && !advancedRef.current) {
              advancedRef.current = true;
              setStatus("Cuerpo detectado · preparando evaluación…");
              setTimeout(() => {
                if (!active) return;
                stopRuntime();
                onNext();
              }, 900);
            }
          },
        });
        if (!active) { runtime.stop(); return; }
        runtimeRef.current = runtime;
        setPermission("granted");
      } catch (err) {
        console.error(err);
        if (active) {
          setPermission("denied");
          setStatus("No pudimos iniciar la cámara o el modelo de pose");
        }
      }
    };

    start();
    return () => { active = false; };
  }, [permission, onNext, stopRuntime]);

  if (permission === "idle") {
    return (
      <motion.div key="camera" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:24, padding:"0 20px" }}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", gap:28, padding:"0 24px", maxWidth:560 }}>
          <div style={{ width:78, height:78, borderRadius:"50%", background:"rgba(122,143,116,0.15)", border:`2px solid rgba(122,143,116,0.4)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem" }}>
            📷
          </div>
          <h2 style={{ fontSize:"clamp(1.9rem,4vw,3rem)", fontWeight:900, color:"#F8F6F2", lineHeight:0.95, letterSpacing:"-0.04em" }}>
            Activá tu cámara
          </h2>
          <p style={{ fontSize:"1rem", color:"rgba(248,246,242,0.58)", lineHeight:1.75, fontWeight:300 }}>
            Esta vez la demo usa detección corporal real: MediaPipe identifica tus landmarks en vivo y calcula señales biomecánicas básicas en tu dispositivo.
          </p>
          <button onClick={requestCamera}
            style={{ background:C.sage, color:"#fff", fontWeight:800, fontSize:"1rem", padding:"16px 40px", borderRadius:999, border:"none", cursor:"pointer" }}>
            Activar cámara real →
          </button>
          <p style={{ fontSize:"0.75rem", color:"rgba(248,246,242,0.25)" }}>Nada se graba ni se sube. El análisis ocurre en el navegador.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div key="camera-live" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:"fixed", inset:0, zIndex:4, background:C.dark, overflow:"hidden" }}>

      <video ref={videoRef} autoPlay playsInline muted
        style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", transform:"scaleX(-1)", display:"block", opacity: permission === "granted" ? 0.86 : 0.28 }} />
      <canvas ref={canvasRef}
        style={{ position:"absolute", inset:0, width:"100%", height:"100%", transform:"scaleX(-1)", pointerEvents:"none" }} />

      <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:"radial-gradient(circle at 50% 45%, transparent 0%, rgba(8,11,15,0.10) 48%, rgba(8,11,15,0.72) 100%)" }} />
      <div className="bio-grid" style={{ position:"absolute", inset:0, opacity:0.22, pointerEvents:"none" }} />
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", boxShadow:"inset 0 0 0 1px rgba(255,255,255,0.04), inset 0 -160px 160px rgba(8,11,15,0.55), inset 0 120px 120px rgba(8,11,15,0.35)" }} />

      <div style={{ position:"absolute", top:82, left:24, right:24, display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16, pointerEvents:"none" }}>
        <div style={{ maxWidth:"min(560px, 58vw)", background:"rgba(8,11,15,0.56)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:999, padding:"10px 16px", display:"flex", alignItems:"center", gap:10, backdropFilter:"blur(16px)", boxShadow:"0 18px 60px rgba(0,0,0,0.28)" }}>
          <motion.div animate={{ opacity:[0.35,1,0.35] }} transition={{ duration:1.25, repeat:Infinity }}
            style={{ width:9, height:9, borderRadius:"50%", background:detected?"#AFC3A5":"#F0C36A", flexShrink:0 }} />
          <span style={{ color:"rgba(248,246,242,0.86)", fontWeight:900, fontSize:"0.78rem", letterSpacing:"0.12em", textTransform:"uppercase", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {detected ? "Cuerpo detectado · preparando evaluación…" : status}
          </span>
        </div>

        <div style={{ minWidth:150, background:"rgba(8,11,15,0.58)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:22, padding:"16px 18px", backdropFilter:"blur(16px)", boxShadow:"0 18px 60px rgba(0,0,0,0.28)" }}>
          <p style={{ fontSize:"0.62rem", color:"rgba(248,246,242,0.40)", fontWeight:900, letterSpacing:"0.16em", textTransform:"uppercase", marginBottom:8 }}>Calidad pose</p>
          <div style={{ display:"flex", alignItems:"end", gap:6 }}>
            <span style={{ color:"#F8F6F2", fontSize:"2.35rem", fontWeight:900, lineHeight:1 }}>{Math.round(quality)}</span>
            <span style={{ color:"rgba(248,246,242,0.38)", fontSize:"0.85rem", fontWeight:800, marginBottom:4 }}>%</span>
          </div>
        </div>
      </div>

      {permission === "requesting" && (
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16, background:"rgba(8,11,15,0.38)", pointerEvents:"none" }}>
          <motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:"linear" }}
            style={{ width:42, height:42, border:"3px solid rgba(122,143,116,0.22)", borderTopColor:C.sage, borderRadius:"50%" }} />
          <p style={{ color:"rgba(248,246,242,0.72)", fontWeight:700 }}>{status}</p>
        </div>
      )}

      {permission === "denied" && (
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div style={{ width:"min(560px, 92vw)", background:"rgba(8,11,15,0.82)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:28, padding:"42px 32px", textAlign:"center", boxShadow:"0 30px 100px rgba(0,0,0,0.45)", backdropFilter:"blur(20px)" }}>
            <p style={{ fontSize:"3rem", marginBottom:14 }}>🚫</p>
            <h3 style={{ color:"#F8F6F2", fontSize:"1.5rem", fontWeight:900, marginBottom:14 }}>No pudimos iniciar la cámara</h3>
            <p style={{ color:"rgba(248,246,242,0.58)", lineHeight:1.65, margin:"0 auto", maxWidth:420 }}>{status}. Revisá permisos del navegador y conexión a internet para cargar el modelo.</p>
            <button onClick={requestCamera} style={{ marginTop:24, background:C.sage, color:"#fff", fontWeight:800, padding:"13px 30px", borderRadius:999, border:"none", cursor:"pointer" }}>Intentar de nuevo</button>
          </div>
        </div>
      )}

      {permission === "granted" && !detected && (
        <div style={{ position:"absolute", left:24, right:24, bottom:28, display:"flex", justifyContent:"center", pointerEvents:"none" }}>
          <div style={{ maxWidth:760, background:"rgba(8,11,15,0.62)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:999, padding:"12px 18px", color:"rgba(248,246,242,0.72)", fontSize:"0.95rem", textAlign:"center", backdropFilter:"blur(16px)", boxShadow:"0 20px 70px rgba(0,0,0,0.35)" }}>
            {partial
              ? "Casi: acomodate para que entren hombros y cadera en el cuadro, con buena luz de frente."
              : "Ponete a 2-3 metros de la cámara, de frente y con luz. Buscamos hombros, cadera y rodillas."}
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 720px) {
          div[style*="top: 82px"] {
            top: 72px !important;
            left: 14px !important;
            right: 14px !important;
          }
        }
      `}</style>
    </motion.div>
  );
}

/* ─── STEP: MOVEMENT ─────────────────── */
function StepMovement({ onComplete }: { onComplete: (scores: number[]) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<PoseRuntime | null>(null);
  const phaseRef = useRef<"intro"|"counting"|"done">("intro");
  const currentIdRef = useRef<MovementTest["id"]>("posture");
  const samplesRef = useRef<number[]>([]);
  const collectedScoresRef = useRef<number[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState<"intro"|"counting"|"done">("intro");
  const [status, setStatus] = useState("Iniciando cámara…");
  const [detected, setDetected] = useState(false);
  const [liveScore, setLiveScore] = useState(0);
  const [feedback, setFeedback] = useState("Posicionate frente a la cámara");
  const [detail, setDetail] = useState("Landmarks en vivo");

  const current = MOVEMENTS[currentIdx];

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { currentIdRef.current = current.id; samplesRef.current = []; }, [current.id]);

  const stopRuntime = useCallback(() => {
    runtimeRef.current?.stop();
    runtimeRef.current = null;
  }, []);

  useEffect(() => {
    let active = true;
    const init = async () => {
      if (!videoRef.current || !canvasRef.current) return;
      try {
        const runtime = await startPoseTracking({
          video: videoRef.current,
          canvas: canvasRef.current,
          onStatus: (s) => active && setStatus(s),
          onResults: (landmarks) => {
            if (!active) return;
            // El esqueleto ya lo dibuja el runtime (y limpia el canvas si se
            // pierde el cuerpo); acá solo analizamos el movimiento actual.
            const analysis = analyzePose(landmarks, currentIdRef.current);
            setDetected(analysis.detected);
            setLiveScore(analysis.score);
            setFeedback(analysis.feedback);
            setDetail(analysis.detail);
            if (phaseRef.current === "counting" && analysis.detected && analysis.score > 0) {
              samplesRef.current.push(analysis.score);
            }
          },
        });
        if (!active) { runtime.stop(); return; }
        runtimeRef.current = runtime;
        setStatus("Cámara activa");
      } catch (err) {
        console.error(err);
        if (active) {
          setStatus("No se pudo iniciar cámara/modelo");
          setFeedback("Revisá permisos de cámara y conexión a internet");
        }
      }
    };
    init();
    return () => { active = false; stopRuntime(); };
  }, [stopRuntime]);

  const handleMoveDone = useCallback(() => {
    const measured = samplesRef.current.length >= 6 ? Math.round(avg(samplesRef.current)) : Math.max(35, liveScore || 42);
    collectedScoresRef.current.push(measured);
    samplesRef.current = [];

    if (currentIdx < MOVEMENTS.length - 1) {
      setPhase("intro");
      setCurrentIdx((i) => i + 1);
    } else {
      setPhase("done");
      stopRuntime();
      onComplete(collectedScoresRef.current);
    }
  }, [currentIdx, liveScore, onComplete, stopRuntime]);

  const timer = useCountdown(current.duration, phase === "counting", handleMoveDone);
  const progress = phase === "counting" ? ((current.duration - timer) / current.duration) * 100 : 0;

  return (
    <motion.div key="movement" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ display:"flex", flexDirection:"column", height:"100%", width:"100%", paddingTop:56 }}>

      <div style={{ padding:"14px 24px 0", display:"flex", justifyContent:"center" }}>
        <ProgressDots current={currentIdx} total={MOVEMENTS.length} />
      </div>

      <div className="eval-grid" style={{ flex:1, display:"grid", gridTemplateColumns:"minmax(0, 1.15fr) minmax(320px, .85fr)", gap:28, alignItems:"center", width:"min(1180px, 94vw)", margin:"0 auto", padding:"22px 0" }}>
        <div style={{ position:"relative", aspectRatio:"16/10", borderRadius:30, overflow:"hidden", border:"1px solid rgba(255,255,255,0.10)", boxShadow:"0 32px 100px rgba(0,0,0,0.42)", background:C.dark2 }}>
          <video ref={videoRef} autoPlay playsInline muted
            style={{ width:"100%", height:"100%", objectFit:"cover", transform:"scaleX(-1)", display:"block", opacity:0.72 }} />
          <canvas ref={canvasRef}
            style={{ position:"absolute", inset:0, width:"100%", height:"100%", transform:"scaleX(-1)", pointerEvents:"none" }} />
          <div className="bio-grid" style={{ position:"absolute", inset:0, opacity:0.28, pointerEvents:"none" }} />

          <div style={{ position:"absolute", top:16, left:16, background:"rgba(8,11,15,0.76)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:999, padding:"9px 14px", display:"flex", alignItems:"center", gap:9, backdropFilter:"blur(12px)" }}>
            <motion.span animate={{ opacity:[0.35,1,0.35] }} transition={{ duration:1.2, repeat:Infinity }} style={{ width:8, height:8, borderRadius:"50%", background:detected?"#AFC3A5":"#F0C36A" }} />
            <span style={{ color:"rgba(248,246,242,0.74)", fontSize:"0.72rem", fontWeight:900, letterSpacing:"0.16em", textTransform:"uppercase" }}>{detected ? "Landmarks activos" : status}</span>
          </div>

          {phase === "counting" && (
            <div style={{ position:"absolute", top:16, right:16, background:"rgba(8,11,15,0.76)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:18, padding:"12px 16px", backdropFilter:"blur(12px)", textAlign:"center" }}>
              <p style={{ color:"rgba(248,246,242,0.35)", fontSize:"0.62rem", fontWeight:900, letterSpacing:"0.16em", textTransform:"uppercase", marginBottom:3 }}>Midiendo</p>
              <p style={{ color:"#F8F6F2", fontWeight:900, fontFamily:"monospace", fontSize:"1.7rem", lineHeight:1 }}>0:{pad(timer)}</p>
            </div>
          )}

          <div style={{ position:"absolute", left:18, right:18, bottom:18, background:"rgba(8,11,15,0.78)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:22, padding:16, backdropFilter:"blur(14px)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:14, marginBottom:10 }}>
              <div>
                <p style={{ color:"rgba(248,246,242,0.35)", fontSize:"0.62rem", fontWeight:900, letterSpacing:"0.16em", textTransform:"uppercase" }}>{detail}</p>
                <p style={{ color:"#F8F6F2", fontWeight:800, fontSize:"0.95rem", marginTop:3 }}>{feedback}</p>
              </div>
              <div style={{ textAlign:"right" }}>
                <span style={{ color: liveScore >= 70 ? "#AFC3A5" : liveScore >= 50 ? "#F0C36A" : "#F17464", fontSize:"2rem", fontWeight:900, lineHeight:1 }}>{Math.round(liveScore)}</span>
                <span style={{ color:"rgba(248,246,242,0.35)", fontSize:"0.75rem", fontWeight:700 }}>%</span>
              </div>
            </div>
            <div style={{ height:5, borderRadius:999, background:"rgba(255,255,255,0.12)", overflow:"hidden" }}>
              <motion.div animate={{ width: phase === "counting" ? `${progress}%` : `${liveScore}%` }} transition={{ duration:0.25 }} style={{ height:"100%", borderRadius:999, background: liveScore >= 70 ? C.sage : liveScore >= 50 ? "#F0C36A" : C.red }} />
            </div>
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:22 }}>
          <motion.div key={current.id} initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35 }}
            style={{ background:"rgba(255,255,255,0.055)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:28, padding:28, backdropFilter:"blur(16px)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, marginBottom:22 }}>
              <div style={{ width:52, height:52, borderRadius:18, background:"rgba(122,143,116,0.16)", border:"1px solid rgba(122,143,116,0.26)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.8rem" }}>{current.emoji}</div>
              <div style={{ color:C.sage, fontWeight:900, letterSpacing:"0.14em", fontSize:"0.72rem", textTransform:"uppercase" }}>Prueba {currentIdx + 1}/{MOVEMENTS.length}</div>
            </div>
            <h3 style={{ color:"#F8F6F2", fontSize:"clamp(1.8rem,3vw,2.7rem)", fontWeight:900, lineHeight:0.95, letterSpacing:"-0.05em", marginBottom:16 }}>{current.title}</h3>
            <p style={{ color:"rgba(248,246,242,0.64)", fontSize:"1.04rem", lineHeight:1.7, fontWeight:300 }}>{current.instruction}</p>
            <p style={{ color:C.sage, fontSize:"0.9rem", lineHeight:1.6, marginTop:16, fontWeight:600 }}>{current.hint}</p>
          </motion.div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
            {collectedScoresRef.current.map((score, i) => (
              <div key={i} style={{ background:"rgba(255,255,255,0.045)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:12, textAlign:"center" }}>
                <p style={{ color:"rgba(248,246,242,0.30)", fontSize:"0.6rem", fontWeight:900, letterSpacing:"0.12em", textTransform:"uppercase" }}>Test {i+1}</p>
                <p style={{ color:"#AFC3A5", fontWeight:900, fontSize:"1.4rem", lineHeight:1.2 }}>{score}%</p>
              </div>
            ))}
          </div>

          {phase === "intro" && (
            <motion.button initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }}
              disabled={!detected}
              onClick={() => { samplesRef.current = []; setPhase("counting"); }}
              whileHover={detected ? { scale:1.035 } : undefined} whileTap={detected ? { scale:0.98 } : undefined}
              style={{ background:detected?C.sage:"rgba(255,255,255,0.12)", color:detected?"#fff":"rgba(248,246,242,0.32)", fontWeight:900, fontSize:"1rem", padding:"16px 34px", borderRadius:999, border:"none", cursor:detected?"pointer":"not-allowed" }}>
              {detected ? "Empezar medición →" : "Esperando detección corporal"}
            </motion.button>
          )}

          {phase === "counting" && (
            <div style={{ color:"rgba(248,246,242,0.46)", fontSize:"0.9rem", lineHeight:1.6 }}>
              Quedate en la consigna. Estamos promediando señales reales de tus landmarks.
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 860px) {
          .eval-grid {
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
            padding-bottom: 24px !important;
            overflow-y: auto !important;
          }
        }
      `}</style>
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
      setIdx(i => {
        if (i >= steps.length - 1) { clearInterval(t); setTimeout(onDone, 600); return i; }
        return i + 1;
      });
    }, 700);
    return () => clearInterval(t);
  }, []); // eslint-disable-line

  return (
    <motion.div key="calculating" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:32, textAlign:"center", padding:"0 24px" }}>

      {/* Animated rings */}
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

  return (
    <motion.div key="reveal" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:28, textAlign:"center", padding:"0 24px" }}>

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

      {/* Comparison */}
      <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:1.1 }}
        style={{ display:"flex", gap:32, padding:"20px 32px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16 }}>
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
        style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:24, textAlign:"center", padding:"0 24px" }}>
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
      style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:28, textAlign:"center", padding:"0 24px", maxWidth:480, margin:"0 auto" }}>

      <div>
        <p style={{ fontSize:"0.75rem", color:C.sage, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:8 }}>Guardá tu resultado</p>
        <h2 style={{ fontSize:"clamp(1.8rem,4vw,2.4rem)", fontWeight:900, color:"#F8F6F2", lineHeight:0.95, letterSpacing:"-0.03em", marginBottom:12 }}>
          Tu Edad de Movimiento es <span style={{ color:C.sage }}>{movementAge}</span>
        </h2>
        <p style={{ color:"rgba(248,246,242,0.5)", fontSize:"0.95rem", lineHeight:1.65, fontWeight:300 }}>
          Dejanos tu email para guardar el resultado y recibir tu plan personalizado para reducir tu Edad de Movimiento.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ width:"100%", display:"flex", flexDirection:"column", gap:12 }}>
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
export function OnboardingFlow() {
  const [step, setStep] = useState<Step>("hook");
  const [movementAge, setMovementAge] = useState(0);
  // We use chronoAge=40 as default; real app would ask before/after reveal
  const CHRONO_AGE = 40;

  const handleMovementsComplete = useCallback((scores: number[]) => {
    setStep("calculating");
    const ma = movementAgeFromScores(CHRONO_AGE, scores);
    setTimeout(() => { setMovementAge(ma); }, 100);
  }, []);

  const stepIndex = ["hook","camera","movement","calculating","reveal","save"].indexOf(step);

  return (
    <div style={{ position:"fixed", inset:0, background:C.dark, display:"flex", flexDirection:"column", overflow:"hidden" }}>

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

      {/* Step content */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", marginTop:56 }}>
        <AnimatePresence mode="wait">
          {step === "hook" && <StepHook key="hook" onNext={() => setStep("camera")} />}
          {step === "camera" && <StepCamera key="camera" onNext={() => setStep("movement")} />}
          {step === "movement" && (
            <StepMovement key="movement" onComplete={handleMovementsComplete} />
          )}
          {step === "calculating" && (
            <StepCalculating key="calculating" onDone={() => setStep("reveal")} />
          )}
          {step === "reveal" && (
            <StepReveal key="reveal" movementAge={movementAge} chronoAge={CHRONO_AGE} onNext={() => setStep("save")} />
          )}
          {step === "save" && <StepSave key="save" movementAge={movementAge} />}
        </AnimatePresence>
      </div>

      {/* Bottom progress bar */}
      {step !== "hook" && (
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:"rgba(255,255,255,0.06)" }}>
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
