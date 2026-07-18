"use client";
import { motion } from "framer-motion";

const steps = [
  { n: "01", title: "Abrís la cámara", text: "Sin wearables ni sensores. El análisis corre desde una experiencia guiada y simple." },
  { n: "02", title: "La IA lee tu movimiento", text: "Detecta puntos corporales, rangos articulares, estabilidad y asimetrías funcionales." },
  { n: "03", title: "Recibís tu plan", text: "Una métrica clara, foco semanal y micro-sesiones para mejorar sin abandonar." },
];

export function Experience() {
  return (
    <section className="brut-sec brut-concrete relative overflow-hidden border-t border-white/[0.14] bg-concrete px-8 py-32 text-chalk">
      {/* Número de sección gigante contorneado de fondo */}
      <div className="brut-display brut-outline-text pointer-events-none absolute -left-6 bottom-8 select-none text-[20rem] leading-none opacity-50 max-lg:hidden" aria-hidden>
        02
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[.92fr_1.08fr]">
        <div>
          <motion.p initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="brut-label mb-6">
            [SEC_02 // LA_EXPERIENCIA]
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="brut-display max-w-xl text-[clamp(2.6rem,6vw,4.6rem)] text-chalk"
          >
            Una evaluación física que se siente como <span className="text-cyan">tecnología del futuro.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16 }}
            className="mt-7 max-w-lg border-l-2 border-cyan pl-4 text-lg leading-8 text-chalk/65"
          >
            La landing tiene que vender una idea simple: medir el movimiento debería ser tan fácil como medirte el sueño o la frecuencia cardíaca.
          </motion.p>
        </div>

        <div className="grid gap-0">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group relative -mt-px border border-white/[0.14] bg-white/[0.03] p-7 transition-colors first:mt-0 hover:border-cyan"
            >
              <span className="brut-mono absolute right-4 top-3 text-[0.62rem] font-bold text-chalk/30" aria-hidden>
                +
              </span>
              <div className="relative flex gap-6">
                <div className="brut-display flex h-14 w-14 shrink-0 items-center justify-center border border-cyan bg-void text-xl text-cyan">
                  {s.n}
                </div>
                <div>
                  <h3 className="brut-display text-2xl text-chalk">{s.title}</h3>
                  <p className="mt-2 max-w-xl text-base leading-7 text-chalk/60">{s.text}</p>
                </div>
              </div>
            </motion.div>
          ))}
          <div className="brut-hazard mt-6 h-[1.5px] w-full opacity-60" aria-hidden />
        </div>
      </div>
    </section>
  );
}
