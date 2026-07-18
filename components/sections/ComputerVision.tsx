"use client";
import { motion } from "framer-motion";

const CYAN = "#00E5FF";

const detections = [
  { label:"Postura",    sub:"Alineación cervical",      score:82, icon:"⊕" },
  { label:"Equilibrio", sub:"Centro de masa estable",   score:91, icon:"◎" },
  { label:"Estabilidad",sub:"Control lumbar activo",    score:74, icon:"◈" },
  { label:"Movilidad",  sub:"Cadera 118° ROM",          score:88, icon:"◉" },
  { label:"Técnica",    sub:"Patrón de movimiento",     score:79, icon:"⊗" },
];

export function ComputerVision() {
  return (
    <section className="brut-sec brut-concrete relative overflow-hidden bg-concrete px-8 py-52 text-chalk">
      <div className="brut-grid absolute inset-0 opacity-60" aria-hidden />

      {/* Número de sección gigante contorneado de fondo */}
      <div className="brut-display brut-outline-text pointer-events-none absolute -left-6 top-16 select-none text-[18rem] leading-none opacity-50 max-lg:hidden" aria-hidden>
        10
      </div>

      <div className="relative mx-auto max-w-6xl">

        {/* Centered header */}
        <div className="mb-24 text-center">
          <motion.p initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            className="brut-label mb-6">
            [SEC_10 // VISION_POR_COMPUTADORA]
          </motion.p>
          <motion.h2 initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.1 }}
            className="brut-display mb-7 text-[clamp(2.6rem,6vw,4.6rem)] text-chalk">
            Lo que la IA ve en tu cuerpo.
          </motion.h2>
          <motion.p initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.2 }}
            className="mx-auto max-w-md text-base leading-7 text-chalk/60 md:text-lg">
            En cada evaluación, el sistema analiza más de 30 variables biomecánicas simultáneamente. Sin contacto. Sin sensores. Solo tu webcam.
          </motion.p>
        </div>

        {/* 2-col: body scan + detections */}
        <div className="grid items-start gap-10 lg:grid-cols-2">

          {/* Body scan card */}
          <motion.div initial={{ opacity:0, x:-24 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}
            className="brut-panel-raised relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.14] bg-black/40 px-4 py-3">
              <span className="brut-mono text-[0.68rem] font-bold uppercase tracking-[0.1em] text-chalk/50">
                body_scan.exe
              </span>
              <span className="brut-mono flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-cyan">
                <motion.span animate={{ opacity:[1, 0.15, 1] }} transition={{ duration:1.2, repeat:Infinity }} className="h-2 w-2 bg-cyan" />
                33_landmarks
              </span>
            </div>

            <div className="relative bg-black">
              <div className="absolute inset-0 opacity-40" style={{ backgroundImage:"linear-gradient(rgba(0,229,255,.06) 1px, transparent 1px)", backgroundSize:"100% 22px" }} aria-hidden />
              <svg viewBox="0 0 300 400" className="relative w-full max-h-[360px]" aria-hidden>
                {/* Silhouette */}
                <ellipse cx="150" cy="45" rx="28" ry="32" fill="none" stroke="rgba(0,229,255,0.4)" strokeWidth="1.5" />
                <path d="M 115 75 L 95 130 L 85 190" fill="none" stroke="rgba(0,229,255,0.4)" strokeWidth="1.5" strokeLinecap="square" />
                <path d="M 185 75 L 205 130 L 215 190" fill="none" stroke="rgba(0,229,255,0.4)" strokeWidth="1.5" strokeLinecap="square" />
                <path d="M 115 75 L 185 75 L 190 160 L 150 175 L 110 160 Z" fill="none" stroke="rgba(0,229,255,0.4)" strokeWidth="1.5" />
                <path d="M 120 175 L 115 260 L 110 330" fill="none" stroke="rgba(0,229,255,0.4)" strokeWidth="1.5" strokeLinecap="square" />
                <path d="M 180 175 L 185 260 L 190 330" fill="none" stroke="rgba(0,229,255,0.4)" strokeWidth="1.5" strokeLinecap="square" />
                {/* Landmark squares */}
                {[[150,45],[150,80],[115,78],[185,78],[85,128],[215,128],[150,175],[120,175],[180,175],[115,258],[185,258],[110,328],[190,328]].map(([cx,cy],i) => (
                  <motion.rect key={i} x={cx-3.2} y={cy-3.2} width={6.4} height={6.4} fill={CYAN}
                    initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:0.9 }}
                    transition={{ delay:0.05*i, duration:0.3 }} className="brut-glow" />
                ))}
                {/* Scan beam */}
                <motion.rect x="60" width="180" height="2" fill={CYAN} fillOpacity="0.6"
                  initial={{ y:30 }} animate={{ y:[30,350,30], opacity:[0,0.6,0] }}
                  transition={{ duration:3.5, repeat:Infinity, ease:"linear", delay:1 }} />
              </svg>
              {/* Floating badges */}
              {[
                { cls:"right-4 top-4", label:"postura", val:"82%" },
                { cls:"bottom-20 left-4", label:"rom", val:"118°" },
              ].map((b,i) => (
                <motion.div key={b.label} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.2+i*0.3 }}
                  className={`absolute ${b.cls} border border-white/[0.14] bg-black/80 px-3.5 py-2`}>
                  <p className="brut-mono text-[0.62rem] font-bold uppercase tracking-[0.08em] text-chalk/40">{b.label}</p>
                  <p className="brut-display text-lg text-cyan">{b.val}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Detection bars */}
          <motion.div initial={{ opacity:0, x:24 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ delay:0.15 }}
            className="flex flex-col gap-3">
            {detections.map((d,i) => (
              <motion.div key={d.label} initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.1+i*0.08 }}
                className="border border-white/[0.14] bg-white/[0.03] p-6 transition-colors duration-150 hover:border-cyan">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl text-cyan" aria-hidden>{d.icon}</span>
                    <div>
                      <p className="brut-mono text-sm font-bold uppercase tracking-[0.04em] text-chalk">{d.label}</p>
                      <p className="mt-0.5 text-[0.78rem] text-chalk/50">{d.sub}</p>
                    </div>
                  </div>
                  <span className="brut-display text-2xl leading-none text-cyan">{d.score}</span>
                </div>
                <div className="h-1.5 bg-white/10">
                  <motion.div initial={{ width:0 }} whileInView={{ width:`${d.score}%` }} viewport={{ once:true }}
                    transition={{ duration:0.9, ease:[0.16,1,0.3,1] }}
                    className="h-full bg-cyan" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
