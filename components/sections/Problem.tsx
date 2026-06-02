"use client";
import { FadeIn, FadeInStagger, StaggerItem } from "@/components/ui/FadeIn";

const capabilities = [
  {
    icon: "◎",
    title: "Movilidad",
    desc: "¿Tus articulaciones se mueven en el rango que deberían? La rigidez progresiva es silenciosa.",
  },
  {
    icon: "⊕",
    title: "Estabilidad",
    desc: "El control de tu cuerpo en el espacio determina cuánto durás activo sin lesiones.",
  },
  {
    icon: "◈",
    title: "Equilibrio",
    desc: "Un indicador crítico de envejecimiento neuromotor. Se puede medir. Se puede mejorar.",
  },
  {
    icon: "◉",
    title: "Fuerza funcional",
    desc: "No la fuerza del gimnasio. La fuerza de levantarte, cargar, moverte sin esfuerzo.",
  },
  {
    icon: "⊗",
    title: "Coordinación",
    desc: "La sincronía entre tu sistema nervioso y tu cuerpo. El primero en deteriorarse, el último en medirse.",
  },
];

export function Problem() {
  return (
    <section className="bg-cream2 py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <FadeIn className="mb-20 max-w-2xl">
          <p className="text-sm font-medium text-sage tracking-widest uppercase mb-6">El problema</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-ink leading-tight tracking-tight">
            Todos conocemos nuestra edad.{" "}
            <span className="text-muted">Pocos conocen la edad de su cuerpo.</span>
          </h2>
        </FadeIn>

        <FadeIn delay={0.2} className="mb-16 max-w-xl">
          <p className="text-lg text-ink2 leading-relaxed">
            Hay cinco dimensiones del movimiento que determinan cómo envejece tu cuerpo.
            Ninguna se mide con análisis de sangre. Ninguna aparece en tu historia clínica.
            Hasta ahora.
          </p>
        </FadeIn>

        <FadeInStagger className="grid md:grid-cols-5 gap-px bg-border rounded-2xl overflow-hidden">
          {capabilities.map((c) => (
            <StaggerItem key={c.title}>
              <div className="bg-cream p-8 h-full flex flex-col gap-4">
                <span className="text-2xl text-sage">{c.icon}</span>
                <h3 className="font-semibold text-ink text-lg">{c.title}</h3>
                <p className="text-sm text-ink2 leading-relaxed">{c.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </FadeInStagger>
      </div>
    </section>
  );
}
