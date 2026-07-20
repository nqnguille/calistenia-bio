"use client";
// Mega-zoom SIN lag y reutilizable: la detección se pre-calcula offline con el
// modelo pesado (scripts/extract-pose.py → <video>-pose.json con landmarks 2D +
// 3D). Acá se leen sincronizados al cuadro (requestVideoFrameCallback) y se
// dibujan. Los ángulos se miden en 3D (world landmarks) → robustos al ángulo de
// cámara. Un `ex` define qué video, qué articulaciones marcar y el encuadre.
import { useEffect, useRef, useState } from "react";
import { drawPose, poseQuality, angle, coverMapper, clamp, visOk, type Landmark } from "@/lib/pose-engine";

export type Joint = { a: number; b: number; c: number; ids: [number, number, number] };
export type ReaderExample = {
  id: string;
  label: string;
  metric: string;      // etiqueta del ángulo, ej "flexión rodilla"
  video: string;       // base sin extensión en /hero/
  pose: string;        // ruta del JSON de pose
  origin: string;      // transform-origin del zoom
  scale: number;
  joints: Joint[];     // b = vértice medido
};

type R = { ang: number; vel: number; sym: number; conf: number; ready: boolean };
type PoseData = { fps: number; count: number; frames: (number[][] | null)[]; world: (number[][] | null)[] };

function angle3D(a: number[], b: number[], c: number[]) {
  const ab = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cb = [c[0] - b[0], c[1] - b[1], c[2] - b[2]];
  const dot = ab[0] * cb[0] + ab[1] * cb[1] + ab[2] * cb[2];
  const mag = Math.hypot(...ab) * Math.hypot(...cb);
  if (!mag) return 0;
  return (Math.acos(Math.max(-1, Math.min(1, dot / mag))) * 180) / Math.PI;
}

// Marcadores sobre las articulaciones (mismo canvas que el esqueleto → alineado).
function drawMarkers(canvas: HTMLCanvasElement, video: HTMLVideoElement, lms: Landmark[], joints: Joint[], angs: number[]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const map = coverMapper(canvas, video);
  const u = clamp(Math.max(canvas.width, canvas.height) / 1400, 0.6, 2.4);
  ctx.save();
  ctx.strokeStyle = "#00E5FF";
  ctx.fillStyle = "#00E5FF";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  joints.forEach((j, ji) => {
    const A = lms[j.a], B = lms[j.b], C = lms[j.c];
    if (!visOk(A, 0.3) || !visOk(B, 0.3) || !visOk(C, 0.3)) return;
    const ap = map(A), bp = map(B), cp = map(C);
    const ang = Math.round(angs[ji] ?? angle(A, B, C));
    const a1 = Math.atan2(ap.y - bp.y, ap.x - bp.x);
    const a2 = Math.atan2(cp.y - bp.y, cp.x - bp.x);
    let d = a2 - a1;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = 2 * u;
    ctx.beginPath();
    ctx.arc(bp.x, bp.y, 22 * u, a1, a1 + d, d < 0);
    ctx.stroke();
    const bb = 30 * u, len = 9 * u;
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 1.6 * u;
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
      ctx.beginPath();
      ctx.moveTo(bp.x + sx * bb, bp.y + sy * bb - sy * len);
      ctx.lineTo(bp.x + sx * bb, bp.y + sy * bb);
      ctx.lineTo(bp.x + sx * bb - sx * len, bp.y + sy * bb);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.font = `bold ${13 * u}px monospace`;
    ctx.fillText(`${ang}°`, bp.x + 34 * u, bp.y - 3 * u);
    ctx.globalAlpha = 0.7;
    ctx.font = `${9 * u}px monospace`;
    ctx.fillText(String(j.ids[0]), ap.x + 4 * u, ap.y - 5 * u);
    ctx.fillText(String(j.ids[1]), bp.x + 4 * u, bp.y + 12 * u);
    ctx.fillText(String(j.ids[2]), cp.x + 4 * u, cp.y - 5 * u);
  });
  ctx.restore();
}

const toLms = (f: number[][] | null): Landmark[] | null =>
  f ? f.map((a) => ({ x: a[0], y: a[1], z: a[2], visibility: a[3] })) : null;

export function ZoomReader({ ex }: { ex: ReaderExample }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [r, setR] = useState<R>({ ang: 0, vel: 0, sym: 0, conf: 0, ready: false });
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current, canvas = canvasRef.current, wrap = wrapRef.current;
    if (!video || !canvas || !wrap) return;
    video.play().catch(() => {});

    let data: PoseData | null = null;
    let stopped = false, rvfc = 0, rafId = 0;
    let prevAng = 0, prevT = 0, lastPush = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vAny = video as any;
    const hasRVFC = typeof vAny.requestVideoFrameCallback === "function";

    fetch(ex.pose).then((res) => res.json()).then((d: PoseData) => { data = d; }).catch(() => setFailed(true));

    const draw = (mediaTime: number) => {
      if (!data) return;
      const idx = Math.min(data.count - 1, Math.max(0, Math.round(mediaTime * data.fps)));
      const lms = toLms(data.frames[idx]);
      const q = poseQuality(lms);
      drawPose(canvas, video, lms, q);
      if (!lms) return;
      const w = data.world[idx];
      const angs = ex.joints.map((j) => w ? angle3D(w[j.a], w[j.b], w[j.c]) : angle(lms[j.a], lms[j.b], lms[j.c]));
      drawMarkers(canvas, video, lms, ex.joints, angs);
      const primary = Math.min(...angs); // articulación más flexionada = la que trabaja
      const now = performance.now();
      const dt = (now - prevT) / 1000;
      const vel = dt > 0 && dt < 0.4 ? Math.abs(primary - prevAng) / dt : 0;
      prevAng = primary; prevT = now;
      if (now - lastPush > 90) {
        lastPush = now;
        const sym = angs.length >= 2 ? Math.max(0, Math.round(100 - Math.abs(angs[0] - angs[1]))) : q;
        setR({ ang: Math.round(primary), vel: Math.min(300, Math.round(vel)), sym, conf: q, ready: true });
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onFrame = (_n: number, meta: any) => { if (stopped) return; draw(meta.mediaTime); rvfc = vAny.requestVideoFrameCallback(onFrame); };
    const onRaf = () => { if (stopped) return; draw(video.currentTime); rafId = requestAnimationFrame(onRaf); };
    const startDraw = () => { if (hasRVFC) rvfc = vAny.requestVideoFrameCallback(onFrame); else rafId = requestAnimationFrame(onRaf); };

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { video.play().catch(() => {}); startDraw(); }
      else video.pause();
    }, { threshold: 0.15 });
    io.observe(wrap);

    return () => {
      stopped = true;
      if (hasRVFC && vAny.cancelVideoFrameCallback) vAny.cancelVideoFrameCallback(rvfc);
      cancelAnimationFrame(rafId);
      io.disconnect();
    };
  }, [ex]);

  const symLabel = ex.joints.length >= 2 ? "simetría" : "confianza";

  return (
    <div ref={wrapRef} className="brut-panel-raised relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.14] bg-black/50 px-4 py-3">
        <span className="brut-mono text-[0.66rem] font-bold uppercase tracking-[0.1em] text-chalk/50">joint_reader · {ex.id}</span>
        <span className="brut-mono flex items-center gap-2 text-[0.66rem] font-bold uppercase tracking-[0.1em] text-cyan">
          <span className="h-2 w-2 animate-pulse bg-cyan" /> {r.ready ? "tracking · locked" : "cargando…"}
        </span>
      </div>

      <div className="relative aspect-[4/5] w-full overflow-hidden bg-black">
        <div className="absolute inset-0" style={{ transform: `scale(${ex.scale})`, transformOrigin: ex.origin }}>
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: "contrast(1.05) saturate(0.82) brightness(0.88)" }}
            poster={`/hero/${ex.video}_poster.jpg`}
            muted loop playsInline autoPlay preload="auto" aria-hidden
          >
            <source src={`/hero/${ex.video}.webm`} type="video/webm" />
            <source src={`/hero/${ex.video}.mp4`} type="video/mp4" />
          </video>
          <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />
        </div>

        <div className="pointer-events-none absolute inset-0 opacity-25" style={{ backgroundImage: "linear-gradient(rgba(0,229,255,.09) 1px, transparent 1px)", backgroundSize: "100% 3px" }} aria-hidden />
        <div className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 130px rgba(0,0,0,0.7)" }} aria-hidden />

        <div className="pointer-events-none absolute right-3 top-3 border border-cyan/40 bg-black/70 px-3 py-2 text-right">
          <p className="brut-mono text-[0.54rem] font-bold uppercase tracking-[0.12em] text-cyan/70">{ex.metric}</p>
          <p className="brut-display text-5xl leading-none text-cyan brut-glow tabular-nums">{r.ready ? `${r.ang}°` : "—"}</p>
        </div>

        <div className="pointer-events-none absolute bottom-3 left-3 right-3 grid grid-cols-3 gap-2">
          {[
            { k: "vel angular", v: r.ready ? `${r.vel}°/s` : "—" },
            { k: symLabel, v: r.ready ? `${ex.joints.length >= 2 ? r.sym : r.conf}%` : "—" },
            { k: "confianza", v: r.ready ? `${r.conf}%` : "—" },
          ].map((m) => (
            <div key={m.k} className="border border-white/[0.14] bg-black/78 px-2.5 py-2">
              <p className="brut-mono text-[0.5rem] font-bold uppercase tracking-[0.06em] text-chalk/40">{m.k}</p>
              <p className="brut-display text-lg leading-none text-cyan tabular-nums">{m.v}</p>
            </div>
          ))}
        </div>

        {["left-2 top-10 border-l-2 border-t-2", "right-2 top-10 border-r-2 border-t-2", "left-2 bottom-20 border-l-2 border-b-2", "right-2 bottom-20 border-r-2 border-b-2"].map((c) => (
          <span key={c} className={`pointer-events-none absolute ${c} h-4 w-4 border-cyan/70`} aria-hidden />
        ))}
      </div>

      <div className="grid grid-cols-3 border-t border-white/[0.14] bg-black/40">
        {[{ k: "landmarks", v: "33 pts" }, { k: "frecuencia", v: "30 fps" }, { k: "medición", v: "pose 3D" }].map((x, i) => (
          <div key={x.k} className={`px-3 py-2.5 text-center ${i ? "border-l border-white/[0.1]" : ""}`}>
            <p className="brut-mono text-[0.5rem] font-bold uppercase tracking-[0.06em] text-chalk/40">{x.k}</p>
            <p className="brut-mono text-[0.72rem] font-bold uppercase text-cyan">{x.v}</p>
          </div>
        ))}
      </div>

      {failed && (
        <p className="brut-mono border-t border-white/[0.14] bg-black/50 px-4 py-2 text-[0.6rem] uppercase tracking-[0.06em] text-chalk/40">
          análisis no disponible · mostrando feed real
        </p>
      )}
    </div>
  );
}
