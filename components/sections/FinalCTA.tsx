"use client";
import { motion } from "framer-motion";

export function FinalCTA() {
  return (
    <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden px-6 py-36 text-cream" style={{ background: "radial-gradient(circle at 50% 34%, rgba(122,143,116,0.22), transparent 28rem), linear-gradient(145deg,#080B0F 0%,#111821 52%,#05070A 100%)" }}>
      <div className="bio-grid absolute inset-0 opacity-80" />
      <div className="grain absolute inset-0" />

      <div className="absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.035]" />
      {[320, 520, 740].map((size, i) => (
        <motion.div
          key={size}
          className="absolute left-1/2 top-1/2 rounded-full border border-white/[0.045]"
          style={{ width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }}
          animate={{ scale: [1, 1.045, 1], opacity: [0.35, 0.72, 0.35] }}
          transition={{ duration: 4.2 + i, repeat: Infinity, ease: "easeInOut", delay: i * .25 }}
        />
      ))}

      <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-label mb-9" style={{ color: "#AFC3A5" }}>
          CALISTENIA.bio
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 42 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          className="text-[clamp(3.6rem,10vw,9rem)] font-black leading-[.82] tracking-[-.075em]"
        >
          El cuerpo cambia.
          <span className="grad-text block">Ahora podés medirlo.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .8, delay: .24 }}
          className="mt-8 max-w-2xl text-xl font-light leading-9 text-cream/58 md:text-2xl"
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
          <motion.a
            href="/evaluacion"
            whileHover={{ scale: 1.04, boxShadow: "0 26px 80px rgba(248,246,242,0.20)" }}
            whileTap={{ scale: .98 }}
            className="inline-flex items-center gap-3 rounded-full bg-cream px-9 py-5 text-lg font-black tracking-[-.02em] text-ink md:text-xl"
          >
            Descubrir mi Edad de Movimiento
            <span className="text-sage">→</span>
          </motion.a>
          <a href="#faq" className="rounded-full border border-white/12 bg-white/[0.04] px-8 py-5 text-base font-bold text-cream/58 backdrop-blur-xl transition hover:bg-white/[0.08]">
            Tengo preguntas
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: .55 }}
          className="mt-8 flex flex-wrap justify-center gap-2 text-sm font-semibold text-cream/38"
        >
          {["Evaluación gratuita", "Sin tarjeta", "5 minutos", "Solo webcam"].map((t) => (
            <span key={t} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">{t}</span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
