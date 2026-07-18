"use client";
import { motion } from "framer-motion";

const pillars = [
  {
    icon: "◎",
    title: "Cada movimiento",
    desc: "Cada sesión genera datos biomecánicos anonimizados que alimentan el modelo global y mejoran la precisión para todos.",
  },
  {
    icon: "⊕",
    title: "Cada evaluación",
    desc: "Las evaluaciones semanales crean una línea de tiempo longitudinal de salud motora única en el mundo.",
  },
  {
    icon: "◈",
    title: "Cada mejora",
    desc: "Los avances individuales se convierten en evidencia de que el movimiento consistente rejuvenece el cuerpo.",
  },
];

export function RealWorldEvidence() {
  return (
    <section className="brut-sec brut-concrete relative overflow-hidden bg-concrete px-8 py-52 text-chalk">
      <div className="brut-grid absolute inset-0 opacity-60" aria-hidden />

      {/* Número de sección gigante contorneado de fondo */}
      <div className="brut-display brut-outline-text pointer-events-none absolute -right-10 bottom-10 select-none text-[18rem] leading-none opacity-50 max-lg:hidden" aria-hidden>
        12
      </div>

      <div className="relative mx-auto max-w-6xl">
        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="brut-label mb-6"
        >
          [SEC_12 // EVIDENCIA_DEL_MUNDO_REAL]
        </motion.p>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="brut-display mb-6 max-w-2xl text-[clamp(2.6rem,6vw,4.6rem)] text-chalk"
        >
          Construimos evidencia del mundo real.
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.18 }}
          className="mb-16 max-w-lg text-base leading-7 text-chalk/60 md:text-lg"
        >
          Cada usuario contribuye —con su consentimiento— a la base de datos más grande
          del mundo sobre salud motora en adultos. No hipótesis. Datos reales.
        </motion.p>

        {/* Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.55 }}
              className="flex flex-col gap-4 border border-white/[0.14] bg-white/[0.03] p-7 transition-colors duration-150 hover:border-cyan"
            >
              <span className="text-2xl text-cyan" aria-hidden>{p.icon}</span>
              <h3 className="brut-display text-2xl text-chalk">{p.title}</h3>
              <p className="flex-1 text-base leading-7 text-chalk/60">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Transparency box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="brut-panel-raised border-cyan/40 p-8 md:p-9"
        >
          <p className="brut-label mb-4 text-[0.62rem]">[compromiso_de_transparencia]</p>
          <p className="max-w-2xl text-base leading-7 text-chalk/75 md:text-lg">
            No hacemos afirmaciones médicas. No prometemos curaciones. Lo que sí prometemos:
            medición rigurosa, metodología transparente, y evidencia observable de que el
            movimiento consistente mejora cómo funciona tu cuerpo.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
