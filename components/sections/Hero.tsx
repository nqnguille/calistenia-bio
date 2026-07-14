"use client";
import { motion } from "framer-motion";

const C = {
  cream: "#F8F6F2",
  ink: "#151716",
  ink2: "#343A36",
  sage: "#7A8F74",
  sage2: "#AFC3A5",
  muted: "#8E9188",
  border: "rgba(255,255,255,0.12)",
  dark: "#080B0F",
  dark2: "#111821",
};

const metrics = [
  { label: "Edad movimiento", value: "54", unit: "años", tone: "#F17464", sub: "línea base" },
  { label: "Movilidad", value: "74", unit: "%", tone: C.sage2, sub: "+8%" },
  { label: "Equilibrio", value: "91", unit: "%", tone: C.sage2, sub: "alto" },
];

const skeletonPoints = [
  [50, 11], [42, 23], [58, 23], [36, 40], [64, 40], [45, 50], [55, 50], [40, 72], [60, 72],
];

export function Hero() {
  return (
    <section
      className="relative min-h-screen overflow-hidden px-6 text-cream"
      style={{
        background:
          "radial-gradient(circle at 18% 10%, rgba(122,143,116,0.28), transparent 28rem), radial-gradient(circle at 82% 20%, rgba(175,195,165,0.14), transparent 26rem), linear-gradient(140deg, #080B0F 0%, #111821 48%, #080B0F 100%)",
      }}
    >
      <div className="bio-grid absolute inset-0 opacity-80" />
      <div className="grain absolute inset-0" />
      <motion.div
        aria-hidden
        className="absolute left-[8%] top-[18%] h-72 w-72 rounded-full blur-3xl"
        style={{ background: "rgba(122,143,116,0.20)", animation: "glow-pulse 6s ease-in-out infinite" }}
      />
      <motion.div
        aria-hidden
        className="absolute bottom-[10%] right-[5%] h-96 w-96 rounded-full blur-3xl"
        style={{ background: "rgba(175,195,165,0.13)", animation: "glow-pulse 7s ease-in-out infinite reverse" }}
      />

      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-10 pt-36 pb-16 lg:grid-cols-[.94fr_1.06fr]">
        <div className="flex flex-col items-start">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="section-label mb-7"
            style={{ color: C.sage2 }}
          >
            Healthtech · IA · Longevidad
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
            className="max-w-3xl text-[clamp(3.15rem,6.2vw,5.9rem)] font-black leading-[.88] tracking-[-0.065em]"
          >
            Medí tu movimiento.
            <span className="grad-text block">Rejuvenecé tu cuerpo.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22 }}
            className="mt-7 max-w-lg text-lg font-light leading-8 text-cream/68 md:text-xl"
          >
            Una evaluación con webcam que traduce movilidad, equilibrio y control en una métrica clara: tu Edad de Movimiento.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.36 }}
            className="mt-8 flex flex-col gap-4 sm:flex-row"
          >
            <motion.a
              href="/evaluacion"
              whileHover={{ scale: 1.035, boxShadow: "0 22px 70px rgba(175,195,165,0.26)" }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center gap-3 rounded-full bg-cream px-7 py-4 text-base font-black tracking-[-0.01em] text-ink md:px-9"
            >
              Hacer evaluación gratis
              <span style={{ color: C.sage }}>→</span>
            </motion.a>
            <motion.a
              href="#producto"
              whileHover={{ scale: 1.025 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center gap-3 rounded-full border border-white/15 bg-white/[0.04] px-7 py-4 text-base font-bold text-cream/78 backdrop-blur-xl hover:bg-white/[0.08] md:px-9"
            >
              Ver la métrica
              <span className="text-cream/35">↓</span>
            </motion.a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.56 }}
            className="mt-6 flex flex-wrap gap-2"
          >
            {["5 minutos", "Solo webcam", "Sin tarjeta", "Resultado inmediato"].map((t) => (
              <span key={t} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-4 py-2 text-sm font-semibold text-cream/58 backdrop-blur-xl">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: C.sage2 }} />
                {t}
              </span>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 34, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.28 }}
          className="relative mx-auto w-full max-w-[500px] lg:ml-auto"
          style={{ perspective: 1000 }}
        >
          <div className="absolute -inset-10 rounded-[3rem] bg-sage/20 blur-3xl" />

          <div className="glass-panel relative overflow-hidden rounded-[2rem] p-4 md:rounded-[2.5rem] md:p-5" style={{ animation: "float-slow 7s ease-in-out infinite" }}>
            <div className="flex items-center justify-between border-b border-white/10 px-2 pb-4">
              <div className="flex gap-2">
                {["#F37D73", "#E9C46A", "#9BC898"].map((c) => <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />)}
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1.5 text-[.68rem] font-bold uppercase tracking-[.18em] text-cream/50">
                <motion.span animate={{ opacity: [1, .2, 1] }} transition={{ duration: 1.3, repeat: Infinity }} className="h-1.5 w-1.5 rounded-full" style={{ background: C.sage2 }} />
                Live scan
              </div>
            </div>

            <div className="grid gap-4 pt-4 md:grid-cols-[1fr_1.05fr]">
              <div className="relative min-h-[355px] overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#070A0D]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(175,195,165,0.24),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px)", backgroundSize: "100% 24px" }} />
                <div className="scan-line absolute left-6 right-6 top-0 h-px" style={{ animation: "scan-y 3.6s ease-in-out infinite" }} />

                <svg viewBox="0 0 100 100" className="absolute inset-x-7 top-8 mx-auto h-[285px] w-[220px] overflow-visible" aria-hidden>
                  <defs>
                    <filter id="heroGlow"><feGaussianBlur stdDeviation="1.7" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                  </defs>
                  <g filter="url(#heroGlow)" stroke={C.sage2} strokeWidth="1.7" strokeLinecap="round" fill="none" opacity="0.95">
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
                    <motion.circle
                      key={`${x}-${y}`}
                      cx={x}
                      cy={y}
                      r={i === 0 ? 2.1 : 1.8}
                      fill={C.sage2}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [1, 1.35, 1], opacity: 1 }}
                      transition={{ delay: 0.7 + i * 0.06, duration: 2.4, repeat: Infinity, repeatDelay: 1.4 }}
                    />
                  ))}
                </svg>

                <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-xl">
                  <div className="mb-2 flex items-center justify-between text-[.68rem] font-bold uppercase tracking-[.16em] text-cream/35">
                    Biomecánica
                    <span className="text-sage2">33 landmarks</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div initial={{ width: "18%" }} animate={{ width: "82%" }} transition={{ duration: 2.4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} className="h-full rounded-full" style={{ background: C.sage2 }} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.055] p-5">
                  <p className="text-[.68rem] font-black uppercase tracking-[.18em] text-cream/36">Resultado estimado</p>
                  <div className="mt-4 flex items-end gap-3">
                    <span className="text-7xl font-black leading-none tracking-[-.08em] text-cream">54</span>
                    <span className="mb-2 text-sm font-bold text-cream/38">años</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-cream/58">Tu cuerpo se mueve 14 años más viejo que tu edad cronológica.</p>
                </div>

                {metrics.map((m, i) => (
                  <motion.div
                    key={m.label}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.72 + i * 0.08 }}
                    className="rounded-[1.2rem] border border-white/10 bg-white/[0.045] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[.68rem] font-black uppercase tracking-[.14em] text-cream/36">{m.label}</span>
                      <span className="text-xs font-bold" style={{ color: m.tone }}>{m.sub}</span>
                    </div>
                    <div className="mt-3 flex items-end justify-between gap-4">
                      <span className="text-3xl font-black leading-none tracking-[-.04em]" style={{ color: m.tone }}>{m.value}<span className="ml-1 text-xs text-cream/35">{m.unit}</span></span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                        <motion.div initial={{ width: 0 }} animate={{ width: i === 0 ? "58%" : i === 1 ? "74%" : "91%" }} transition={{ duration: 1.3, delay: 0.85 + i * 0.1 }} className="h-full rounded-full" style={{ background: m.tone }} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
        <span className="text-[.62rem] font-black uppercase tracking-[.28em] text-cream/28">Scroll</span>
        <motion.div animate={{ height: [24, 42, 24] }} transition={{ duration: 2.4, repeat: Infinity }} className="w-px bg-gradient-to-b from-sage2/70 to-transparent" />
      </motion.div>
    </section>
  );
}
