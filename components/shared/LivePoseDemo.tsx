"use client";
// Demo central del producto: corre el MISMO motor de detección (MediaPipe
// BlazePose) que la app real, pero sobre un video de stock en loop. El
// esqueleto cian se dibuja encima del cuerpo real y las métricas (ROM de
// rodilla, postura, confianza, conteo de sentadillas) se calculan de verdad,
// cuadro a cuadro. Carga perezosa: el modelo solo se baja cuando la sección
// entra en viewport. Si MediaPipe no está disponible, queda el video real solo.
import { useEffect, useRef, useState } from "react";
import { loadMediaPipe, drawPose, poseQuality, angle, LM, resizeCanvas, type Landmark } from "@/lib/pose-engine";

type Live = { knee: number; postura: number; conf: number; reps: number; ready: boolean };

export function LivePoseDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState<Live>({ knee: 0, postura: 0, conf: 0, reps: 0, ready: false });
  const [failed, setFailed] = useState(false);

  // Estado del contador de sentadillas y throttle de re-render.
  const phaseRef = useRef<"up" | "down">("up");
  const repsRef = useRef(0);
  const lastPushRef = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!video || !canvas || !wrap) return;

    video.play().catch(() => {});
    if (reduce) return; // respetamos: queda el video real sin el análisis pesado

    let pose: InstanceType<NonNullable<typeof window.Pose>> | null = null;
    let stopped = false;
    let busy = false;
    let raf = 0;
    let started = false;

    const onResults = (results: { poseLandmarks?: Landmark[] }) => {
      if (stopped) return;
      const lms = results.poseLandmarks ?? null;
      const q = poseQuality(lms);
      drawPose(canvas, video, lms, q);
      if (!lms) return;

      // Métricas reales.
      const knee = Math.round(angle(lms[LM.L_HIP], lms[LM.L_KNEE], lms[LM.L_ANKLE]));
      const ls = lms[LM.L_SHOULDER], rs = lms[LM.R_SHOULDER];
      const tilt = Math.atan2(Math.abs(ls.y - rs.y), Math.abs(ls.x - rs.x) + 1e-4) * (180 / Math.PI);
      const postura = Math.max(0, Math.round(100 - tilt * 4));

      // Conteo de sentadillas por cruce de umbral de flexión de rodilla.
      if (knee > 0) {
        if (phaseRef.current === "up" && knee < 100) phaseRef.current = "down";
        else if (phaseRef.current === "down" && knee > 155) { phaseRef.current = "up"; repsRef.current += 1; }
      }

      const now = performance.now();
      if (now - lastPushRef.current > 140) {
        lastPushRef.current = now;
        setLive({ knee, postura, conf: q, reps: repsRef.current, ready: true });
      }
    };

    // Detección limitada a ~12fps: la inferencia de MediaPipe bloquea el hilo
    // principal, así que si se corre en cada frame el video se ve a tirones.
    // Espaciándola, el <video> (decodificado por GPU) fluye parejo y el
    // esqueleto igual se ve en vivo.
    let lastSend = 0;
    const SEND_EVERY = 80;
    const loop = async (t: number) => {
      if (stopped) return;
      if (!busy && pose && video.readyState >= 2 && !video.paused && t - lastSend >= SEND_EVERY) {
        lastSend = t;
        busy = true;
        resizeCanvas(canvas);
        try { await pose.send({ image: video }); } catch { /* frame no listo */ }
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
        // Demo (no evaluación clínica): modelo lite = mucho más liviano en el
        // hilo principal → video fluido. La precisión fina no hace falta acá.
        pose.setOptions({
          modelComplexity: 0,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.4,
          minTrackingConfidence: 0.4,
        });
        pose.onResults(onResults);
        raf = requestAnimationFrame(loop);
      } catch {
        setFailed(true);
      }
    };

    // Carga perezosa: arranca cuando entra en viewport; pausa al salir.
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { video.play().catch(() => {}); boot(); }
      else { video.pause(); }
    }, { threshold: 0.15 });
    io.observe(wrap);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      try { pose?.close(); } catch {}
    };
  }, []);

  return (
    <div ref={wrapRef} className="brut-panel-raised relative overflow-hidden">
      {/* Header tipo terminal */}
      <div className="flex items-center justify-between border-b border-white/[0.14] bg-black/50 px-4 py-3">
        <span className="brut-mono text-[0.68rem] font-bold uppercase tracking-[0.1em] text-chalk/50">
          pose_engine.live
        </span>
        <span className="brut-mono flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-cyan">
          <span className="h-2 w-2 animate-pulse bg-cyan" />
          {live.ready ? "detectando" : "cargando…"}
        </span>
      </div>

      {/* Feed real + esqueleto */}
      <div className="relative aspect-[3/4] w-full bg-black">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: "contrast(1.06) saturate(0.82) brightness(0.9)" }}
          src="/hero/posedemo-v2.mp4"
          poster="/hero/posedemo-v2_poster.jpg"
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          aria-hidden
        >
          <source src="/hero/posedemo-v2.webm" type="video/webm" />
          <source src="/hero/posedemo-v2.mp4" type="video/mp4" />
        </video>

        {/* Scanlines + viñeta sobre el feed */}
        <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(0,229,255,.08) 1px, transparent 1px)", backgroundSize: "100% 3px" }} aria-hidden />
        <div className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 120px rgba(0,0,0,0.7)" }} aria-hidden />

        {/* Esqueleto real dibujado por MediaPipe */}
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />

        {/* Esquinas técnicas */}
        {["left-2 top-2 border-l-2 border-t-2", "right-2 top-2 border-r-2 border-t-2", "left-2 bottom-2 border-l-2 border-b-2", "right-2 bottom-2 border-r-2 border-b-2"].map((c) => (
          <span key={c} className={`pointer-events-none absolute ${c} h-5 w-5 border-cyan/70`} aria-hidden />
        ))}

        {/* HUD de métricas REALES */}
        <div className="pointer-events-none absolute left-2 top-10 border border-white/[0.14] bg-black/75 px-3 py-2">
          <p className="brut-mono text-[0.58rem] font-bold uppercase tracking-[0.08em] text-chalk/40">rom_rodilla</p>
          <p className="brut-display text-2xl leading-none text-cyan">{live.ready ? `${live.knee}°` : "—"}</p>
        </div>
        <div className="pointer-events-none absolute right-2 top-10 border border-white/[0.14] bg-black/75 px-3 py-2 text-right">
          <p className="brut-mono text-[0.58rem] font-bold uppercase tracking-[0.08em] text-chalk/40">sentadillas</p>
          <p className="brut-display text-2xl leading-none text-cyan">{live.ready ? live.reps : "—"}</p>
        </div>
        <div className="pointer-events-none absolute bottom-2 left-2 right-2 flex items-center gap-3 border border-white/[0.14] bg-black/75 px-3 py-2">
          <span className="brut-mono text-[0.58rem] font-bold uppercase tracking-[0.08em] text-chalk/40">confianza</span>
          <div className="h-1.5 flex-1 bg-white/10">
            <div className="h-full bg-cyan transition-[width] duration-150" style={{ width: `${live.conf}%` }} />
          </div>
          <span className="brut-display text-sm text-cyan">{live.ready ? `${live.conf}` : "—"}</span>
        </div>
      </div>

      {failed && (
        <p className="brut-mono border-t border-white/[0.14] bg-black/50 px-4 py-2 text-[0.6rem] uppercase tracking-[0.06em] text-chalk/40">
          análisis en vivo no disponible en este dispositivo · mostrando feed real
        </p>
      )}
    </div>
  );
}
