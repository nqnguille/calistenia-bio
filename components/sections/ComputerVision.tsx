"use client";
import { motion } from "framer-motion";
import { FadeIn, FadeInStagger, StaggerItem } from "@/components/ui/FadeIn";

const detections = [
  { label: "Postura", value: "Alineación cervical", score: 82, icon: "⊕" },
  { label: "Equilibrio", value: "Centro de masa estable", score: 91, icon: "◎" },
  { label: "Estabilidad", value: "Control lumbar activo", score: 74, icon: "◈" },
  { label: "Movilidad", value: "Cadera 118° ROM", score: 88, icon: "◉" },
  { label: "Técnica", value: "Patrón de movimiento", score: 79, icon: "⊗" },
];

export function ComputerVision() {
  return (
    <section className="bg-dark py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Body scan visualization */}
          <FadeIn>
            <div className="relative aspect-[3/4] bg-dark2 rounded-3xl border border-white/10 overflow-hidden">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-sage/5 to-transparent" />

              {/* Body outline SVG */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 400" aria-hidden>
                {/* Body silhouette */}
                <ellipse cx="150" cy="45" rx="28" ry="32" fill="none" stroke="#6B7B6840" strokeWidth="1.5" />
                <path d="M 115 75 L 95 130 L 85 190 L 80 220" fill="none" stroke="#6B7B6840" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 185 75 L 205 130 L 215 190 L 220 220" fill="none" stroke="#6B7B6840" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 115 75 L 185 75 L 190 160 L 150 175 L 110 160 Z" fill="none" stroke="#6B7B6840" strokeWidth="1.5" />
                <path d="M 120 175 L 115 260 L 110 330" fill="none" stroke="#6B7B6840" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 180 175 L 185 260 L 190 330" fill="none" stroke="#6B7B6840" strokeWidth="1.5" strokeLinecap="round" />

                {/* Landmark dots — animated */}
                {[
                  [150,45],[150,80],[115,78],[185,78],
                  [85,128],[215,128],[80,188],[220,188],
                  [150,175],[120,175],[180,175],
                  [115,258],[185,258],[110,328],[190,328],
                ].map(([cx,cy], i) => (
                  <motion.circle
                    key={i}
                    cx={cx} cy={cy} r="4"
                    fill="#6B7B68"
                    initial={{ scale:0, opacity:0 }}
                    animate={{ scale:1, opacity:0.9 }}
                    transition={{ delay: 0.05 * i, duration:0.3 }}
                  />
                ))}

                {/* Scanning beam */}
                <motion.rect
                  x="60" y="0" width="180" height="2" fill="#6B7B68" fillOpacity="0.5"
                  initial={{ y: 20 }}
                  animate={{ y: [20, 350, 20] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                />
              </svg>

              {/* Floating detection badges */}
              {[
                { x: "right-4 top-16", label: "Postura", val: "82%" },
                { x: "left-4 top-1/3", label: "ROM", val: "118°" },
                { x: "right-4 bottom-1/3", label: "Centro", val: "Est." },
              ].map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + i * 0.3 }}
                  className={`absolute ${b.x} bg-dark/90 backdrop-blur border border-white/10 rounded-xl px-3 py-2`}
                >
                  <p className="text-muted text-xs">{b.label}</p>
                  <p className="text-cream font-bold text-sm">{b.val}</p>
                </motion.div>
              ))}
            </div>
          </FadeIn>

          {/* Detections list */}
          <div className="flex flex-col gap-8">
            <FadeIn>
              <p className="text-sm font-medium text-sage tracking-widest uppercase mb-6">Visión por computadora</p>
              <h2 className="text-4xl md:text-5xl font-semibold text-cream leading-tight tracking-tight mb-6">
                Lo que la IA ve en tu cuerpo.
              </h2>
              <p className="text-muted leading-relaxed">
                En cada evaluación, el sistema analiza más de 30 variables biomecánicas
                simultáneamente. Sin contacto. Sin sensores. Solo tu webcam.
              </p>
            </FadeIn>

            <FadeInStagger className="flex flex-col gap-4">
              {detections.map((d) => (
                <StaggerItem key={d.label}>
                  <div className="bg-dark2 border border-white/8 rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sage text-lg">{d.icon}</span>
                        <div>
                          <p className="text-cream font-medium text-sm">{d.label}</p>
                          <p className="text-muted text-xs mt-0.5">{d.value}</p>
                        </div>
                      </div>
                      <span className="text-sage font-bold">{d.score}</span>
                    </div>
                    <div className="h-1 bg-white/8 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${d.score}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-sage"
                      />
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </FadeInStagger>
          </div>
        </div>
      </div>
    </section>
  );
}
