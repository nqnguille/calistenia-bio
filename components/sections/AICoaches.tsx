"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const coaches = [
  { id:"scientist", emoji:"🔬", name:"El Científico", style:"Preciso · Datos · Objetivo",     msg:'"Tu ángulo de dorsiflexión mejoró 8° esta semana. Eso corresponde a una reducción de 2.3 años en tu Edad de Movimiento. Protocolo ajustado."' },
  { id:"mentor",    emoji:"🧭", name:"El Mentor",    style:"Guía · Experiencia · Paciencia",  msg:'"Llevás tres semanas siendo consistente. Eso es más difícil de lo que parece. Ahora construimos sobre eso."' },
  { id:"military",  emoji:"⚡", name:"El Militar",   style:"Directo · Disciplinado · Claro",   msg:'"Dos días sin sesión. No me importa el porqué. Hoy hacés la evaluación. Sin negociación."' },
  { id:"friend",    emoji:"🤝", name:"El Amigo",     style:"Cercano · Empático · Motivador",   msg:'"¡Eso estuvo increíble! Sé que la semana estuvo pesada pero igual lo hiciste. ¿Qué tal si mañana probamos algo nuevo?"' },
  { id:"zen",       emoji:"🌿", name:"El Zen",       style:"Calmo · Presencia · Proceso",       msg:'"El cuerpo habla cuando lo escuchás. Hoy tu equilibrio mejoró sin que lo forzaras. Así funciona el cambio real."' },
];

export function AICoaches() {
  const [sel, setSel] = useState(coaches[0]);
  return (
    <section className="brut-sec brut-concrete relative overflow-hidden bg-void px-8 py-52 text-chalk" id="coaches">
      <div className="brut-grid absolute inset-0 opacity-50" aria-hidden />

      <div className="relative mx-auto max-w-6xl">

        {/* Centered header */}
        <div className="mb-24 text-center">
          <motion.p initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
            className="brut-label mb-6">
            [SEC_09 // COACHING_CON_IA]
          </motion.p>
          <motion.h2 initial={{ opacity:0,y:24 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:0.1 }}
            className="brut-display mb-7 text-[clamp(2.6rem,6vw,4.6rem)] text-chalk">
            Misma inteligencia. <span className="text-cyan">Tu estilo.</span>
          </motion.h2>
          <motion.p initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:0.2 }}
            className="mx-auto max-w-[460px] text-lg leading-7 text-chalk/70">
            El motor de IA es el mismo para todos. Lo que cambia es la personalidad del coach. Elegís el estilo que mejor funciona para tu mente.
          </motion.p>
        </div>

        {/* 2-col: selector + preview */}
        <div className="grid items-start gap-14 lg:grid-cols-2">
          <motion.div initial={{ opacity:0,x:-24 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:true }}
            className="flex flex-col">
            {coaches.map(c => (
              <button key={c.id} onClick={() => setSel(c)}
                className={`-mt-px flex w-full cursor-pointer items-center gap-5 border px-5 py-4 text-left transition-colors duration-150 first:mt-0 ${
                  sel.id===c.id
                    ? "border-cyan bg-cyan/10"
                    : "border-white/[0.14] bg-white/[0.03] hover:border-cyan/60 hover:bg-white/[0.05]"
                }`}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/[0.14] bg-black/40 text-xl" aria-hidden>{c.emoji}</span>
                <div>
                  <p className={`brut-mono text-sm font-bold uppercase tracking-[0.04em] ${sel.id===c.id ? "text-cyan" : "text-chalk"}`}>{c.name}</p>
                  <p className="brut-mono mt-1 text-[0.68rem] uppercase tracking-[0.04em] text-chalk/45">{c.style}</p>
                </div>
                {sel.id===c.id && <span className="brut-mono ml-auto font-bold text-cyan">✓</span>}
              </button>
            ))}
          </motion.div>

          <div className="sticky top-24">
            <AnimatePresence mode="wait">
              <motion.div key={sel.id} initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-12 }} transition={{ duration:0.3 }}
                className="brut-panel-raised p-8 md:p-9">
                <div className="mb-6 flex items-center justify-between border-b border-white/[0.14] pb-4">
                  <span className="brut-mono text-[0.68rem] font-bold uppercase tracking-[0.1em] text-chalk/50">coach_module.exe</span>
                  <span className="brut-label text-[0.62rem]">[{sel.id}]</span>
                </div>
                <div className="mb-6 flex items-center gap-5">
                  <div className="flex h-12 w-12 items-center justify-center border border-cyan/40 bg-cyan/10 text-xl" aria-hidden>{sel.emoji}</div>
                  <div>
                    <p className="brut-display text-2xl text-chalk">{sel.name}</p>
                    <p className="brut-mono mt-1 text-[0.68rem] uppercase tracking-[0.04em] text-chalk/45">{sel.style}</p>
                  </div>
                </div>
                <div className="border border-white/[0.14] bg-black/60 px-7 py-6">
                  <p className="brut-mono text-[0.9rem] leading-7 text-chalk/75">{sel.msg}</p>
                </div>
                <div className="brut-mono mt-5 flex items-center gap-2.5 text-[0.68rem] font-bold uppercase tracking-[0.06em] text-chalk/45">
                  <motion.div animate={{ opacity:[1,0.15,1] }} transition={{ duration:1.5, repeat:Infinity }} className="h-2 w-2 bg-cyan" aria-hidden />
                  Mismo motor de IA · Estilo diferente
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
