"use client";
import { FadeIn } from "@/components/ui/FadeIn";
import { Button } from "@/components/ui/Button";

export function Longevity() {
  return (
    <section className="bg-cream py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-petrol rounded-3xl overflow-hidden">
          <div className="p-12 md:p-20 flex flex-col gap-10 items-start">
            <FadeIn>
              <p className="text-sm font-medium text-sage tracking-widest uppercase">La filosofía</p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-cream leading-tight tracking-tight max-w-2xl">
                No entrenamos para el verano.
              </h2>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight max-w-2xl mt-2" style={{ color: "#6B7B68" }}>
                Entrenamos para los próximos 40 años.
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-cream/70 text-lg leading-relaxed max-w-xl">
                La obsesión por la estética destruyó la relación de millones de personas con el movimiento.
                Nosotros proponemos otra cosa: moverte bien, durante mucho tiempo, porque te hace sentir joven.
              </p>
            </FadeIn>

            <FadeIn delay={0.3} className="grid grid-cols-3 gap-8 w-full pt-4 border-t border-white/10">
              {[
                { num: "10+", label: "años de rejuvenecimiento posible" },
                { num: "4min", label: "es suficiente para empezar" },
                { num: "∞", label: "progreso compuesto en el tiempo" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-4xl font-bold text-cream mb-2">{s.num}</p>
                  <p className="text-cream/50 text-sm leading-relaxed">{s.label}</p>
                </div>
              ))}
            </FadeIn>

            <FadeIn delay={0.4}>
              <Button variant="outline">
                Comenzar mi evaluación →
              </Button>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
