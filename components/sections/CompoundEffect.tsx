"use client";
import { motion } from "framer-motion";

const milestones = [
  { time:"1 semana",  pct:4,  label:"Primeros cambios perceptibles" },
  { time:"1 mes",     pct:14, label:"Patrones de movimiento mejorados" },
  { time:"6 meses",   pct:38, label:"Transformación biomecánica visible" },
  { time:"1 año",     pct:60, label:"Un cuerpo que mueve años más joven" },
  { time:"5 años",    pct:90, label:"Rejuvenecimiento sostenido" },
];

export function CompoundEffect() {
  return (
    <section className="brut-sec brut-concrete relative overflow-hidden bg-void px-8 py-52 text-chalk">
      <div className="brut-grid absolute inset-0 opacity-50" aria-hidden />

      <div className="relative mx-auto max-w-6xl">

        {/* Centered header */}
        <div className="mb-24 text-center">
          <motion.p initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
            className="brut-label mb-6">
            [SEC_07 // EL_EFECTO_COMPUESTO]
          </motion.p>
          <motion.h2 initial={{ opacity:0,y:24 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:0.1 }}
            className="brut-display mb-7 text-[clamp(2.6rem,6vw,4.6rem)] text-chalk">
            Pequeñas mejoras hoy.<br/>
            <span className="text-cyan">Grandes cambios mañana.</span>
          </motion.h2>
          <motion.p initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:0.2 }}
            className="mx-auto max-w-[480px] text-lg leading-7 text-chalk/70">
            El movimiento consistente no suma — multiplica. Cada semana construye sobre la anterior generando un efecto compuesto en tu biología.
          </motion.p>
        </div>

        {/* Timeline bars */}
        <div className="mx-auto mb-28 flex max-w-[720px] flex-col gap-5">
          {milestones.map((m,i) => (
            <motion.div key={m.time} initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:i*0.08 }}
              className="flex items-center gap-6">
              <div className="w-[88px] shrink-0 text-right">
                <span className="brut-mono text-[0.78rem] font-bold uppercase tracking-[0.04em] text-chalk/70">{m.time}</span>
              </div>
              <div className="h-10 flex-1 overflow-hidden border border-white/[0.14] bg-white/[0.05]">
                <motion.div initial={{ width:0 }} whileInView={{ width:`${m.pct}%` }} viewport={{ once:true }}
                  transition={{ duration:1, delay:0.2+i*0.08, ease:[0.16,1,0.3,1] }}
                  className="flex h-full min-w-10 items-center bg-cyan pl-3.5">
                  {m.pct > 8 && <span className="brut-mono whitespace-nowrap text-[0.78rem] font-bold text-black">+{m.pct}%</span>}
                </motion.div>
              </div>
              <div className="hidden w-[180px] shrink-0 md:block">
                <span className="brut-mono text-[0.68rem] uppercase tracking-[0.04em] text-chalk/45">{m.label}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Panel cita */}
        <motion.div initial={{ opacity:0,y:24 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
          className="brut-panel-raised relative overflow-hidden px-8 py-14 text-center md:px-16">
          <div className="brut-hazard absolute left-0 right-0 top-0 h-1.5 opacity-70" aria-hidden />
          <p className="brut-label mb-7">[la_premisa]</p>
          <p className="brut-display mx-auto max-w-[640px] text-[clamp(1.6rem,3.2vw,2.6rem)] leading-tight text-chalk">
            "El envejecimiento físico no es lineal. Con el estímulo correcto,{" "}
            <span className="text-cyan">se puede revertir.</span>"
          </p>
          <p className="brut-mono mt-5 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-chalk/40">— Principio de plasticidad biomecánica</p>
        </motion.div>
      </div>
    </section>
  );
}
