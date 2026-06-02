"use client";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/ui/FadeIn";

const weeks = [
  { week: "Sem 1", age: 54, label: "Inicio" },
  { week: "Sem 4", age: 51, label: "+3 sem" },
  { week: "Sem 8", age: 48, label: "+8 sem" },
  { week: "Sem 12", age: 45, label: "+12 sem" },
  { week: "Sem 16", age: 43, label: "+16 sem" },
  { week: "Sem 20", age: 41, label: "+20 sem" },
];

const MIN = 38; const MAX = 57; const RANGE = MAX - MIN;

export function WeeklyCheckpoints() {
  const pts = weeks.map((w, i) => ({
    x: 60 + i * ((560 - 60) / (weeks.length - 1)),
    y: 20 + ((w.age - MIN) / RANGE) * (180 - 20),
  }));

  const pathD = pts.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `C ${(pts[i-1].x + p.x)/2} ${pts[i-1].y} ${(pts[i-1].x + p.x)/2} ${p.y} ${p.x} ${p.y}`)).join(" ");
  const areaD = `${pathD} L ${pts[pts.length-1].x} 200 L ${pts[0].x} 200 Z`;

  return (
    <section className="bg-cream2 py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <FadeIn>
            <p className="text-sm font-medium text-sage tracking-widest uppercase mb-6">Evaluaciones semanales</p>
            <h2 className="text-4xl md:text-5xl font-semibold text-ink leading-tight tracking-tight mb-6">
              Evolucionás.<br />
              <span className="text-muted">Lo medimos cada semana.</span>
            </h2>
            <p className="text-lg text-ink2 leading-relaxed mb-8">
              Cada 7 días, la misma evaluación. El mismo vos. Una nueva medición.
              Observás en tiempo real cómo tu cuerpo responde al movimiento.
            </p>
            <div className="flex flex-col gap-4">
              {[
                "Evaluación de 5 minutos frente a tu webcam",
                "Comparativa automática semana a semana",
                "Gráfico de evolución de tu Edad de Movimiento",
                "Ajuste del plan basado en tu progreso real",
              ].map((t) => (
                <div key={t} className="flex items-start gap-3 text-ink2">
                  <span className="text-sage mt-0.5">—</span>
                  <span className="text-sm leading-relaxed">{t}</span>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Chart */}
          <FadeIn delay={0.2}>
            <div className="bg-white rounded-3xl border border-border p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs text-muted uppercase tracking-wide mb-1">Edad de Movimiento</p>
                  <p className="text-3xl font-bold text-ink">−13 años</p>
                  <p className="text-sm text-sage mt-1">en 20 semanas</p>
                </div>
                <div className="bg-sage/10 rounded-xl px-3 py-1">
                  <p className="text-xs text-sage font-medium">▼ Mejorando</p>
                </div>
              </div>

              <svg viewBox="0 0 600 210" className="w-full">
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6B7B68" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#6B7B68" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                {[40, 44, 48, 52, 56].map((val) => {
                  const y = 20 + ((val - MIN) / RANGE) * (180 - 20);
                  return (
                    <g key={val}>
                      <line x1="40" y1={y} x2="580" y2={y} stroke="#E4E1DA" strokeWidth="1" />
                      <text x="30" y={y + 4} fontSize="10" fill="#888880" textAnchor="end">{val}</text>
                    </g>
                  );
                })}

                {/* Area fill */}
                <motion.path
                  d={areaD}
                  fill="url(#lineGrad)"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.3 }}
                />

                {/* Line */}
                <motion.path
                  d={pathD}
                  fill="none" stroke="#6B7B68" strokeWidth="2.5" strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                />

                {/* Points */}
                {pts.map((p, i) => (
                  <motion.g key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.15 }}
                    style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                  >
                    <circle cx={p.x} cy={p.y} r="5" fill="white" stroke="#6B7B68" strokeWidth="2.5" />
                    <text x={p.x} y={p.y - 10} fontSize="10" fill="#6B7B68" textAnchor="middle" fontWeight="600">
                      {weeks[i].age}
                    </text>
                    <text x={p.x} y="205" fontSize="9" fill="#888880" textAnchor="middle">
                      {weeks[i].week}
                    </text>
                  </motion.g>
                ))}
              </svg>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
