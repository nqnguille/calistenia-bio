"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// Mega-zoom a la rodilla: ilustra CÓMO lee la tecnología cada articulación.
// El ángulo oscila como en una sentadilla real y los vectores tibia/fémur se
// mueven con él; los indicadores (velocidad angular, simetría, confianza,
// coordenadas) se derivan de ese ciclo, para que se sienta la lectura en vivo.
// Es una visualización del método, no detección sobre esta foto estática.

const K = { x: 34, y: 54 };   // rodilla (vértice)
const H = { x: 54, y: 18 };   // cadera
const SHIN = 46;              // largo de la tibia en el viewBox
const thighAng = Math.atan2(H.y - K.y, H.x - K.x); // rad

const readOut = [
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
  const [d, setD] = useState({ ang: 140, vel: 0, sym: 96, conf: 97 });
  const shinRef = useRef<SVGLineElement>(null);
  const arcRef = useRef<SVGPathElement>(null);
  const ankleRef = useRef<SVGGElement>(null);
  const startRef = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, lastPush = 0;
    const render = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const t = (now - startRef.current) / 1000;
      const ang = 128 + 32 * Math.sin(t * 0.9); // ~96°..160°
      const ankleAng = thighAng + (ang * Math.PI) / 180;
      const ax = K.x + SHIN * Math.cos(ankleAng);
      const ay = K.y + SHIN * Math.sin(ankleAng);

      // Tibia (fémur es fijo hacia la cadera)
      shinRef.current?.setAttribute("x2", ax.toFixed(2));
      shinRef.current?.setAttribute("y2", ay.toFixed(2));
      ankleRef.current?.setAttribute("transform", `translate(${ax.toFixed(2)} ${ay.toFixed(2)})`);

      // Arco del ángulo entre fémur y tibia
      const r = 15;
      const sx = K.x + r * Math.cos(thighAng), sy = K.y + r * Math.sin(thighAng);
      const ex = K.x + r * Math.cos(ankleAng), ey = K.y + r * Math.sin(ankleAng);
      arcRef.current?.setAttribute("d", `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${r} ${r} 0 0 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`);

      if (now - lastPush > 90) {
        lastPush = now;
        const vel = Math.abs(28.8 * Math.cos(t * 0.9));
        setD({
          ang: Math.round(ang),
          vel: Math.round(vel),
          sym: 94 + Math.round(4 * Math.abs(Math.sin(t * 1.7))),
          conf: 95 + Math.round(4 * Math.abs(Math.sin(t * 2.3))),
        });
      }
      if (!reduce) raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
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
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(/hero/zoom-knee.jpg)", filter: "grayscale(0.4) contrast(1.15) brightness(0.62) sepia(0.3) hue-rotate(150deg) saturate(1.4)" }} aria-hidden />
              <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(0,229,255,.09) 1px, transparent 1px)", backgroundSize: "100% 3px" }} aria-hidden />
              <div className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 140px rgba(0,0,0,0.75)" }} aria-hidden />

              {/* Overlay biomecánico */}
              <svg viewBox="0 0 100 120" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
                <defs>
                  <filter id="jg"><feGaussianBlur stdDeviation="0.7" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                </defs>
                <g filter="url(#jg)" stroke="#00E5FF" fill="none" strokeLinecap="round">
                  {/* fémur (fijo) */}
                  <line x1={K.x} y1={K.y} x2={H.x} y2={H.y} strokeWidth="1.1" opacity="0.9" />
                  {/* tibia (rota con el ángulo) */}
                  <line ref={shinRef} x1={K.x} y1={K.y} x2="42" y2="99" strokeWidth="1.1" opacity="0.9" />
                  {/* arco del ángulo */}
                  <path ref={arcRef} d="" strokeWidth="0.9" opacity="0.8" />
                </g>
                {/* landmarks */}
                <g fill="#00E5FF">
                  <rect x={H.x - 1.4} y={H.y - 1.4} width="2.8" height="2.8" />
                  <rect x={K.x - 1.6} y={K.y - 1.6} width="3.2" height="3.2" />
                  <g ref={ankleRef} transform="translate(42 99)"><rect x="-1.4" y="-1.4" width="2.8" height="2.8" /></g>
                </g>
                <g fill="#EDEDED" fontSize="2.6" fontFamily="monospace" opacity="0.7">
                  <text x={H.x + 2.5} y={H.y}>23·cadera</text>
                  <text x={K.x + 2.8} y={K.y - 2.5}>25·rodilla</text>
                </g>
                {/* reticón sobre la rodilla */}
                <g stroke="#00E5FF" strokeWidth="0.5" fill="none" opacity="0.85">
                  <circle cx={K.x} cy={K.y} r="7" strokeDasharray="2 3">
                    <animateTransform attributeName="transform" type="rotate" from={`0 ${K.x} ${K.y}`} to={`360 ${K.x} ${K.y}`} dur="8s" repeatCount="indefinite" />
                  </circle>
                </g>
              </svg>

              {/* Grado gigante */}
              <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 text-center">
                <p className="brut-mono text-[0.56rem] font-bold uppercase tracking-[0.14em] text-cyan/70">flexión rodilla</p>
                <p className="brut-display text-6xl leading-none text-cyan brut-glow tabular-nums">{d.ang}°</p>
              </div>

              {/* Readouts en tiempo real */}
              <div className="pointer-events-none absolute bottom-3 left-3 right-3 grid grid-cols-3 gap-2">
                {[
                  { k: "vel angular", v: `${d.vel}°/s` },
                  { k: "simetría", v: `${d.sym}%` },
                  { k: "confianza", v: `${d.conf}%` },
                ].map((m) => (
                  <div key={m.k} className="border border-white/[0.14] bg-black/75 px-2.5 py-2">
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
              {readOut.map((r, i) => (
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
