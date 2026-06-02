"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn } from "@/components/ui/FadeIn";

const coaches = [
  {
    id: "scientist",
    emoji: "🔬",
    name: "El Científico",
    style: "Preciso · Basado en datos · Objetivo",
    color: "#203040",
    sample: '"Tu ángulo de dorsiflexión mejoró 8° esta semana. Eso corresponde a una reducción de 2.3 años en tu Edad de Movimiento. Protocolo ajustado."',
  },
  {
    id: "mentor",
    emoji: "🧭",
    name: "El Mentor",
    style: "Guía · Experiencia · Paciencia",
    color: "#6B7B68",
    sample: '"Llevás tres semanas siendo consistente. Eso es más difícil de lo que parece. Ahora vamos a construir sobre eso y llevarte al siguiente nivel."',
  },
  {
    id: "military",
    emoji: "⚡",
    name: "El Militar",
    style: "Directo · Disciplinado · Sin excusas",
    color: "#1B1B1B",
    sample: '"Dos días sin sesión. No me interesa el porqué. Hoy hacés la evaluación y mañana estás de vuelta. Sin negociación."',
  },
  {
    id: "friend",
    emoji: "🤝",
    name: "El Amigo",
    style: "Cercano · Empático · Motivador",
    color: "#8A9E87",
    sample: '"¡Eso estuvo increíble! Sé que la semana estuvo pesada, pero igualmente lo hiciste. ¿Qué tal si mañana probamos algo nuevo?"',
  },
  {
    id: "zen",
    emoji: "🌿",
    name: "El Zen",
    style: "Calmo · Presencia · Proceso",
    color: "#6B7B68",
    sample: '"El cuerpo habla cuando lo escuchás. Hoy tu equilibrio mejoró sin que lo forzaras. Así es como funciona el cambio real."',
  },
];

export function AICoaches() {
  const [selected, setSelected] = useState(coaches[0]);

  return (
    <section className="bg-cream py-32 px-6" id="coaches">
      <div className="max-w-5xl mx-auto">
        <FadeIn className="mb-20 grid md:grid-cols-2 gap-12 items-end">
          <div>
            <p className="text-sm font-medium text-sage tracking-widest uppercase mb-6">Coaching con IA</p>
            <h2 className="text-4xl md:text-5xl font-semibold text-ink leading-tight tracking-tight">
              Misma inteligencia.<br />
              <span className="text-muted">Tu estilo.</span>
            </h2>
          </div>
          <p className="text-lg text-ink2 leading-relaxed">
            El motor de IA es el mismo para todos. Lo que cambia es la personalidad
            del coach. Elegís el estilo que mejor funciona para tu mente.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Coach selector */}
          <FadeIn>
            <div className="flex flex-col gap-3">
              {coaches.map((c) => (
                <motion.button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-4 p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                    selected.id === c.id
                      ? "border-ink bg-ink text-cream"
                      : "border-border bg-cream2 text-ink hover:border-ink/30"
                  }`}
                >
                  <span className="text-2xl">{c.emoji}</span>
                  <div>
                    <p className={`font-semibold ${selected.id === c.id ? "text-cream" : "text-ink"}`}>
                      {c.name}
                    </p>
                    <p className={`text-xs mt-0.5 ${selected.id === c.id ? "text-cream/60" : "text-muted"}`}>
                      {c.style}
                    </p>
                  </div>
                  {selected.id === c.id && (
                    <motion.span
                      layoutId="check"
                      className="ml-auto text-cream/80"
                    >✓</motion.span>
                  )}
                </motion.button>
              ))}
            </div>
          </FadeIn>

          {/* Sample message */}
          <FadeIn delay={0.2}>
            <div className="sticky top-24">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35 }}
                  className="bg-dark rounded-3xl p-8 flex flex-col gap-6"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                      style={{ background: selected.color + "33" }}
                    >
                      {selected.emoji}
                    </div>
                    <div>
                      <p className="text-cream font-semibold">{selected.name}</p>
                      <p className="text-muted text-xs">{selected.style}</p>
                    </div>
                  </div>

                  <div className="bg-dark2 rounded-2xl p-5">
                    <p className="text-cream/80 text-sm leading-relaxed italic">
                      {selected.sample}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted">
                    <div className="w-2 h-2 rounded-full bg-sage animate-pulse" />
                    Mismo motor de IA · Estilo diferente
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
