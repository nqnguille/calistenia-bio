"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { FadeIn } from "@/components/ui/FadeIn";

function AnimatedNumber({ target, duration = 1.5 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(target - 14);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const start = target - 14;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start + (target - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);

  return <span ref={ref}>{value}</span>;
}

export function MovementAge() {
  return (
    <section className="bg-cream py-32 px-6 overflow-hidden" id="product">
      <div className="max-w-5xl mx-auto">
        <FadeIn className="mb-4">
          <p className="text-sm font-medium text-sage tracking-widest uppercase">La métrica central</p>
        </FadeIn>

        <FadeIn delay={0.1} className="mb-20">
          <h2 className="text-4xl md:text-5xl font-semibold text-ink leading-tight tracking-tight max-w-2xl">
            Edad de Movimiento
          </h2>
          <p className="text-lg text-ink2 mt-4 max-w-xl leading-relaxed">
            Una sola cifra que resume cómo se mueve tu cuerpo comparado
            con lo que debería para tu edad cronológica.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Number display */}
          <FadeIn delay={0.2}>
            <div className="flex flex-col gap-12">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted uppercase tracking-widest font-medium">Edad cronológica</p>
                <div className="text-[9rem] md:text-[11rem] font-bold text-ink/20 leading-none tracking-tight">
                  40
                </div>
              </div>

              <div className="flex items-center gap-6 pl-4">
                <div className="w-px h-16 bg-border" />
                <p className="text-muted text-sm">vs.</p>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-sm text-sage uppercase tracking-widest font-medium">Edad de Movimiento</p>
                <div className="text-[9rem] md:text-[11rem] font-bold text-ink leading-none tracking-tight">
                  <AnimatedNumber target={54} />
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-px bg-gradient-to-r from-sage to-transparent"
                />
                <p className="text-sm text-red-400 font-medium mt-1">
                  Tu cuerpo mueve 14 años más viejo de lo que sos.
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Explanation */}
          <FadeIn delay={0.3}>
            <div className="bg-cream2 rounded-3xl p-10 border border-border flex flex-col gap-8">
              <div>
                <h3 className="text-xl font-semibold text-ink mb-3">¿Cómo se calcula?</h3>
                <p className="text-ink2 leading-relaxed">
                  La IA analiza tus patrones de movimiento y los compara con miles
                  de perfiles biomecánicos reales. El resultado es una edad funcional,
                  no una estimación genética.
                </p>
              </div>

              {[
                { label: "Movilidad articular", val: 62, color: "#6B7B68" },
                { label: "Control postural", val: 78, color: "#8A9E87" },
                { label: "Velocidad de reacción", val: 55, color: "#203040" },
                { label: "Fuerza funcional", val: 70, color: "#6B7B68" },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-ink2">{m.label}</span>
                    <span className="text-ink font-medium">{m.val}%</span>
                  </div>
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${m.val}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full"
                      style={{ background: m.color }}
                    />
                  </div>
                </div>
              ))}

              <div className="bg-sage/10 border border-sage/20 rounded-xl p-4">
                <p className="text-sm text-ink2">
                  <strong className="text-ink">Buena noticia:</strong> En 8 semanas de práctica consistente,
                  la mayoría de usuarios reduce su Edad de Movimiento entre 3 y 9 años.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
