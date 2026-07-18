"use client";
import { motion } from "framer-motion";

const stats = [
  { n:"10+",  l:"años de rejuvenecimiento posible" },
  { n:"4min", l:"es suficiente para empezar" },
  { n:"∞",    l:"progreso compuesto en el tiempo" },
];

export function Longevity() {
  return (
    <section className="brut-sec brut-concrete relative overflow-hidden bg-void px-8 py-52 text-chalk">
      <div className="relative mx-auto max-w-6xl">
        {/* Franja de peligro como separador superior */}
        <div className="brut-hazard mb-16 h-[1.5px] opacity-60" aria-hidden />

        <motion.div initial={{ opacity:0, y:32 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          className="brut-panel-raised px-8 py-20 md:px-20 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="brut-label mb-6">[SEC_11 // LA_FILOSOFIA]</p>
            <h2 className="brut-display mb-4 text-[clamp(2.6rem,6vw,4.6rem)] text-chalk">
              No entrenamos para el verano.
            </h2>
            <h2 className="brut-display mb-8 text-[clamp(2.6rem,6vw,4.6rem)] text-cyan">
              Entrenamos para los próximos 40 años.
            </h2>
            <p className="mb-14 text-base leading-7 text-chalk/65 md:text-lg">
              La obsesión por la estética destruyó la relación de millones de personas con el movimiento. Nosotros proponemos otra cosa: moverte bien, durante mucho tiempo, porque te hace sentir joven.
            </p>
            <div className="mb-12 grid grid-cols-3 gap-8 border-t border-white/10 pt-12">
              {stats.map(s => (
                <div key={s.l} className="text-center">
                  <p className="brut-display mb-2 text-[clamp(2rem,4vw,3.5rem)] leading-none text-chalk">{s.n}</p>
                  <p className="brut-mono text-[0.72rem] leading-6 text-chalk/45">{s.l}</p>
                </div>
              ))}
            </div>
            <a href="/evaluacion" className="brut-btn px-9 py-4 text-sm">
              Comenzar mi evaluación →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
