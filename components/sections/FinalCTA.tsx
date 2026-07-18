"use client";
import { motion } from "framer-motion";

export function FinalCTA() {
  return (
    <section className="brut-sec brut-concrete relative flex min-h-[92vh] items-center justify-center overflow-hidden bg-concrete px-6 py-36 text-chalk">
      {/* Franja de peligro superior */}
      <div className="brut-hazard absolute inset-x-0 top-0 h-1.5" aria-hidden />
      <div className="brut-grid absolute inset-0 opacity-60" aria-hidden />

      {/* Texto contorneado gigante de fondo */}
      <div className="brut-display brut-outline-cyan pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[clamp(8rem,24vw,22rem)] leading-none opacity-25" aria-hidden>
        MEDILO
      </div>

      {/* Esquinas marcadas */}
      <span className="brut-mono absolute left-5 top-6 text-sm text-chalk/30" aria-hidden>+</span>
      <span className="brut-mono absolute right-5 top-6 text-sm text-chalk/30" aria-hidden>+</span>
      <span className="brut-mono absolute bottom-5 left-5 text-sm text-chalk/30" aria-hidden>+</span>
      <span className="brut-mono absolute bottom-5 right-5 text-sm text-chalk/30" aria-hidden>+</span>

      <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="brut-label mb-9"
        >
          [SEC_16 // CALISTENIA.bio]
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 42 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          className="brut-display text-[clamp(3.6rem,10vw,9rem)]"
        >
          El cuerpo cambia.
          <span className="block text-cyan">Ahora podés medirlo.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .8, delay: .24 }}
          className="mt-8 max-w-2xl border-l-2 border-cyan pl-4 text-left text-lg leading-8 text-chalk/60 md:text-xl"
        >
          Empezá con una evaluación gratuita. En pocos minutos tenés una línea base y un motivo concreto para moverte mejor esta semana.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .7, delay: .38 }}
          className="mt-11 flex flex-col items-center gap-4 sm:flex-row"
        >
          <a href="/evaluacion" className="brut-btn px-10 py-5 text-base md:text-lg">
            Descubrir mi Edad de Movimiento →
          </a>
          <a href="#faq" className="brut-btn-ghost px-9 py-5 text-sm md:text-base">
            Tengo preguntas
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: .55 }}
          className="mt-9 flex flex-wrap justify-center"
        >
          {["evaluación_gratuita", "sin_tarjeta", "5_minutos", "solo_webcam"].map((t) => (
            <span key={t} className="brut-mono -ml-px border border-white/15 px-3.5 py-2 text-[0.68rem] font-bold uppercase tracking-[0.06em] text-chalk/55 first:ml-0">
              {t}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
