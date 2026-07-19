"use client";
import { motion } from "framer-motion";
import { ZoomReader } from "@/components/shared/ZoomReader";

const legend = [
  { t: "Ángulo articular", d: "El grado exacto de flexión en cada articulación, cuadro a cuadro." },
  { t: "Velocidad angular", d: "Qué tan rápido se mueve la articulación — control y explosividad." },
  { t: "Simetría izq / der", d: "Compara ambos lados para detectar compensaciones." },
  { t: "Confianza de lectura", d: "Cuán segura está la IA de cada punto que ubica." },
];

export function ReadingMethod() {
  return (
    <section id="lectura" className="brut-sec brut-concrete relative overflow-hidden border-t border-white/[0.14] bg-concrete px-6 py-32 text-chalk md:px-8 md:py-44">
      <div className="brut-grid absolute inset-0 opacity-50" aria-hidden />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-14 max-w-3xl">
          <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="brut-label mb-6">
            [ LECTURA // BIOMECÁNICA EN DETALLE ]
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
            className="brut-display text-[clamp(2.6rem,6vw,4.8rem)] text-chalk">
            Cómo lee la tecnología <span className="text-cyan">tu cuerpo.</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.16 }}
            className="mt-6 max-w-2xl text-base leading-7 text-chalk/65 md:text-lg">
            Sobre cada articulación, treinta veces por segundo, la IA mide el ángulo, la velocidad y la simetría. Acá, con zoom, la rodilla durante una sentadilla — el esqueleto sale de la detección real, siempre pegado al cuerpo.
          </motion.p>
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-12">
          <ZoomReader />

          <div className="flex flex-col gap-0">
            <p className="brut-label mb-5 text-[0.62rem]">[ qué_mide_en_cada_articulación ]</p>
            {legend.map((l, i) => (
              <motion.div key={l.t} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="-mt-px flex gap-4 border border-white/[0.14] bg-white/[0.03] p-5 transition-colors hover:border-cyan">
                <span className="brut-display text-2xl leading-none text-cyan/80">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="brut-mono text-sm font-bold uppercase tracking-[0.04em] text-chalk">{l.t}</p>
                  <p className="mt-1.5 text-[0.9rem] leading-6 text-chalk/60">{l.d}</p>
                </div>
              </motion.div>
            ))}
            <p className="brut-mono mt-5 text-[0.62rem] uppercase leading-5 tracking-[0.06em] text-chalk/35">
              todo desde el navegador · sin sensores · sin ropa especial · solo tu cámara
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
