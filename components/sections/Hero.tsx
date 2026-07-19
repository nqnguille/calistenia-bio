"use client";
import { motion } from "framer-motion";
import { ShaderHero } from "@/components/shared/ShaderHero";

const CYAN = "#00E5FF";

const metrics = [
  { label: "edad_mov", value: "54", unit: "años", tone: "#FF5A5A", pct: "58%" },
  { label: "movilidad", value: "74", unit: "%", tone: CYAN, pct: "74%" },
  { label: "equilibrio", value: "91", unit: "%", tone: CYAN, pct: "91%" },
];

export function Hero() {
  return (
    <section id="hero" className="brut-sec relative">
      <ShaderHero
        videoSrc="/hero/landing.mp4"
        videoWebm="/hero/landing.webm"
        poster="/hero/landing_poster.jpg"
        fallbackSrc="/hero/landing_poster_duo.jpg"
        minH="100svh"
        darken={0.4}
      >
        <div className="mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-5 pb-16 pt-32 md:px-6 md:pt-36">
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="brut-label mb-6 flex items-center gap-3"
          >
            <span className="inline-block h-2 w-2 bg-cyan brut-glow" />
            [SYS_01 // HEALTHTECH · IA · LONGEVIDAD]
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
            className="brut-display text-[clamp(3.6rem,9.5vw,8.5rem)] drop-shadow-[0_4px_40px_rgba(0,0,0,0.7)]"
          >
            Medí tu
            <br />
            movimiento.
            <br />
            <span className="text-cyan brut-glow">Rejuvenecé</span>
            <br />
            tu cuerpo.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="mt-7 max-w-lg border-l-2 border-cyan bg-black/30 py-1 pl-4 text-base leading-7 text-chalk/85 backdrop-blur-sm md:text-lg"
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
            <a href="#producto" className="brut-btn-ghost bg-black/30 px-8 py-4 text-sm backdrop-blur-sm">
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
              <span key={t} className="brut-mono -ml-px border border-white/15 bg-black/40 px-3.5 py-2 text-[0.68rem] font-bold uppercase tracking-[0.06em] text-chalk/70 backdrop-blur-sm first:ml-0">
                {t}
              </span>
            ))}
          </motion.div>
        </div>

        {/* HUD flotante: resultado estimado en vivo sobre el video */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="pointer-events-none absolute bottom-6 right-4 hidden w-[260px] border border-white/15 bg-black/60 p-4 backdrop-blur-md lg:block"
        >
          <div className="brut-mono mb-3 flex items-center justify-between text-[0.6rem] font-bold uppercase tracking-[0.12em] text-chalk/45">
            <span>[scan_module.exe]</span>
            <span className="flex items-center gap-1.5 text-cyan">
              <motion.span animate={{ opacity: [1, 0.15, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="h-1.5 w-1.5 bg-cyan" />
              live
            </span>
          </div>
          <div className="flex items-end gap-2">
            <span className="brut-display text-5xl" style={{ color: "#FF5A5A" }}>54</span>
            <span className="brut-mono mb-1.5 text-[0.62rem] font-bold uppercase text-chalk/40">años · edad mov.</span>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {metrics.map((m) => (
              <div key={m.label} className="brut-mono flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.06em]">
                <span className="w-16 text-chalk/40">{m.label}</span>
                <div className="h-1 flex-1 bg-white/10">
                  <motion.div initial={{ width: 0 }} animate={{ width: m.pct }} transition={{ duration: 1.2, delay: 0.9 }} className="h-full" style={{ background: m.tone }} />
                </div>
                <span style={{ color: m.tone }}>{m.value}{m.unit === "%" ? "%" : ""}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </ShaderHero>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
        <span className="brut-mono text-[0.58rem] font-bold uppercase tracking-[0.28em] text-chalk/40">scroll</span>
        <motion.div animate={{ height: [22, 40, 22] }} transition={{ duration: 2.2, repeat: Infinity }} className="w-px bg-cyan/70" />
      </motion.div>
    </section>
  );
}
