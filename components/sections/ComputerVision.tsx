"use client";
import { motion } from "framer-motion";
import { LivePoseDemo } from "@/components/shared/LivePoseDemo";

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

          {/* Detección en vivo REAL: MediaPipe sobre video, esqueleto + métricas */}
          <motion.div initial={{ opacity:0, x:-24 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}>
            <LivePoseDemo />
            <p className="brut-mono mt-3 text-[0.62rem] uppercase tracking-[0.06em] text-chalk/35">
              detección real · mismo motor que la evaluación · corriendo en tu navegador
            </p>
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
