"use client";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/ui/FadeIn";

const pipeline = [
  { step: "01", label: "Cuerpo humano", sub: "Webcam 30fps", color: "#6B7B68" },
  { step: "02", label: "Landmarks", sub: "33 puntos anatómicos", color: "#8A9E87" },
  { step: "03", label: "Modelo biomecánico", sub: "Ángulos · Velocidad · Simetría", color: "#203040" },
  { step: "04", label: "Insights", sub: "Edad de Movimiento", color: "#6B7B68" },
];

export function AIEngine() {
  return (
    <section className="bg-dark py-32 px-6" id="science">
      <div className="max-w-5xl mx-auto">
        <FadeIn className="mb-20">
          <p className="text-sm font-medium text-sage tracking-widest uppercase mb-6">Motor de IA</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-cream leading-tight tracking-tight max-w-2xl">
            Tu cuerpo genera miles de señales.{" "}
            <span className="text-sage">Nuestra IA las convierte en conocimiento.</span>
          </h2>
        </FadeIn>

        {/* Pipeline */}
        <FadeIn delay={0.2}>
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-0">
            {pipeline.map((p, i) => (
              <div key={p.step} className="flex flex-col md:flex-row items-start md:items-center flex-1">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.15, duration: 0.6 }}
                  className="bg-dark2 border border-white/10 rounded-2xl p-6 w-full md:max-w-[180px]"
                >
                  <span className="text-xs font-mono text-muted mb-3 block">{p.step}</span>
                  <p className="text-cream font-semibold mb-1">{p.label}</p>
                  <p className="text-xs text-muted leading-relaxed">{p.sub}</p>
                </motion.div>

                {i < pipeline.length - 1 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.15, duration: 0.5 }}
                    className="hidden md:block h-px flex-1 bg-gradient-to-r from-white/20 to-white/5 mx-3 origin-left"
                  />
                )}
                {i < pipeline.length - 1 && (
                  <div className="md:hidden w-px h-8 bg-gradient-to-b from-white/20 to-transparent ml-6 my-1" />
                )}
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Stats row */}
        <FadeIn delay={0.4}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden mt-16">
            {[
              { num: "33", label: "Puntos anatómicos" },
              { num: "30fps", label: "Análisis en tiempo real" },
              { num: "5", label: "Dimensiones medidas" },
              { num: "<5min", label: "Evaluación completa" },
            ].map((s) => (
              <div key={s.label} className="bg-dark2 p-8">
                <p className="text-3xl font-bold text-cream mb-2">{s.num}</p>
                <p className="text-sm text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
