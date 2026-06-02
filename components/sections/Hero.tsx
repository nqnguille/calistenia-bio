"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

const DOTS = [
  { cx: 200, cy: 60, r: 4, label: "Cabeza" },
  { cx: 200, cy: 100, r: 5, label: "Hombros" },
  { cx: 165, cy: 100, r: 4 }, { cx: 235, cy: 100, r: 4 },
  { cx: 155, cy: 155, r: 4 }, { cx: 245, cy: 155, r: 4 },
  { cx: 150, cy: 210, r: 3 }, { cx: 250, cy: 210, r: 3 },
  { cx: 200, cy: 170, r: 5, label: "Centro" },
  { cx: 185, cy: 240, r: 4 }, { cx: 215, cy: 240, r: 4 },
  { cx: 180, cy: 305, r: 4 }, { cx: 220, cy: 305, r: 4 },
  { cx: 175, cy: 360, r: 3 }, { cx: 225, cy: 360, r: 3 },
];

const LINES = [
  [1,2],[1,3],[2,4],[3,5],[4,6],[5,7],[1,8],
  [8,9],[8,10],[9,11],[10,12],[11,13],[12,14],
];

function HumanSVG() {
  return (
    <svg viewBox="0 60 400 340" className="w-full h-full" aria-hidden>
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6B7B68" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6B7B68" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Skeleton lines */}
      {LINES.map(([a, b], i) => {
        const A = DOTS[a], B = DOTS[b];
        return (
          <motion.line
            key={i}
            x1={A.cx} y1={A.cy} x2={B.cx} y2={B.cy}
            stroke="#6B7B68" strokeWidth="1.5" strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 1.2, delay: 0.5 + i * 0.05, ease: "easeOut" }}
          />
        );
      })}

      {/* Dots */}
      {DOTS.map((d, i) => (
        <motion.circle
          key={i}
          cx={d.cx} cy={d.cy} r={d.r}
          fill="#6B7B68"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.9 }}
          transition={{ duration: 0.4, delay: 0.8 + i * 0.04, ease: "backOut" }}
        />
      ))}

      {/* Scanning line */}
      <motion.line
        x1="120" y1="0" x2="280" y2="0"
        stroke="#6B7B68" strokeWidth="1" strokeDasharray="4 4"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: [60, 400, 60], opacity: [0, 0.4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1.5 }}
      />

      {/* Floating label */}
      <motion.g
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2, duration: 0.6 }}
      >
        <rect x="260" y="95" width="110" height="24" rx="12" fill="#6B7B68" fillOpacity="0.12" />
        <text x="315" y="111" textAnchor="middle" fontSize="10" fill="#6B7B68" fontFamily="monospace">
          Edad de Mov. 47
        </text>
      </motion.g>
    </svg>
  );
}

const trust = ["Solo 5 minutos", "Una webcam", "IA personalizada"];

export function Hero() {
  return (
    <section className="relative min-h-screen bg-cream flex flex-col overflow-hidden" id="hero">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cream via-cream to-cream2 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-sage/5 blur-[120px] pointer-events-none" />

      <div className="relative flex-1 max-w-6xl mx-auto w-full px-6 pt-32 pb-20 flex items-center">
        <div className="grid md:grid-cols-2 gap-16 items-center w-full">

          {/* Left: Text */}
          <div className="flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 text-xs font-medium text-sage tracking-widest uppercase"
            >
              <span className="w-6 h-px bg-sage" />
              Healthtech · IA · Longevidad
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-semibold text-ink leading-[1.05] tracking-tight"
            >
              Descubrí la edad real de tu{" "}
              <span className="text-sage">movimiento.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="text-xl text-ink2 leading-relaxed max-w-md"
            >
              La primera evaluación física con IA usando solo tu webcam.
              Conocé cuánto envejece —o rejuvenece— tu cuerpo, semana a semana.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.38 }}
              className="flex flex-col sm:flex-row gap-4 items-start"
              id="hero-cta"
            >
              <Button size="lg">
                Hacer evaluación gratuita →
              </Button>
              <button className="text-sm text-muted hover:text-ink transition-colors underline underline-offset-4">
                Ver cómo funciona
              </button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="flex items-center gap-6 flex-wrap"
            >
              {trust.map((t) => (
                <div key={t} className="flex items-center gap-2 text-sm text-ink2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sage" />
                  {t}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: AI Body Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-[3/4] max-w-sm mx-auto w-full"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-cream2/80 to-cream rounded-3xl border border-border" />
            <div className="absolute inset-0 p-8">
              <HumanSVG />
            </div>

            {/* Metric cards floating */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.8, duration: 0.6 }}
              className="absolute -left-6 top-1/4 bg-white/90 backdrop-blur rounded-2xl border border-border p-3 shadow-lg"
            >
              <p className="text-xs text-muted font-medium">Movilidad</p>
              <p className="text-2xl font-bold text-ink">87<span className="text-sm font-normal text-sage">%</span></p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 2, duration: 0.6 }}
              className="absolute -right-6 top-2/3 bg-white/90 backdrop-blur rounded-2xl border border-border p-3 shadow-lg"
            >
              <p className="text-xs text-muted font-medium">Equilibrio</p>
              <p className="text-2xl font-bold text-ink">92<span className="text-sm font-normal text-sage">%</span></p>
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="relative flex justify-center pb-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-xs text-muted tracking-widest uppercase"
        >
          <span>Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-muted/50 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
}
