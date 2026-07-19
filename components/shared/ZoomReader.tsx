"use client";
// Mega-zoom REAL: corre MediaPipe sobre el video y dibuja el esqueleto con
// drawPose (mismo motor). El video y el canvas del esqueleto viven en el mismo
// contenedor y se ESCALAN juntos con CSS → el esqueleto queda siempre pegado al
// cuerpo, sin desfase posible. Las lecturas (ángulo, velocidad, simetría,
// confianza) se calculan de los landmarks reales.
import { useEffect, useRef, useState } from "react";
import { loadMediaPipe, drawPose, poseQuality, angle, LM, resizeCanvas, type Landmark } from "@/lib/pose-engine";

type R = { ang: number; vel: number; sym: number; conf: number; ready: boolean };

export function ZoomReader() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [r, setR] = useState<R>({ ang: 0, vel: 0, sym: 0, conf: 0, ready: false });
  const [failed, setFailed] = useState(false);
  const prevRef = useRef({ ang: 0, t: 0 });
  const pushRef = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const video = videoRef.current, canvas = canvasRef.current, wrap = wrapRef.current;
    if (!video || !canvas || !wrap) return;
    video.play().catch(() => {});
    if (reduce) return;

    let pose: InstanceType<NonNullable<typeof window.Pose>> | null = null;
    let stopped = false, busy = false, raf = 0, started = false;

    const onResults = (res: { poseLandmarks?: Landmark[] }) => {
      if (stopped) return;
      const lms = res.poseLandmarks ?? null;
      const q = poseQuality(lms);
      drawPose(canvas, video, lms, q);
      if (!lms) return;
      const aL = angle(lms[LM.L_HIP], lms[LM.L_KNEE], lms[LM.L_ANKLE]);
      const aR = angle(lms[LM.R_HIP], lms[LM.R_KNEE], lms[LM.R_ANKLE]);
      const now = performance.now();
      const dt = (now - prevRef.current.t) / 1000;
      const vel = dt > 0 && dt < 1 ? Math.abs(aL - prevRef.current.ang) / dt : 0;
      prevRef.current = { ang: aL, t: now };
      if (now - pushRef.current > 110) {
        pushRef.current = now;
        setR({
          ang: Math.round(aL),
          vel: Math.min(220, Math.round(vel)),
          sym: Math.max(0, Math.round(100 - Math.abs(aL - aR))),
          conf: q,
          ready: true,
        });
      }
    };

    let lastSend = 0;
    const loop = async (t: number) => {
      if (stopped) return;
      if (!busy && pose && video.readyState >= 2 && !video.paused && t - lastSend >= 80) {
        lastSend = t; busy = true; resizeCanvas(canvas);
        try { await pose.send({ image: video }); } catch {}
        busy = false;
      }
      raf = requestAnimationFrame(loop);
    };

    const boot = async () => {
      if (started || stopped) return;
      started = true;
      try {
        await loadMediaPipe();
        if (stopped || !window.Pose) return;
        pose = new window.Pose({ locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${f}` });
        pose.setOptions({ modelComplexity: 0, smoothLandmarks: true, enableSegmentation: false, minDetectionConfidence: 0.4, minTrackingConfidence: 0.4 });
        pose.onResults(onResults);
        raf = requestAnimationFrame(loop);
      } catch { setFailed(true); }
    };

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { video.play().catch(() => {}); boot(); }
      else video.pause();
    }, { threshold: 0.15 });
    io.observe(wrap);
    return () => { stopped = true; cancelAnimationFrame(raf); io.disconnect(); try { pose?.close(); } catch {} };
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
        {/* video + esqueleto escalados JUNTOS → siempre alineados */}
        <div className="absolute inset-0" style={{ transform: "scale(2)", transformOrigin: "50% 74%" }}>
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: "contrast(1.05) saturate(0.82) brightness(0.88)" }}
            src="/hero/posedemo-v3.mp4" poster="/hero/posedemo-v3_poster.jpg"
            muted loop playsInline autoPlay preload="metadata" aria-hidden
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
          análisis en vivo no disponible en este dispositivo · mostrando feed real
        </p>
      )}
    </div>
  );
}
