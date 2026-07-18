"use client";
import { motion } from "framer-motion";

const active = new Set([0,1,2,4,5,7,8,9,11,14,15,16,17,18,21,22,23,24,25,28,29,30,31,32,33,34]);
const streak = new Set([21,22,23,24,25,28,29,30,31,32,33,34]);
const days = Array.from({ length:35 },(_,i) => ({ active:active.has(i), streak:streak.has(i) }));

export function Adherence() {
  return (
    <section className="brut-sec brut-concrete relative overflow-hidden bg-concrete px-8 py-52 text-chalk">
      {/* Número de sección gigante contorneado de fondo */}
      <div className="brut-display brut-outline-text pointer-events-none absolute -right-8 top-10 select-none text-[18rem] leading-none opacity-50 max-lg:hidden" aria-hidden>
        08
      </div>

      <div className="relative mx-auto max-w-6xl">

        {/* Centered header */}
        <div className="mb-24 text-center">
          <motion.p initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
            className="brut-label mb-6">
            [SEC_08 // ADHERENCIA]
          </motion.p>
          <motion.h2 initial={{ opacity:0,y:24 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:0.1 }}
            className="brut-display mb-7 text-[clamp(2.6rem,6vw,4.6rem)] text-chalk">
            El entrenamiento más importante<br/>
            <span className="text-cyan">es el que no abandonás.</span>
          </motion.h2>
          <motion.p initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:0.2 }}
            className="mx-auto max-w-[480px] text-lg leading-7 text-chalk/70">
            4 minutos cuentan tanto como 45. Lo que importa es que mañana también lo hagas.
          </motion.p>
        </div>

        {/* 2-col: features + calendar */}
        <div className="grid items-start gap-16 lg:grid-cols-2">
          <motion.div initial={{ opacity:0,x:-24 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:true }}
            className="flex flex-col">
            {[
              { icon:"⏱", text:"Micro-sesiones desde 4 minutos" },
              { icon:"🧠", text:"Recordatorios basados en tu ritmo circadiano" },
              { icon:"🎯", text:"Objetivos semanales adaptados a tu vida real" },
              { icon:"📈", text:"El progreso visible genera su propio momentum" },
            ].map(f => (
              <div key={f.text} className="-mt-px flex items-center gap-5 border border-white/[0.14] bg-white/[0.03] px-5 py-5 first:mt-0">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/[0.14] bg-black/40 text-xl" aria-hidden>{f.icon}</span>
                <span className="text-base leading-7 text-chalk/70">{f.text}</span>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity:0,x:24 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:true }} transition={{ delay:0.15 }}
            className="brut-panel-raised p-8 md:p-10">

            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="brut-label mb-2 text-[0.62rem]">[racha_actual]</p>
                <p className="brut-display text-6xl leading-none text-chalk">12 <span className="brut-mono text-base font-bold uppercase text-chalk/40">días</span></p>
              </div>
              <span className="text-3xl" aria-hidden>🔥</span>
            </div>

            {/* Heatmap */}
            <div className="mb-4 grid grid-cols-7 gap-1">
              {["L","M","X","J","V","S","D"].map(d => (
                <p key={d} className="brut-mono mb-1 text-center text-[0.62rem] font-bold text-chalk/40">{d}</p>
              ))}
              {days.map((d,i) => (
                <motion.div key={i} initial={{ scale:0,opacity:0 }} whileInView={{ scale:1,opacity:1 }}
                  viewport={{ once:true }} transition={{ delay:0.01*i, duration:0.2 }}
                  className={`aspect-square ${d.streak ? "bg-cyan" : d.active ? "bg-cyan/25" : "bg-white/10"}`} />
              ))}
            </div>

            <div className="brut-mono mb-6 flex gap-7 text-[0.68rem] font-bold uppercase tracking-[0.06em] text-chalk/45">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 bg-cyan" /><span>Racha activa</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 bg-cyan/25" /><span>Día activo</span>
              </div>
            </div>

            <div className="grid grid-cols-3 border-t border-white/[0.14] pt-5">
              {[{ n:"26", l:"días activos" }, { n:"4min", l:"sesión mínima" }, { n:"87%", l:"consistencia" }].map(s => (
                <div key={s.l} className="-ml-px border-l border-white/[0.14] text-center first:ml-0 first:border-l-0">
                  <p className="brut-display text-3xl text-cyan">{s.n}</p>
                  <p className="brut-mono mt-1 text-[0.62rem] font-bold uppercase tracking-[0.06em] text-chalk/45">{s.l}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
