"use client";
import { motion } from "framer-motion";

const CYAN = "#00E5FF";

const metrics = [
  { l:"Edad de Movimiento", v:"46", u:"años", d:"−8 años" },
  { l:"Nivel Físico",        v:"3",  u:"/5",   d:"+1 nivel" },
  { l:"Adherencia",          v:"87", u:"%",    d:"+12%" },
  { l:"Racha",               v:"12", u:"días", d:"🔥" },
];

const weekly = [
  { l:"Movilidad",       curr:82, prev:74 },
  { l:"Equilibrio",      curr:91, prev:84 },
  { l:"Fuerza funcional",curr:70, prev:65 },
  { l:"Coordinación",    curr:77, prev:71 },
];

export function Dashboard() {
  return (
    <section className="brut-sec brut-concrete relative overflow-hidden bg-void px-8 py-52 text-chalk">
      <div className="brut-grid absolute inset-0 opacity-60" aria-hidden />

      <div className="relative mx-auto max-w-6xl">

        {/* Centered header */}
        <div className="mb-24 text-center">
          <motion.p initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            className="brut-label mb-6">
            [SEC_13 // EL_DASHBOARD]
          </motion.p>
          <motion.h2 initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.1 }}
            className="brut-display mb-7 text-[clamp(2.6rem,6vw,4.6rem)] text-chalk">
            Tu salud motora, <span className="text-cyan">de un vistazo.</span>
          </motion.h2>
          <motion.p initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.2 }}
            className="mx-auto max-w-md text-base leading-7 text-chalk/60 md:text-lg">
            Todo tu progreso, tus métricas y tu evolución semanal en un solo lugar.
          </motion.p>
        </div>

        {/* Dashboard card */}
        <motion.div initial={{ opacity:0, y:32 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.2 }}
          className="brut-panel-raised relative overflow-hidden">
          {/* Esquinas marcadas */}
          <span className="brut-mono absolute left-2 top-1.5 text-xs text-cyan/50" aria-hidden>+</span>
          <span className="brut-mono absolute right-2 top-1.5 text-xs text-cyan/50" aria-hidden>+</span>

          {/* Header bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.14] bg-black/40 px-8 py-5">
            <div>
              <p className="brut-mono mb-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-chalk/40">Hola, Martina</p>
              <p className="brut-display text-2xl text-chalk">Semana 8 de tu plan</p>
            </div>
            <div className="flex items-center gap-2 border border-cyan/40 bg-cyan/[0.06] px-4 py-2">
              <motion.span animate={{ opacity:[1, 0.2, 1] }} transition={{ duration:1.4, repeat:Infinity }} className="h-2 w-2 bg-cyan" />
              <span className="brut-mono text-[0.72rem] font-bold uppercase tracking-[0.08em] text-cyan">Mejorando</span>
            </div>
          </div>

          {/* 4 metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4">
            {metrics.map((m,i) => (
              <motion.div key={m.l} initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.08*i }}
                className="-ml-px -mt-px border border-white/[0.14] p-6">
                <p className="brut-mono mb-3 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-chalk/40">{m.l}</p>
                <div className="mb-1.5 flex items-end gap-1.5">
                  <p className="brut-display text-5xl leading-none text-chalk">{m.v}</p>
                  <p className="brut-mono mb-0.5 text-xs font-bold uppercase text-chalk/40">{m.u}</p>
                </div>
                <p className="brut-mono text-[0.78rem] font-bold text-cyan">{m.d}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid border-t border-white/[0.14] md:grid-cols-2">
            {/* Radar */}
            <div className="border-b border-white/[0.14] bg-black/30 p-10 md:border-b-0 md:border-r">
              <p className="brut-label mb-7 text-[0.62rem]">[perfil_de_movimiento]</p>
              <svg viewBox="0 0 220 200" className="mx-auto block w-full max-w-[220px]">
                {[0.25,0.5,0.75,1].map((s,gi) => (
                  <polygon key={gi}
                    points={[0,1,2,3,4,5].map(j => { const a=(j*60-90)*Math.PI/180; return `${110+Math.cos(a)*85*s},${100+Math.sin(a)*75*s}`; }).join(" ")}
                    fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
                ))}
                <polygon points="110,30 172,65 163,130 110,155 57,130 48,65"
                  fill="rgba(0,229,255,0.12)" stroke={CYAN} strokeWidth="1.5" />
                {["Movilidad","Estabilidad","Equilibrio","Fuerza","Coordinación","Técnica"].map((l,j) => {
                  const a=(j*60-90)*Math.PI/180;
                  return <text key={l} x={110+Math.cos(a)*100} y={100+Math.sin(a)*92} fontSize="9" fill="rgba(237,237,237,0.5)" textAnchor="middle" fontWeight="500">{l}</text>;
                })}
              </svg>
            </div>

            {/* Progress bars */}
            <div className="p-10">
              <p className="brut-label mb-7 text-[0.62rem]">[evolucion_semanal]</p>
              <div className="flex flex-col gap-7">
                {weekly.map(m => (
                  <div key={m.l}>
                    <div className="mb-2 flex justify-between">
                      <span className="brut-mono text-[0.78rem] font-bold uppercase tracking-[0.04em] text-chalk/60">{m.l}</span>
                      <span className="brut-mono text-[0.78rem] font-bold text-cyan">+{m.curr-m.prev}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10">
                      <motion.div initial={{ width:`${m.prev}%` }} whileInView={{ width:`${m.curr}%` }} viewport={{ once:true }}
                        transition={{ duration:1, ease:[0.16,1,0.3,1] }}
                        className="h-full bg-cyan" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
