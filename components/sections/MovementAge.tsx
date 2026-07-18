"use client";
import { motion } from "framer-motion";

const RED = "#FF5A5A";

const bars = [
  { l: "Movilidad articular", v: 62 },
  { l: "Control postural", v: 78 },
  { l: "Velocidad de reacción", v: 55 },
  { l: "Fuerza funcional", v: 70 },
];

export function MovementAge() {
  return (
    <section className="brut-sec brut-concrete relative overflow-hidden border-t border-white/[0.14] bg-void px-8 py-52 text-chalk" id="producto">
      {/* Número de sección gigante contorneado de fondo */}
      <div className="brut-display brut-outline-text pointer-events-none absolute -left-8 top-20 select-none text-[20rem] leading-none opacity-50 max-lg:hidden" aria-hidden>
        05
      </div>

      <div className="relative mx-auto max-w-6xl">
        {/* Centered header */}
        <div className="mb-28 text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="brut-label mb-6"
          >
            [SEC_05 // LA_MÉTRICA_CENTRAL]
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="brut-display mb-7 text-[clamp(2.6rem,6vw,4.6rem)] text-chalk"
          >
            Edad de <span className="text-cyan">Movimiento</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-[480px] text-lg leading-7 text-chalk/60"
          >
            Una sola cifra que resume cómo se mueve tu cuerpo comparado con lo que debería para tu edad cronológica.
          </motion.p>
        </div>

        {/* 2-col: numbers + explanation */}
        <div className="grid items-start gap-16 lg:grid-cols-2">
          {/* Giant number comparison */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-8"
          >
            <div>
              <p className="brut-label mb-2 text-chalk/45">[edad_cronológica]</p>
              <p className="brut-display brut-outline-text text-[clamp(5rem,10vw,9rem)] leading-[0.9]">40</p>
            </div>
            <div className="flex items-center gap-7 pl-2">
              <div className="h-12 w-px bg-white/[0.2]" aria-hidden />
              <p className="brut-mono text-[0.78rem] uppercase text-chalk/50">vs. tu movimiento real</p>
            </div>
            <div>
              <p className="brut-label mb-2">[edad_de_movimiento]</p>
              <p className="brut-display text-[clamp(5rem,10vw,9rem)] leading-[0.9]" style={{ color: RED }}>54</p>
              <div className="brut-hazard mt-4 h-[1.5px] w-full max-w-sm opacity-60" aria-hidden />
              <p className="brut-mono mt-3 text-[0.85rem] font-bold uppercase" style={{ color: RED }}>
                Tu cuerpo mueve 14 años más viejo de lo que sos.
              </p>
            </div>
          </motion.div>

          {/* Explanation card */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="brut-panel-raised flex flex-col gap-7 p-10"
          >
            <div>
              <h3 className="brut-display mb-3 text-2xl text-chalk">¿Cómo se calcula?</h3>
              <p className="text-base leading-7 text-chalk/60">
                La IA analiza tus patrones de movimiento y los compara con miles de perfiles biomecánicos reales. El resultado es una edad funcional, no una estimación genética.
              </p>
            </div>
            {bars.map((m) => (
              <div key={m.l}>
                <div className="brut-mono mb-2 flex justify-between text-[0.72rem] font-bold uppercase tracking-[0.06em]">
                  <span className="text-chalk/55">{m.l}</span>
                  <span className="text-cyan">{m.v}%</span>
                </div>
                <div className="h-1.5 overflow-hidden bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${m.v}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-cyan"
                  />
                </div>
              </div>
            ))}
            <div className="border border-cyan/40 bg-cyan/[0.06] p-4">
              <p className="text-[0.9rem] leading-7 text-chalk/70">
                <strong className="brut-mono uppercase text-cyan">Buena noticia:</strong> En 8 semanas de práctica consistente, la mayoría de usuarios reduce su Edad de Movimiento entre 3 y 9 años.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
