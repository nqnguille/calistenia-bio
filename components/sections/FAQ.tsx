"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn } from "@/components/ui/FadeIn";

const faqs = [
  {
    q: "¿Necesito ser atleta o tener experiencia previa?",
    a: "No. CALISTENIA.bio está diseñado para personas sedentarias, activas y todo lo que hay en el medio. El sistema se adapta a tu nivel actual y parte desde donde estás, no desde donde deberías estar.",
  },
  {
    q: "¿Cómo funciona la evaluación con webcam?",
    a: "Te posicionás frente a tu cámara y el sistema te guía a través de una serie de movimientos simples. La IA detecta 33 puntos en tu cuerpo y analiza cómo te movés. Toma entre 4 y 8 minutos. Sin ropa especial, sin equipamiento.",
  },
  {
    q: "¿Qué tan precisa es la Edad de Movimiento?",
    a: "La métrica es una estimación basada en patrones biomecánicos reales. No es un diagnóstico médico. Es una herramienta de seguimiento de tu evolución funcional. Lo que importa es la tendencia a lo largo del tiempo, no el número aislado.",
  },
  {
    q: "¿Con qué frecuencia tengo que hacer la evaluación?",
    a: "Una vez por semana. La evaluación semanal es el núcleo del producto: es lo que genera datos longitudinales y te permite ver cómo evoluciona tu cuerpo de forma objetiva.",
  },
  {
    q: "¿Las sesiones diarias son muy largas?",
    a: "No. El mínimo es 4 minutos. El promedio es 12 minutos. Tenemos sesiones de 4, 8, 15, 20 y 45 minutos. Vos elegís según tu día. El sistema toma en cuenta tu adherencia real, no la ideal.",
  },
  {
    q: "¿Mis datos están seguros?",
    a: "Tus datos biomecánicos son tuyos. Los datos anonimizados que contribuyen al modelo global requieren tu consentimiento explícito. Podés revocar ese consentimiento en cualquier momento. No vendemos datos a terceros.",
  },
  {
    q: "¿Cuánto tiempo hasta ver resultados?",
    a: "La mayoría de usuarios nota cambios perceptibles en su Edad de Movimiento en las primeras 4-6 semanas. Los cambios más significativos ocurren entre las semanas 8 y 16, cuando el efecto compuesto empieza a ser visible.",
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
      className="border-b border-border"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-6 text-left gap-4 cursor-pointer"
      >
        <span className="font-medium text-ink text-[15px] leading-snug">{q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-muted text-xl shrink-0"
        >+</motion.span>
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
            <p className="text-ink2 text-sm leading-relaxed pb-6 max-w-2xl">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQ() {
  return (
    <section className="bg-cream2 py-32 px-6" id="faq">
      <div className="max-w-3xl mx-auto">
        <FadeIn className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-semibold text-ink leading-tight tracking-tight">
            Preguntas frecuentes
          </h2>
        </FadeIn>
        <div>
          {faqs.map((f, i) => (
            <FAQItem key={f.q} q={f.q} a={f.a} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
