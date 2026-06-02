"use client";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/ui/FadeIn";

export function Dashboard() {
  return (
    <section className="bg-cream2 py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <FadeIn className="text-center mb-16">
          <p className="text-sm font-medium text-sage tracking-widest uppercase mb-6">El dashboard</p>
          <h2 className="text-4xl md:text-5xl font-semibold text-ink leading-tight tracking-tight mb-4">
            Tu salud motora,<br />
            <span className="text-muted">de un vistazo.</span>
          </h2>
        </FadeIn>

        {/* Dashboard mockup */}
        <FadeIn delay={0.2}>
          <div className="bg-white rounded-3xl border border-border p-6 md:p-8 shadow-xl shadow-ink/5">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
              <div>
                <p className="text-xs text-muted uppercase tracking-wide">Hola, Martina</p>
                <p className="text-xl font-semibold text-ink mt-0.5">Tu semana 8</p>
              </div>
              <div className="flex items-center gap-2 bg-sage/10 rounded-full px-4 py-2">
                <div className="w-2 h-2 rounded-full bg-sage" />
                <span className="text-sm text-sage font-medium">Mejorando</span>
              </div>
            </div>

            {/* Main metrics grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Edad de Movimiento", value: "46", unit: "años", delta: "−8", good: true },
                { label: "Nivel Físico", value: "3", unit: "/5", delta: "+1", good: true },
                { label: "Adherencia", value: "87", unit: "%", delta: "+12%", good: true },
                { label: "Racha actual", value: "12", unit: "días", delta: "🔥", good: true },
              ].map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i }}
                  className="bg-cream2 rounded-2xl p-5"
                >
                  <p className="text-xs text-muted mb-3 leading-tight">{m.label}</p>
                  <div className="flex items-end gap-1">
                    <p className="text-3xl font-bold text-ink">{m.value}</p>
                    <p className="text-ink2 mb-1 text-sm">{m.unit}</p>
                  </div>
                  <p className={`text-xs mt-2 font-medium ${m.good ? "text-sage" : "text-red-400"}`}>
                    {m.delta} esta semana
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Radar chart placeholder + progress */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Radar */}
              <div className="bg-cream2 rounded-2xl p-6">
                <p className="text-sm font-medium text-ink mb-4">Perfil de movimiento</p>
                <svg viewBox="0 0 200 180" className="w-full max-w-[200px] mx-auto">
                  <defs>
                    <polygon id="hex" points="100,10 170,50 170,130 100,170 30,130 30,50" />
                  </defs>
                  {[1, 0.75, 0.5, 0.25].map((scale, i) => (
                    <polygon
                      key={i}
                      points={[
                        `100,${10 + (1-scale)*80}`,
                        `${100 + scale*70},${10 + (1-scale)*80 + scale*40}`,
                        `${100 + scale*70},${10 + (1-scale)*80 + scale*80}`,
                        `100,${10 + (1-scale)*80 + scale*120}`,
                        `${100 - scale*70},${10 + (1-scale)*80 + scale*80}`,
                        `${100 - scale*70},${10 + (1-scale)*80 + scale*40}`,
                      ].join(" ")}
                      fill="none" stroke="#E4E1DA" strokeWidth="1"
                    />
                  ))}
                  <polygon
                    points="100,35 155,68 148,128 100,155 52,128 45,68"
                    fill="#6B7B6820" stroke="#6B7B68" strokeWidth="1.5"
                  />
                  {["Movilidad","Estabilidad","Equilibrio","Fuerza","Coordinación","Técnica"].map((label, i) => {
                    const angle = (i * 60 - 90) * Math.PI / 180;
                    return (
                      <text key={label}
                        x={100 + Math.cos(angle) * 88}
                        y={90 + Math.sin(angle) * 88}
                        fontSize="9" fill="#888880" textAnchor="middle"
                      >
                        {label}
                      </text>
                    );
                  })}
                </svg>
              </div>

              {/* Weekly progress */}
              <div className="bg-cream2 rounded-2xl p-6">
                <p className="text-sm font-medium text-ink mb-4">Evolución semanal</p>
                <div className="flex flex-col gap-3">
                  {[
                    { label: "Movilidad", curr: 82, prev: 74 },
                    { label: "Equilibrio", curr: 91, prev: 84 },
                    { label: "Fuerza func.", curr: 70, prev: 65 },
                    { label: "Coordinación", curr: 77, prev: 71 },
                  ].map((m) => (
                    <div key={m.label}>
                      <div className="flex justify-between text-xs text-ink2 mb-1.5">
                        <span>{m.label}</span>
                        <span className="text-sage font-medium">+{m.curr - m.prev}%</span>
                      </div>
                      <div className="relative h-1.5 bg-border rounded-full">
                        <div className="absolute inset-y-0 left-0 rounded-full bg-border/50" style={{ width: `${m.prev}%` }} />
                        <motion.div
                          initial={{ width: `${m.prev}%` }}
                          whileInView={{ width: `${m.curr}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute inset-y-0 left-0 rounded-full bg-sage"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
