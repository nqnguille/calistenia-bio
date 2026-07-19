"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Mega-zoom a la rodilla: ilustra CÓMO lee la tecnología una articulación.
// El esqueleto (cadera·rodilla·tobillo) está FIJO sobre la pierna real de la
// foto — es un cuadro congelado siendo medido. Lo que se mueve son los
// indicadores (retículo, escaneo, lecturas), para que se sienta el análisis en
// vivo sin despegarse de la pierna.

// Coordenadas reales de la pierna en el viewBox 0-100 x / 0-120 y (medidas sobre la foto).
const HIP = { x: 31, y: 11 };
const KNEE = { x: 16, y: 49 };
const ANKLE = { x: 24, y: 84 };

const femA = Math.atan2(HIP.y - KNEE.y, HIP.x - KNEE.x);
const tibA = Math.atan2(ANKLE.y - KNEE.y, ANKLE.x - KNEE.x);
const BASE_ANG = Math.round(Math.min(Math.abs((tibA - femA) * 180 / Math.PI), 360 - Math.abs((tibA - femA) * 180 / Math.PI)));
const R = 13;
const arcPath = `M ${(KNEE.x + R * Math.cos(femA)).toFixed(1)} ${(KNEE.y + R * Math.sin(femA)).toFixed(1)} A ${R} ${R} 0 0 1 ${(KNEE.x + R * Math.cos(tibA)).toFixed(1)} ${(KNEE.y + R * Math.sin(tibA)).toFixed(1)}`;

const readBottom = [
  { k: "landmarks", v: "33 pts" },
  { k: "frecuencia", v: "30 fps" },
  { k: "eje", v: "cadera·rodilla·tobillo" },
];

const legend = [
  { t: "Ángulo articular", d: "El grado exacto de flexión en cada articulación, cuadro a cuadro." },
  { t: "Velocidad angular", d: "Qué tan rápido se mueve la articulación — control y explosividad." },
  { t: "Simetría izq / der", d: "Compara ambos lados para detectar compensaciones." },
  { t: "Confianza de lectura", d: "Cuán segura está la IA de cada punto que ubica." },
];

export function ReadingMethod() {
  const [d, setD] = useState({ ang: BASE_ANG, vel: 24, sym: 96, conf: 97 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0, start = 0, last = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = (now - start) / 1000;
      if (now - last > 110) {
        last = now;
        setD({
          ang: BASE_ANG + Math.round(Math.sin(t * 1.3)),
          vel: 22 + Math.round(4 * Math.abs(Math.sin(t * 0.8)) + 2 * Math.abs(Math.sin(t * 3.1))),
          sym: 94 + Math.round(4 * Math.abs(Math.sin(t * 1.7))),
          conf: 95 + Math.round(4 * Math.abs(Math.sin(t * 2.3))),
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section id="lectura" className="brut-sec brut-concrete relative overflow-hidden border-t border-white/[0.14] bg-concrete px-6 py-32 text-chalk md:px-8 md:py-44">
      <div className="brut-grid absolute inset-0 opacity-50" aria-hidden />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-14 max-w-3xl">
          <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="brut-label mb-6">
            [ LECTURA // BIOMECÁNICA EN DETALLE ]
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
            className="brut-display text-[clamp(2.6rem,6vw,4.8rem)] text-chalk">
            Cómo lee la tecnología <span className="text-cyan">tu cuerpo.</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.16 }}
            className="mt-6 max-w-2xl text-base leading-7 text-chalk/65 md:text-lg">
            Sobre cada articulación, treinta veces por segundo, la IA mide el ángulo, la velocidad y la simetría. Acá, en detalle, la rodilla durante una sentadilla.
          </motion.p>
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-12">
          {/* MEGA ZOOM */}
          <div className="brut-panel-raised relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.14] bg-black/50 px-4 py-3">
              <span className="brut-mono text-[0.66rem] font-bold uppercase tracking-[0.1em] text-chalk/50">joint_reader · ×8</span>
              <span className="brut-mono flex items-center gap-2 text-[0.66rem] font-bold uppercase tracking-[0.1em] text-cyan">
                <span className="h-2 w-2 animate-pulse bg-cyan" /> tracking · locked
              </span>
            </div>

            <div className="relative aspect-[5/6] w-full bg-black">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(/hero/zoom-knee.jpg)", filter: "grayscale(0.4) contrast(1.12) brightness(0.66) sepia(0.3) hue-rotate(150deg) saturate(1.35)" }} aria-hidden />
              <div className="pointer-events-none absolute inset-0 opacity-25" style={{ backgroundImage: "linear-gradient(rgba(0,229,255,.09) 1px, transparent 1px)", backgroundSize: "100% 3px" }} aria-hidden />
              <div className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 140px rgba(0,0,0,0.72)" }} aria-hidden />

              {/* Overlay biomecánico FIJO sobre la pierna real */}
              <svg viewBox="0 0 100 120" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
                <defs>
                  <filter id="jg"><feGaussianBlur stdDeviation="0.7" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                </defs>
                {/* barrido de escaneo */}
                <motion.line x1="0" x2="100" stroke="#00E5FF" strokeWidth="0.6" opacity="0.5"
                  initial={{ y1: 8, y2: 8 }} animate={{ y1: [8, 112, 8], y2: [8, 112, 8] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} />
                <g filter="url(#jg)" stroke="#00E5FF" fill="none" strokeLinecap="round">
                  <line x1={KNEE.x} y1={KNEE.y} x2={HIP.x} y2={HIP.y} strokeWidth="1.2" opacity="0.92" />
                  <line x1={KNEE.x} y1={KNEE.y} x2={ANKLE.x} y2={ANKLE.y} strokeWidth="1.2" opacity="0.92" />
                  <path d={arcPath} strokeWidth="0.9" opacity="0.85" />
                </g>
                {/* landmarks con pulso */}
                {[HIP, KNEE, ANKLE].map((p, i) => (
                  <g key={i}>
                    <motion.rect x={p.x - (i === 1 ? 1.7 : 1.4)} y={p.y - (i === 1 ? 1.7 : 1.4)} width={i === 1 ? 3.4 : 2.8} height={i === 1 ? 3.4 : 2.8} fill="#00E5FF"
                      animate={{ opacity: [1, 0.45, 1] }} transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.3 }} />
                  </g>
                ))}
                <g fill="#EDEDED" fontSize="2.5" fontFamily="monospace" opacity="0.72">
                  <text x={HIP.x + 2.5} y={HIP.y - 1}>23·cadera</text>
                  <text x={KNEE.x - 12} y={KNEE.y + 0.5}>25·rodilla</text>
                  <text x={ANKLE.x + 2.5} y={ANKLE.y + 1}>27·tobillo</text>
                </g>
                {/* retículo giratorio sobre la rodilla */}
                <g stroke="#00E5FF" strokeWidth="0.5" fill="none" opacity="0.85">
                  <circle cx={KNEE.x} cy={KNEE.y} r="7" strokeDasharray="2 3">
                    <animateTransform attributeName="transform" type="rotate" from={`0 ${KNEE.x} ${KNEE.y}`} to={`360 ${KNEE.x} ${KNEE.y}`} dur="8s" repeatCount="indefinite" />
                  </circle>
                </g>
              </svg>

              {/* Grado gigante (arriba a la derecha, lejos de la pierna) */}
              <div className="pointer-events-none absolute right-3 top-3 border border-cyan/40 bg-black/70 px-3 py-2 text-right">
                <p className="brut-mono text-[0.54rem] font-bold uppercase tracking-[0.12em] text-cyan/70">flexión rodilla</p>
                <p className="brut-display text-5xl leading-none text-cyan brut-glow tabular-nums">{d.ang}°</p>
              </div>

              {/* Readouts en tiempo real */}
              <div className="pointer-events-none absolute bottom-3 left-3 right-3 grid grid-cols-3 gap-2">
                {[
                  { k: "vel angular", v: `${d.vel}°/s` },
                  { k: "simetría", v: `${d.sym}%` },
                  { k: "confianza", v: `${d.conf}%` },
                ].map((m) => (
                  <div key={m.k} className="border border-white/[0.14] bg-black/78 px-2.5 py-2">
                    <p className="brut-mono text-[0.5rem] font-bold uppercase tracking-[0.06em] text-chalk/40">{m.k}</p>
                    <p className="brut-display text-lg leading-none text-cyan tabular-nums">{m.v}</p>
                  </div>
                ))}
              </div>

              {["left-2 top-10 border-l-2 border-t-2", "right-2 top-10 border-r-2 border-t-2", "left-2 bottom-20 border-l-2 border-b-2", "right-2 bottom-20 border-r-2 border-b-2"].map((c) => (
                <span key={c} className={`pointer-events-none absolute ${c} h-4 w-4 border-cyan/70`} aria-hidden />
              ))}
            </div>

            <div className="grid grid-cols-3 border-t border-white/[0.14] bg-black/40">
              {readBottom.map((r, i) => (
                <div key={r.k} className={`px-3 py-2.5 text-center ${i ? "border-l border-white/[0.1]" : ""}`}>
                  <p className="brut-mono text-[0.5rem] font-bold uppercase tracking-[0.06em] text-chalk/40">{r.k}</p>
                  <p className="brut-mono text-[0.72rem] font-bold uppercase text-cyan">{r.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Leyenda: qué mide */}
          <div className="flex flex-col gap-0">
            <p className="brut-label mb-5 text-[0.62rem]">[ qué_mide_en_cada_articulación ]</p>
            {legend.map((l, i) => (
              <motion.div key={l.t} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="-mt-px flex gap-4 border border-white/[0.14] bg-white/[0.03] p-5 transition-colors hover:border-cyan">
                <span className="brut-display text-2xl leading-none text-cyan/80">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="brut-mono text-sm font-bold uppercase tracking-[0.04em] text-chalk">{l.t}</p>
                  <p className="mt-1.5 text-[0.9rem] leading-6 text-chalk/60">{l.d}</p>
                </div>
              </motion.div>
            ))}
            <p className="brut-mono mt-5 text-[0.62rem] uppercase leading-5 tracking-[0.06em] text-chalk/35">
              todo desde el navegador · sin sensores · sin ropa especial · solo tu cámara
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
