"use client";
import { motion } from "framer-motion";

const caps = [
  { icon: "◎", n: "01", title: "Movilidad", desc: "¿Tus articulaciones se mueven en el rango que deberían? La rigidez es silenciosa y acumulativa." },
  { icon: "⊕", n: "02", title: "Estabilidad", desc: "El control de tu cuerpo en el espacio determina cuánto durás activo sin lesiones." },
  { icon: "◈", n: "03", title: "Equilibrio", desc: "Indicador crítico de envejecimiento neuromotor. Se puede medir con precisión. Se puede revertir." },
  { icon: "◉", n: "04", title: "Fuerza funcional", desc: "No la del gimnasio. La fuerza de levantarte, cargar y moverte sin esfuerzo." },
  { icon: "⊗", n: "05", title: "Coordinación", desc: "La sincronía entre tu sistema nervioso y tu cuerpo. El primero en deteriorarse." },
];

const stats = [
  { num: "0", desc: "de estas 5 dimensiones aparece en tu historia clínica" },
  { num: "100%", desc: "son mejorables con el estímulo y la frecuencia correctos" },
  { num: "5min", desc: "es lo que tarda nuestra evaluación completa con IA" },
];

export function Problem() {
  return (
    <section className="brut-sec brut-concrete relative overflow-hidden border-t border-white/[0.14] bg-void px-8 py-52 text-chalk">
      <div className="brut-grid absolute inset-0 opacity-50" aria-hidden />

      <div className="relative mx-auto max-w-6xl">
        {/* Centered header */}
        <div className="mb-28 text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="brut-label mb-6"
          >
            [SEC_03 // EL_PROBLEMA]
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="brut-display mx-auto mb-7 text-[clamp(2.6rem,6vw,4.6rem)] text-chalk"
          >
            Todos conocemos nuestra edad.
            <br />
            <span className="brut-outline-cyan">Pocos conocen la edad de su cuerpo.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-[500px] text-lg leading-7 text-chalk/60"
          >
            Cinco dimensiones del movimiento determinan cómo envejece tu cuerpo. Ninguna aparece en tu historia clínica. Hasta ahora.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="mb-28 grid gap-0 sm:grid-cols-2 lg:grid-cols-5">
          {caps.map((c, i) => (
            <motion.div
              key={c.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="-ml-px -mt-px flex min-h-[260px] flex-col gap-4 border border-white/[0.14] bg-white/[0.03] p-7 transition-colors hover:border-cyan"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center border border-cyan/40 bg-cyan/[0.08] text-2xl text-cyan">{c.icon}</span>
                <span className="brut-mono text-[0.65rem] font-bold text-chalk/40">{c.n}</span>
              </div>
              <h3 className="brut-display text-xl text-chalk">{c.title}</h3>
              <p className="text-[0.95rem] leading-7 text-chalk/60">{c.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="brut-hazard mb-10 h-[1.5px] w-full opacity-50" aria-hidden />

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="brut-panel-raised grid overflow-hidden md:grid-cols-3"
        >
          {stats.map((s, i) => (
            <div key={s.num} className={`px-8 py-11 text-center ${i > 0 ? "border-t border-white/[0.14] md:border-l md:border-t-0" : ""}`}>
              <p className="brut-display mb-3 text-[clamp(3rem,5vw,4.5rem)] leading-none text-cyan">{s.num}</p>
              <p className="text-base leading-7 text-chalk/60">{s.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
