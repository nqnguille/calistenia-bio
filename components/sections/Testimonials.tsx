"use client";
import { motion } from "framer-motion";

const testimonials = [
  { quote:"Tenía 52 años y pensaba que lo que sentía era normal para la edad. La evaluación me mostró que mi cuerpo se movía como el de alguien de 64. En 4 meses bajé a 51. Por primera vez en años, subí escaleras sin pensar.", name:"Marcela R.", role:"Docente · Buenos Aires · 52 años", delta:"−13 años" },
  { quote:"Soy médico y me acerqué con escepticismo. Lo que me convenció fue la metodología: mide lo que importa, no lo que es fácil de medir. El equilibrio y la coordinación son predictores reales de longevidad.", name:"Dr. Sebastián M.", role:"Médico internista · Córdoba · 48 años", delta:"Usuario beta" },
  { quote:"Viajo mucho por trabajo. Lo que me enganchó es que funciona en cualquier lado. 4 minutos y tengo mi sesión. Llevo 6 meses sin saltear una semana de evaluación.", name:"Fernando A.", role:"Director comercial · Remoto · 44 años", delta:"26 semanas" },
  { quote:"No vengo del mundo fitness. Siempre me aburrieron los gimnasios. Esto es diferente porque el objetivo no es verme bien, es entender cómo funciona mi cuerpo. Eso sí me motiva.", name:"Lucía T.", role:"Diseñadora · Montevideo · 39 años", delta:"−6 años" },
];

export function Testimonials() {
  return (
    <section className="brut-sec brut-concrete relative overflow-hidden bg-concrete px-8 py-52 text-chalk">
      <div className="brut-grid absolute inset-0 opacity-50" aria-hidden />

      {/* Número de sección gigante contorneado de fondo */}
      <div className="brut-display brut-outline-text pointer-events-none absolute -left-6 bottom-6 select-none text-[20rem] leading-none opacity-50 max-lg:hidden" aria-hidden>
        14
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-24 text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="brut-label mb-6"
          >
            [SEC_14 // PERSONAS_REALES]
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="brut-display text-[clamp(2.6rem,6vw,4.6rem)]"
          >
            Transformaciones de movimiento. <span className="text-cyan">No de apariencia.</span>
          </motion.h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`${i === 0 ? "brut-panel-raised" : "border border-white/[0.14] bg-white/[0.03]"} group relative flex flex-col gap-6 p-9 transition-colors duration-150 hover:border-cyan/60`}
            >
              <span className="brut-mono absolute right-4 top-3 text-[0.62rem] font-bold text-chalk/40" aria-hidden>
                +{String(i + 1).padStart(2, "0")}
              </span>
              <p className="flex-1 text-[0.95rem] leading-7 text-chalk/70">"{t.quote}"</p>
              <div className="flex items-center justify-between gap-4 border-t border-white/[0.14] pt-5">
                <div>
                  <p className="text-sm font-bold text-chalk">{t.name}</p>
                  <p className="brut-mono mt-1 text-[0.68rem] uppercase tracking-[0.06em] text-cement">{t.role}</p>
                </div>
                <div className="border border-cyan/50 bg-cyan/10 px-3.5 py-1.5">
                  <p className="brut-mono text-[0.72rem] font-bold uppercase tracking-[0.06em] text-cyan">{t.delta}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
