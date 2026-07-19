"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { LivePoseDemo } from "@/components/shared/LivePoseDemo";

// Ejes que mide la evaluación. current = punto de partida típico;
// potential = techo alcanzable. El margen (potential - current) es el gancho:
// en cada capacidad hay lugar para crecer.
const dims = [
  { label: "Movilidad",   sub: "rango articular",     cur: 74, pot: 92 },
  { label: "Equilibrio",  sub: "centro de masa",      cur: 68, pot: 90 },
  { label: "Estabilidad", sub: "control lumbar",      cur: 71, pot: 88 },
  { label: "Postura",     sub: "alineación",          cur: 79, pot: 95 },
  { label: "Fuerza",      sub: "empuje / tracción",   cur: 65, pot: 87 },
  { label: "Técnica",     sub: "patrón de movimiento",cur: 72, pot: 90 },
];

function useCountUp(target: number, run: boolean, dur = 1200) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) { setN(0); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, target, dur]);
  return n;
}

function OppBar({ label, sub, cur, pot, run, delay }: { label: string; sub: string; cur: number; pot: number; run: boolean; delay: number }) {
  const n = useCountUp(cur, run);
  const gap = pot - cur;
  return (
    <div className="group border border-white/[0.14] bg-white/[0.03] p-4 transition-colors duration-150 hover:border-cyan">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="brut-mono text-sm font-bold uppercase tracking-[0.04em] text-chalk">{label}</p>
          <p className="brut-mono text-[0.64rem] uppercase tracking-[0.06em] text-chalk/40">{sub}</p>
        </div>
        <div className="text-right leading-none">
          <span className="brut-display text-3xl text-cyan tabular-nums">{n}</span>
          <span className="brut-mono ml-0.5 text-[0.58rem] text-chalk/35">/100</span>
        </div>
      </div>

      <div className="relative mt-3 h-2 bg-white/10">
        {/* margen hasta el techo alcanzable */}
        <div className="absolute inset-y-0 left-0 bg-cyan/15" style={{ width: `${pot}%` }} />
        {/* nivel actual */}
        <motion.div
          initial={{ width: 0 }}
          animate={run ? { width: `${cur}%` } : { width: 0 }}
          transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-y-0 left-0 bg-cyan"
        />
        {/* objetivo: marca pulsante en el techo */}
        <motion.span
          animate={{ opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-3px] h-[14px] w-[2px] bg-cyan brut-glow"
          style={{ left: `calc(${pot}% - 1px)` }}
        />
      </div>

      <p className="brut-mono mt-2 flex items-center gap-1.5 text-[0.64rem] font-bold uppercase tracking-[0.06em] text-cyan">
        <span className="brut-glow">▲</span> +{gap} de margen
      </p>
    </div>
  );
}

export function ComputerVision() {
  const mapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(mapRef, { once: true, margin: "-80px" });

  return (
    <section id="demo" className="brut-sec brut-concrete relative overflow-hidden bg-concrete px-6 py-32 text-chalk md:px-8 md:py-44">
      <div className="brut-grid absolute inset-0 opacity-60" aria-hidden />

      {/* Marca de agua "IA" gigante contorneada */}
      <div className="brut-display brut-outline-cyan pointer-events-none absolute -right-4 top-10 select-none text-[20rem] leading-none opacity-30 max-lg:hidden" aria-hidden>
        IA
      </div>

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-14 max-w-3xl">
          <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="brut-label mb-6 flex items-center gap-3">
            <motion.span animate={{ opacity: [1, 0.15, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="inline-block h-2 w-2 bg-cyan brut-glow" />
            [ DEMO_EN_VIVO // DETECCIÓN REAL ]
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
            className="brut-display text-[clamp(2.8rem,6.5vw,5.2rem)] text-chalk">
            Lo que la IA ve <span className="text-cyan">en tu cuerpo.</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.16 }}
            className="mt-6 max-w-xl text-base leading-7 text-chalk/65 md:text-lg">
Esto está pasando <span className="text-cyan">ahora mismo</span> en tu navegador: el mismo motor de la evaluación te lee más de 30 puntos del cuerpo y, mientras entrenás, un coach te cuenta las repeticiones, te corrige y te alienta. Sin sensores, solo con la cámara.
          </motion.p>
        </div>

        {/* 2-col: demo en vivo + mapa de oportunidad */}
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <LivePoseDemo />
            <p className="brut-mono mt-3 text-[0.62rem] uppercase tracking-[0.06em] text-chalk/35">
              te detecta, te cuenta y te corrige en vivo · activá <span className="text-cyan">🔊 voz</span> para escuchar al coach
            </p>
          </motion.div>

          <div ref={mapRef}>
            <motion.h3 initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="brut-display text-[clamp(1.9rem,3.5vw,2.8rem)] text-chalk">
              Cada eje, una <span className="text-cyan">oportunidad.</span>
            </motion.h3>
            <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="mt-3 max-w-md text-sm leading-6 text-chalk/60">
              Medimos dónde estás hoy y cuánto podés ganar en cada capacidad. Ese margen es tu plan de entrenamiento.
            </motion.p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {dims.map((d, i) => (
                <OppBar key={d.label} {...d} run={inView} delay={0.1 + i * 0.09} />
              ))}
            </div>

            <div className="mt-6 flex flex-col items-start gap-3 border-t border-white/[0.14] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="brut-mono text-[0.72rem] uppercase tracking-[0.06em] text-chalk/50">
                ¿cuánto margen tenés vos?
              </p>
              <a href="/evaluacion" className="brut-btn px-6 py-3.5 text-sm">
                Descubrí tus números →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
