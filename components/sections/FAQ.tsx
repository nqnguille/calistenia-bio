"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  { q:"¿Necesito ser atleta o tener experiencia previa?", a:"No. CALISTENIA.bio está diseñado para personas sedentarias, activas y todo lo que hay en el medio. El sistema se adapta a tu nivel actual y parte desde donde estás." },
  { q:"¿Cómo funciona la evaluación con webcam?", a:"Te posicionás frente a tu cámara y el sistema te guía a través de una serie de movimientos simples. La IA detecta 33 puntos en tu cuerpo y analiza cómo te movés. Toma entre 4 y 8 minutos." },
  { q:"¿Qué tan precisa es la Edad de Movimiento?", a:"Es una estimación basada en patrones biomecánicos reales, no un diagnóstico médico. Lo que importa es la tendencia a lo largo del tiempo, no el número aislado." },
  { q:"¿Con qué frecuencia tengo que hacer la evaluación?", a:"Una vez por semana. La evaluación semanal es el núcleo del producto: genera datos longitudinales y te permite ver cómo evoluciona tu cuerpo de forma objetiva." },
  { q:"¿Las sesiones diarias son muy largas?", a:"No. El mínimo es 4 minutos. El promedio es 12 minutos. Tenemos sesiones de 4, 8, 15, 20 y 45 minutos. Vos elegís según tu día." },
  { q:"¿Cuánto tiempo hasta ver resultados?", a:"La mayoría de usuarios nota cambios en las primeras 4-6 semanas. Los cambios más significativos ocurren entre las semanas 8 y 16, cuando el efecto compuesto empieza a ser visible." },
  { q:"¿Mis datos están seguros?", a:"Tus datos biomecánicos son tuyos. Los datos anonimizados que contribuyen al modelo global requieren tu consentimiento explícito. Podés revocar ese consentimiento en cualquier momento." },
];

function FAQItem({ q, a, i }: { q:string; a:string; i:number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.06 }}
      className={`border border-t-0 border-white/[0.14] first:border-t transition-colors duration-150 ${open ? "border-l-2 border-l-cyan bg-white/[0.03]" : "hover:bg-white/[0.02]"}`}
    >
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-7 px-5 py-6 text-left md:px-7"
      >
        <span className="flex items-baseline gap-4">
          <span className="brut-mono text-[0.68rem] font-bold text-cyan" aria-hidden>
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="text-base font-semibold leading-snug text-chalk">{q}</span>
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="brut-mono flex-shrink-0 text-xl font-bold text-cyan"
          aria-hidden
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl px-5 pb-7 text-[0.95rem] leading-7 text-chalk/60 md:px-7 md:pl-[4.35rem]">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQ() {
  return (
    <section className="brut-sec brut-concrete relative overflow-hidden bg-void px-8 py-52 text-chalk" id="faq">
      {/* Número de sección gigante contorneado de fondo */}
      <div className="brut-display brut-outline-text pointer-events-none absolute -right-8 top-16 select-none text-[18rem] leading-none opacity-50 max-lg:hidden" aria-hidden>
        15
      </div>

      <div className="relative mx-auto max-w-[720px]">
        <div className="mb-20 text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="brut-label mb-6"
          >
            [SEC_15 // PREGUNTAS_FRECUENTES]
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="brut-display text-[clamp(2.6rem,6vw,4.6rem)]"
          >
            Todo lo que necesitás saber.
          </motion.h2>
        </div>
        <div>
          {faqs.map((f, i) => <FAQItem key={f.q} q={f.q} a={f.a} i={i} />)}
        </div>
      </div>
    </section>
  );
}
