"use client";
import { motion } from "framer-motion";

const pipeline = [
  { n: "01", label: "Cuerpo humano", sub: "Webcam · 30fps", icon: "◎" },
  { n: "02", label: "33 landmarks", sub: "Puntos anatómicos clave", icon: "⊕" },
  { n: "03", label: "Biomecánica", sub: "Ángulos · Velocidad · Simetría", icon: "◈" },
  { n: "04", label: "Insights", sub: "Edad de Movimiento", icon: "◉" },
];

const stats = [
  { n: "33", l: "Puntos anatómicos" },
  { n: "30fps", l: "Tiempo real" },
  { n: "5", l: "Dimensiones" },
  { n: "<5min", l: "Evaluación" },
];

export function AIEngine() {
  return (
    <section className="brut-sec brut-concrete relative overflow-hidden border-t border-white/[0.14] bg-concrete px-8 py-52 text-chalk" id="motor">
      <div className="brut-grid absolute inset-0 opacity-60" aria-hidden />

      {/* Número de sección gigante contorneado de fondo */}
      <div className="brut-display brut-outline-text pointer-events-none absolute -right-10 top-16 select-none text-[20rem] leading-none opacity-50 max-lg:hidden" aria-hidden>
        04
      </div>

      <div className="relative mx-auto max-w-6xl">
        <p className="brut-label mb-6">[SEC_04 // MOTOR_DE_IA]</p>

        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="brut-display mb-6 max-w-[800px] text-[clamp(2.6rem,6vw,4.6rem)] text-chalk"
        >
          Tu cuerpo genera miles de señales.
          <br />
          <span className="text-cyan">Nuestra IA las convierte en conocimiento.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 max-w-[480px] border-l-2 border-cyan pl-4 text-lg leading-7 text-chalk/60"
        >
          En cada evaluación, el sistema analiza más de 30 variables biomecánicas simultáneamente. Sin contacto. Sin sensores. Solo tu cámara.
        </motion.p>

        {/* Pipeline */}
        <div className="mb-6 grid gap-0 md:grid-cols-4">
          {pipeline.map((p, i) => (
            <motion.div
              key={p.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative -ml-px -mt-px border border-white/[0.14] bg-white/[0.03] p-10 transition-colors hover:border-cyan"
            >
              <span className="brut-mono absolute right-3 top-2 text-[0.62rem] font-bold text-chalk/25" aria-hidden>
                +
              </span>
              <div className="mb-5 flex items-start justify-between">
                <span className="text-2xl text-cyan">{p.icon}</span>
                <span className="brut-mono text-[0.65rem] font-bold text-chalk/30">{p.n}</span>
              </div>
              <p className="brut-display mb-1 text-lg text-chalk">{p.label}</p>
              <p className="brut-mono text-[0.72rem] uppercase leading-6 text-chalk/45">{p.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="brut-panel-raised grid grid-cols-2 overflow-hidden md:grid-cols-4"
        >
          {stats.map((s, i) => (
            <div key={s.l} className={`px-10 py-11 ${i > 0 ? "border-l border-white/[0.14]" : ""}`}>
              <p className="brut-display mb-2 text-[clamp(2rem,3vw,2.8rem)] leading-none text-cyan">{s.n}</p>
              <p className="brut-mono text-[0.72rem] uppercase text-chalk/50">{s.l}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
