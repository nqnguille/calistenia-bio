"use client";
import { FadeIn, FadeInStagger, StaggerItem } from "@/components/ui/FadeIn";

const testimonials = [
  {
    quote: "Tenía 52 años y pensaba que lo que sentía era 'normal para la edad'. La evaluación me mostró que mi cuerpo se movía como el de alguien de 64. En 4 meses bajé a 51. Por primera vez en años, subí escaleras sin pensar.",
    name: "Marcela R.",
    age: 52,
    role: "Docente · Buenos Aires",
    delta: "−13 años en Edad de Movimiento",
  },
  {
    quote: "Soy médico. Me acerqué con escepticismo. Lo que me convenció no fue la tecnología sino la metodología: mide lo que importa, no lo que es fácil de medir. El equilibrio y la coordinación son predictores reales de longevidad.",
    name: "Dr. Sebastián M.",
    age: 48,
    role: "Médico internista · Córdoba",
    delta: "Usuario desde el beta",
  },
  {
    quote: "Viajo mucho por trabajo. Lo que me enganchó es que funciona en cualquier lado: hotel, casa, aeropuerto. 4 minutos y tengo mi sesión. Llevo 6 meses sin saltear una semana de evaluación.",
    name: "Fernando A.",
    age: 44,
    role: "Director comercial · Remoto",
    delta: "26 semanas consecutivas",
  },
  {
    quote: "No vengo del mundo fitness. Siempre me aburrieron los gimnasios. Esto es diferente porque el objetivo no es verme bien, es entender cómo funciona mi cuerpo. Eso sí me motiva.",
    name: "Lucía T.",
    age: 39,
    role: "Diseñadora · Montevideo",
    delta: "−6 años en Edad de Movimiento",
  },
];

export function Testimonials() {
  return (
    <section className="bg-cream py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <FadeIn className="mb-20">
          <p className="text-sm font-medium text-sage tracking-widest uppercase mb-6">Personas reales</p>
          <h2 className="text-4xl md:text-5xl font-semibold text-ink leading-tight tracking-tight max-w-xl">
            Transformaciones de movimiento.
            <span className="text-muted"> No de apariencia.</span>
          </h2>
        </FadeIn>

        <FadeInStagger className="grid md:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <StaggerItem key={t.name}>
              <div className="bg-cream2 border border-border rounded-3xl p-8 h-full flex flex-col gap-6">
                <p className="text-ink2 leading-relaxed text-[15px] flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="font-semibold text-ink text-sm">{t.name}</p>
                    <p className="text-muted text-xs mt-0.5">{t.role} · {t.age} años</p>
                  </div>
                  <div className="bg-sage/10 rounded-full px-3 py-1.5">
                    <p className="text-sage text-xs font-medium">{t.delta}</p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </FadeInStagger>
      </div>
    </section>
  );
}
