"use client";
import { motion } from "framer-motion";

const CYAN = "#00E5FF";

const metrics = [
  { label: "edad_movimiento", value: "54", unit: "años", tone: "#FF5A5A", sub: "línea base", pct: "58%" },
  { label: "movilidad", value: "74", unit: "%", tone: CYAN, sub: "+8%", pct: "74%" },
  { label: "equilibrio", value: "91", unit: "%", tone: CYAN, sub: "alto", pct: "91%" },
];

const skeletonPoints = [
  [50, 11], [42, 23], [58, 23], [36, 40], [64, 40], [45, 50], [55, 50], [40, 72], [60, 72],
];

export function Hero() {
  return (
    <section className="brut-sec brut-concrete relative min-h-screen overflow-hidden bg-void px-5 text-chalk md:px-6">
      <div className="brut-grid absolute inset-0 opacity-70" />

      {/* Número gigante contorneado de fondo */}
      <div className="brut-display brut-outline-text pointer-events-none absolute -right-8 top-24 select-none text-[26rem] leading-none opacity-60 max-lg:hidden" aria-hidden>
        54
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-12 pb-16 pt-32 md:pt-36 lg:grid-cols-[1.05fr_.95fr]">
        <div className="flex flex-col items-start">
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="brut-label mb-6"
          >
            [SYS_01 // HEALTHTECH · IA · LONGEVIDAD]
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
            className="brut-display text-[clamp(3.6rem,9.5vw,8rem)]"
          >
            Medí tu
            <br />
            movimiento.
            <br />
            <span className="text-cyan">Rejuvenecé</span>
            <br />
            tu cuerpo.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="mt-7 max-w-lg border-l-2 border-cyan pl-4 text-base leading-7 text-chalk/70 md:text-lg"
          >
            Una evaluación con webcam que traduce movilidad, equilibrio y control en una métrica clara: tu Edad de Movimiento.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.38 }}
            className="mt-9 flex flex-col gap-4 sm:flex-row"
          >
            <a href="/evaluacion" className="brut-btn px-8 py-4 text-sm">
              Empezar evaluación →
            </a>
            <a href="#producto" className="brut-btn-ghost px-8 py-4 text-sm">
              Ver la métrica ↓
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex flex-wrap"
          >
            {["5_minutos", "solo_webcam", "sin_tarjeta", "resultado_inmediato"].map((t) => (
              <span key={t} className="brut-mono -ml-px border border-white/15 px-3.5 py-2 text-[0.68rem] font-bold uppercase tracking-[0.06em] text-chalk/55 first:ml-0">
                {t}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Panel escáner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="relative mx-auto w-full max-w-[480px] lg:ml-auto"
        >
          <div className="brut-panel-raised relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.14] bg-black/40 px-4 py-3">
              <span className="brut-mono text-[0.68rem] font-bold uppercase tracking-[0.1em] text-chalk/50">
                scan_module.exe
              </span>
              <span className="brut-mono flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-cyan">
                <motion.span animate={{ opacity: [1, 0.15, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="h-2 w-2 bg-cyan" />
                live_scan
              </span>
            </div>

            <div className="grid gap-3 p-3 md:grid-cols-[1fr_1.02fr] md:p-4">
              <div className="relative min-h-[340px] overflow-hidden border border-white/[0.14] bg-black">
                <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(rgba(0,229,255,.07) 1px, transparent 1px)", backgroundSize: "100% 22px" }} />
                <div className="brut-scan-line absolute left-4 right-4 top-0 h-px" style={{ animation: "scan-y 3.6s ease-in-out infinite" }} />

                <svg viewBox="0 0 100 100" className="absolute inset-x-6 top-7 mx-auto h-[275px] w-[210px] overflow-visible" aria-hidden>
                  <g stroke={CYAN} strokeWidth="1.6" strokeLinecap="square" fill="none" opacity="0.9" className="brut-glow">
                    <circle cx="50" cy="7" r="5.5" />
                    <path d="M50 13 L50 49" />
                    <path d="M42 23 L58 23" />
                    <path d="M42 23 L34 42" />
                    <path d="M58 23 L66 42" />
                    <path d="M50 49 L41 73" />
                    <path d="M50 49 L59 73" />
                    <path d="M41 73 L38 93" />
                    <path d="M59 73 L62 93" />
                  </g>
                  {skeletonPoints.map(([x, y], i) => (
                    <motion.rect
                      key={`${x}-${y}`}
                      x={x - 1.6}
                      y={y - 1.6}
                      width={3.2}
                      height={3.2}
                      fill={CYAN}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ delay: 0.7 + i * 0.06, duration: 2.2, repeat: Infinity, repeatDelay: 1.2 }}
                    />
                  ))}
                </svg>

                <div className="absolute bottom-3 left-3 right-3 border border-white/[0.14] bg-black/70 p-3">
                  <div className="brut-mono mb-2 flex items-center justify-between text-[0.62rem] font-bold uppercase tracking-[0.1em] text-chalk/40">
                    biomecánica
                    <span className="text-cyan">33_landmarks</span>
                  </div>
                  <div className="h-1.5 bg-white/10">
                    <motion.div initial={{ width: "18%" }} animate={{ width: "82%" }} transition={{ duration: 2.4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} className="h-full bg-cyan" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="border border-white/[0.14] bg-white/[0.03] p-4">
                  <p className="brut-label text-[0.62rem]">[resultado_estimado]</p>
                  <div className="mt-3 flex items-end gap-3">
                    <span className="brut-display text-7xl text-chalk">54</span>
                    <span className="brut-mono mb-2 text-xs font-bold uppercase text-chalk/40">años</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-chalk/60">Tu cuerpo se mueve 14 años más viejo que tu edad cronológica.</p>
                </div>

                {metrics.map((m, i) => (
                  <motion.div
                    key={m.label}
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.08 }}
                    className="border border-white/[0.14] bg-white/[0.02] p-3.5"
                  >
                    <div className="brut-mono flex items-center justify-between text-[0.62rem] font-bold uppercase tracking-[0.08em]">
                      <span className="text-chalk/40">{m.label}</span>
                      <span style={{ color: m.tone }}>{m.sub}</span>
                    </div>
                    <div className="mt-2.5 flex items-end justify-between gap-4">
                      <span className="brut-display text-3xl leading-none" style={{ color: m.tone }}>
                        {m.value}
                        <span className="brut-mono ml-1 text-[0.62rem] text-chalk/35">{m.unit}</span>
                      </span>
                      <div className="h-1.5 flex-1 bg-white/10">
                        <motion.div initial={{ width: 0 }} animate={{ width: m.pct }} transition={{ duration: 1.1, delay: 0.85 + i * 0.1 }} className="h-full" style={{ background: m.tone }} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
        <span className="brut-mono text-[0.58rem] font-bold uppercase tracking-[0.28em] text-chalk/30">scroll</span>
        <motion.div animate={{ height: [22, 40, 22] }} transition={{ duration: 2.2, repeat: Infinity }} className="w-px bg-cyan/60" />
      </motion.div>
    </section>
  );
}
