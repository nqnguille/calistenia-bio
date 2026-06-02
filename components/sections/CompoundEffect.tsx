"use client";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/ui/FadeIn";

const milestones = [
  { time: "1 semana",  improvement: 2,   label: "Primeros cambios perceptibles" },
  { time: "1 mes",     improvement: 8,   label: "Patrones de movimiento mejorados" },
  { time: "6 meses",   improvement: 24,  label: "Transformación biomecánica visible" },
  { time: "1 año",     improvement: 40,  label: "Un cuerpo que mueve años más joven" },
  { time: "5 años",    improvement: 80,  label: "Rejuvenecimiento sostenido" },
];

export function CompoundEffect() {
  return (
    <section className="bg-cream py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <FadeIn className="text-center mb-20">
          <p className="text-sm font-medium text-sage tracking-widest uppercase mb-6">El efecto compuesto</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-ink leading-tight tracking-tight mb-6">
            Pequeñas mejoras hoy.<br />
            <span className="text-muted">Grandes cambios mañana.</span>
          </h2>
          <p className="text-lg text-ink2 max-w-xl mx-auto leading-relaxed">
            El movimiento consistente no suma. Multiplica. Cada semana de práctica
            construye sobre la anterior, generando un efecto compuesto en tu biología.
          </p>
        </FadeIn>

        {/* Timeline bars */}
        <div className="flex flex-col gap-6 max-w-3xl mx-auto">
          {milestones.map((m, i) => (
            <FadeIn key={m.time} delay={i * 0.1}>
              <div className="flex items-center gap-6">
                <div className="w-20 text-right shrink-0">
                  <span className="text-sm font-medium text-ink2">{m.time}</span>
                </div>
                <div className="flex-1 flex items-center gap-4">
                  <div className="flex-1 h-8 bg-cream2 rounded-full overflow-hidden border border-border">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${m.improvement}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full flex items-center pl-4"
                      style={{
                        background: `linear-gradient(90deg, #6B7B68, #8A9E87)`,
                        minWidth: "2rem",
                      }}
                    >
                      <span className="text-white text-xs font-semibold whitespace-nowrap">
                        {m.improvement > 10 ? `+${m.improvement}%` : ""}
                      </span>
                    </motion.div>
                  </div>
                  <span className="text-sm text-ink2 shrink-0 hidden md:block">{m.label}</span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.5} className="mt-20 bg-dark rounded-3xl p-10 md:p-14 text-center">
          <p className="text-sm text-sage uppercase tracking-widest mb-4">La premisa</p>
          <p className="text-3xl md:text-4xl font-semibold text-cream leading-tight max-w-2xl mx-auto">
            "El envejecimiento físico no es lineal.
            <span className="text-sage"> Con el estímulo correcto, se puede revertir.</span>"
          </p>
          <p className="text-muted text-sm mt-6">— Principio de plasticidad biomecánica</p>
        </FadeIn>
      </div>
    </section>
  );
}
