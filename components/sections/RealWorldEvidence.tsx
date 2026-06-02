"use client";
import { FadeIn, FadeInStagger, StaggerItem } from "@/components/ui/FadeIn";

const pillars = [
  {
    icon: "◎",
    title: "Cada movimiento",
    desc: "Cada sesión genera datos biomecánicos anonimizados que alimentan el modelo global.",
  },
  {
    icon: "⊕",
    title: "Cada evaluación",
    desc: "Las evaluaciones semanales crean una línea de tiempo longitudinal de salud motora.",
  },
  {
    icon: "◈",
    title: "Cada mejora",
    desc: "Los avances individuales se convierten en evidencia de que el movimiento rejuvenece.",
  },
];

export function RealWorldEvidence() {
  return (
    <section className="bg-dark2 py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <FadeIn className="mb-4">
          <p className="text-sm font-medium text-sage tracking-widest uppercase">Evidencia del mundo real</p>
        </FadeIn>
        <FadeIn delay={0.1} className="mb-8">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-cream leading-tight tracking-tight max-w-3xl">
            Construimos evidencia del mundo real.
          </h2>
        </FadeIn>
        <FadeIn delay={0.2} className="mb-20 max-w-xl">
          <p className="text-lg text-muted leading-relaxed">
            Cada usuario que usa la plataforma contribuye —con su consentimiento—
            a la base de datos más grande del mundo sobre salud motora en adultos.
            No hipótesis. Datos reales, de personas reales.
          </p>
        </FadeIn>

        <FadeInStagger className="grid md:grid-cols-3 gap-6 mb-16">
          {pillars.map((p) => (
            <StaggerItem key={p.title}>
              <div className="bg-dark border border-white/8 rounded-2xl p-8 h-full flex flex-col gap-4">
                <span className="text-sage text-2xl">{p.icon}</span>
                <h3 className="text-cream font-semibold text-lg">{p.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{p.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </FadeInStagger>

        <FadeIn delay={0.3}>
          <div className="bg-dark border border-white/8 rounded-2xl p-8">
            <p className="text-xs text-sage uppercase tracking-widest font-medium mb-4">
              Compromiso de transparencia
            </p>
            <p className="text-cream/80 leading-relaxed max-w-2xl">
              No hacemos afirmaciones médicas. No prometemos curaciones. Lo que sí prometemos es
              medición rigurosa, metodología transparente, y evidencia observable de que el movimiento
              consistente mejora cómo funciona tu cuerpo. El resto lo dirán los datos.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
