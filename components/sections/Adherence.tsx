"use client";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/ui/FadeIn";

const days = Array.from({ length: 35 }, (_, i) => ({
  active: [0,1,2,4,5,7,8,9,11,14,15,16,17,18,21,22,23,24,25,28,29,30,31,32,33,34].includes(i),
  streak: [21,22,23,24,25,28,29,30,31,32,33,34].includes(i),
}));

export function Adherence() {
  return (
    <section className="bg-cream2 py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Streak visual */}
          <FadeIn>
            <div className="bg-white rounded-3xl border border-border p-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-xs text-muted uppercase tracking-wide mb-1">Racha actual</p>
                  <div className="flex items-end gap-2">
                    <p className="text-5xl font-bold text-ink">12</p>
                    <p className="text-ink2 mb-1">días</p>
                  </div>
                </div>
                <div className="text-3xl">🔥</div>
              </div>

              {/* Calendar heatmap */}
              <div className="grid grid-cols-7 gap-1.5 mb-6">
                {["L","M","X","J","V","S","D"].map((d) => (
                  <p key={d} className="text-center text-xs text-muted">{d}</p>
                ))}
                {days.map((d, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.02 * i, duration: 0.3 }}
                    className={`aspect-square rounded-md ${
                      d.streak ? "bg-sage" :
                      d.active ? "bg-sage/30" :
                      "bg-cream2"
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-4 text-xs text-muted">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-sage" />
                  <span>Racha activa</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-sage/30" />
                  <span>Día activo</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border grid grid-cols-3 gap-4">
                {[
                  { n: "26", l: "días activos" },
                  { n: "4m", l: "sesión mínima" },
                  { n: "87%", l: "consistencia" },
                ].map((s) => (
                  <div key={s.l} className="text-center">
                    <p className="text-xl font-bold text-ink">{s.n}</p>
                    <p className="text-xs text-muted mt-0.5">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-sm font-medium text-sage tracking-widest uppercase mb-6">Adherencia</p>
            <h2 className="text-4xl md:text-5xl font-semibold text-ink leading-tight tracking-tight mb-6">
              El entrenamiento más importante es el que{" "}
              <span className="text-muted">no abandonás.</span>
            </h2>
            <p className="text-lg text-ink2 leading-relaxed mb-8">
              No diseñamos para atletas. Diseñamos para personas reales
              con vidas reales. Por eso 4 minutos cuentan tanto como 45.
              Lo que importa es que mañana también lo hagas.
            </p>
            <div className="flex flex-col gap-4">
              {[
                { icon: "⏱", text: "Micro-sesiones desde 4 minutos" },
                { icon: "🧠", text: "Recordatorios basados en tu ritmo circadiano" },
                { icon: "🎯", text: "Objetivos semanales adaptados a tu vida real" },
                { icon: "📈", text: "El progreso visible genera su propio momentum" },
              ].map((t) => (
                <div key={t.text} className="flex items-start gap-4 text-ink2">
                  <span className="text-xl">{t.icon}</span>
                  <span className="leading-relaxed">{t.text}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
