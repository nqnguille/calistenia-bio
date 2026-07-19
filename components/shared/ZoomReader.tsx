"use client";
// Mega-zoom SIN lag: la detección se pre-calculó offline con el modelo pesado
// (scripts extraen 33 landmarks por cuadro → posedemo-pose.json). Acá solo se
// leen esos landmarks sincronizados al cuadro exacto del video
// (requestVideoFrameCallback) y se dibujan. Sincronía perfecta, 60fps, cero CPU.
import { useEffect, useRef, useState } from "react";
import { drawPose, poseQuality, angle, LM, coverMapper, clamp, visOk, type Landmark } from "@/lib/pose-engine";

type R = { ang: number; vel: number; sym: number; conf: number; ready: boolean };
type PoseData = { fps: number; count: number; frames: (number[][] | null)[] };

// Marcadores extra sobre las articulaciones, en el mismo canvas que el esqueleto.
function drawMarkers(canvas: HTMLCanvasElement, video: HTMLVideoElement, lms: Landmark[]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const map = coverMapper(canvas, video);
  const u = clamp(Math.max(canvas.width, canvas.height) / 1400, 0.6, 2.4);
  ctx.save();
  ctx.strokeStyle = "#00E5FF";
  ctx.fillStyle = "#00E5FF";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const legs = [
    { h: LM.L_HIP, k: LM.L_KNEE, a: LM.L_ANKLE },
    { h: LM.R_HIP, k: LM.R_KNEE, a: LM.R_ANKLE },
  ];
  for (const leg of legs) {
    const H = lms[leg.h], K = lms[leg.k], A = lms[leg.a];
    if (!visOk(H, 0.3) || !visOk(K, 0.3) || !visOk(A, 0.3)) continue;
    const hp = map(H), kp = map(K), ap = map(A);
    const ang = Math.round(angle(H, K, A));
    const a1 = Math.atan2(hp.y - kp.y, hp.x - kp.x);
    const a2 = Math.atan2(ap.y - kp.y, ap.x - kp.x);
    let d = a2 - a1;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = 2 * u;
    ctx.beginPath();
    ctx.arc(kp.x, kp.y, 22 * u, a1, a1 + d, d < 0);
    ctx.stroke();
    const b = 30 * u, len = 9 * u;
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 1.6 * u;
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
      ctx.beginPath();
      ctx.moveTo(kp.x + sx * b, kp.y + sy * b - sy * len);
      ctx.lineTo(kp.x + sx * b, kp.y + sy * b);
      ctx.lineTo(kp.x + sx * b - sx * len, kp.y + sy * b);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.font = `bold ${13 * u}px monospace`;
    ctx.fillText(`${ang}°`, kp.x + 34 * u, kp.y - 3 * u);
    ctx.globalAlpha = 0.7;
    ctx.font = `${9 * u}px monospace`;
    ctx.fillText(String(leg.h), hp.x + 4 * u, hp.y - 5 * u);
    ctx.fillText(String(leg.k), kp.x + 4 * u, kp.y + 12 * u);
    ctx.fillText(String(leg.a), ap.x + 4 * u, ap.y - 5 * u);
  }
  ctx.restore();
}

const toLms = (f: number[][] | null): Landmark[] | null =>
  f ? f.map((a) => ({ x: a[0], y: a[1], z: a[2], visibility: a[3] })) : null;

export function ZoomReader() {
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

    fetch("/hero/posedemo-pose.json").then((res) => res.json()).then((d: PoseData) => { data = d; }).catch(() => setFailed(true));

    const draw = (mediaTime: number) => {
      if (!data) return;
      const idx = Math.min(data.count - 1, Math.max(0, Math.round(mediaTime * data.fps)));
      const lms = toLms(data.frames[idx]);
      const q = poseQuality(lms);
      drawPose(canvas, video, lms, q);
      if (!lms) return;
      drawMarkers(canvas, video, lms);
      const aL = angle(lms[LM.L_HIP], lms[LM.L_KNEE], lms[LM.L_ANKLE]);
      const aR = angle(lms[LM.R_HIP], lms[LM.R_KNEE], lms[LM.R_ANKLE]);
      const now = performance.now();
      const dt = (now - prevT) / 1000;
      const vel = dt > 0 && dt < 0.4 ? Math.abs(aL - prevAng) / dt : 0;
      prevAng = aL; prevT = now;
      if (now - lastPush > 90) {
        lastPush = now;
        setR({ ang: Math.round(aL), vel: Math.min(280, Math.round(vel)), sym: Math.max(0, Math.round(100 - Math.abs(aL - aR))), conf: q, ready: true });
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onFrame = (_now: number, meta: any) => { if (stopped) return; draw(meta.mediaTime); rvfc = vAny.requestVideoFrameCallback(onFrame); };
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
  }, []);

  return (
    <div ref={wrapRef} className="brut-panel-raised relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.14] bg-black/50 px-4 py-3">
        <span className="brut-mono text-[0.66rem] font-bold uppercase tracking-[0.1em] text-chalk/50">joint_reader · zoom ×2</span>
        <span className="brut-mono flex items-center gap-2 text-[0.66rem] font-bold uppercase tracking-[0.1em] text-cyan">
          <span className="h-2 w-2 animate-pulse bg-cyan" /> {r.ready ? "tracking · locked" : "cargando…"}
        </span>
      </div>

      <div className="relative aspect-[4/5] w-full overflow-hidden bg-black">
        <div className="absolute inset-0" style={{ transform: "scale(2)", transformOrigin: "50% 74%" }}>
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: "contrast(1.05) saturate(0.82) brightness(0.88)" }}
            src="/hero/posedemo-v3.mp4" poster="/hero/posedemo-v3_poster.jpg"
            muted loop playsInline autoPlay preload="auto" aria-hidden
          >
            <source src="/hero/posedemo-v3.webm" type="video/webm" />
            <source src="/hero/posedemo-v3.mp4" type="video/mp4" />
          </video>
          <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />
        </div>

        <div className="pointer-events-none absolute inset-0 opacity-25" style={{ backgroundImage: "linear-gradient(rgba(0,229,255,.09) 1px, transparent 1px)", backgroundSize: "100% 3px" }} aria-hidden />
        <div className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 130px rgba(0,0,0,0.7)" }} aria-hidden />

        <div className="pointer-events-none absolute right-3 top-3 border border-cyan/40 bg-black/70 px-3 py-2 text-right">
          <p className="brut-mono text-[0.54rem] font-bold uppercase tracking-[0.12em] text-cyan/70">flexión rodilla</p>
          <p className="brut-display text-5xl leading-none text-cyan brut-glow tabular-nums">{r.ready ? `${r.ang}°` : "—"}</p>
        </div>

        <div className="pointer-events-none absolute bottom-3 left-3 right-3 grid grid-cols-3 gap-2">
          {[
            { k: "vel angular", v: r.ready ? `${r.vel}°/s` : "—" },
            { k: "simetría", v: r.ready ? `${r.sym}%` : "—" },
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
        {[{ k: "landmarks", v: "33 pts" }, { k: "frecuencia", v: "30 fps" }, { k: "eje", v: "cadera·rodilla·tobillo" }].map((x, i) => (
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
