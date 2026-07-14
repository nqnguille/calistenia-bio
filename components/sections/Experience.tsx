"use client";
import { motion } from "framer-motion";

const C = { cream:"#F8F6F2", cream2:"#F1EEE8", ink:"#151716", ink2:"#343A36", sage:"#7A8F74", sage2:"#AFC3A5", muted:"#8E9188", border:"#DED9CE", dark:"#080B0F" };

const steps = [
  { n: "01", title: "Abrís la cámara", text: "Sin wearables ni sensores. El análisis corre desde una experiencia guiada y simple." },
  { n: "02", title: "La IA lee tu movimiento", text: "Detecta puntos corporales, rangos articulares, estabilidad y asimetrías funcionales." },
  { n: "03", title: "Recibís tu plan", text: "Una métrica clara, foco semanal y micro-sesiones para mejorar sin abandonar." },
];

export function Experience() {
  return (
    <section className="px-8 py-32" style={{ background: C.cream, borderTop: `1px solid ${C.border}` }}>
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[.92fr_1.08fr]">
        <div>
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-tag mb-7">
            La experiencia
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: .08 }} className="max-w-xl text-[clamp(2.6rem,5.4vw,5.4rem)] font-black leading-[.9] tracking-[-.06em]" style={{ color: C.ink }}>
            Una evaluación física que se siente como tecnología del futuro.
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: .16 }} className="mt-7 max-w-lg text-lg font-light leading-8" style={{ color: C.ink2 }}>
            La landing tiene que vender una idea simple: medir el movimiento debería ser tan fácil como medirte el sueño o la frecuencia cardíaca.
          </motion.p>
        </div>

        <div className="grid gap-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * .08 }}
              className="soft-card group relative overflow-hidden rounded-[1.7rem] p-7"
            >
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-sage/10 blur-3xl transition-transform duration-500 group-hover:scale-150" />
              <div className="relative flex gap-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-sm font-black" style={{ background: C.ink, color: C.cream }}>
                  {s.n}
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-[-.04em]" style={{ color: C.ink }}>{s.title}</h3>
                  <p className="mt-2 max-w-xl text-base font-light leading-7" style={{ color: C.ink2 }}>{s.text}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
