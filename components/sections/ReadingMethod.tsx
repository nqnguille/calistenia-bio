"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ZoomReader, type ReaderExample } from "@/components/shared/ZoomReader";
import { LM } from "@/lib/pose-engine";

const legL = { a: LM.L_HIP, b: LM.L_KNEE, c: LM.L_ANKLE, ids: [23, 25, 27] as [number, number, number] };
const legR = { a: LM.R_HIP, b: LM.R_KNEE, c: LM.R_ANKLE, ids: [24, 26, 28] as [number, number, number] };
const armL = { a: LM.L_SHOULDER, b: LM.L_ELBOW, c: LM.L_WRIST, ids: [11, 13, 15] as [number, number, number] };
const armR = { a: LM.R_SHOULDER, b: LM.R_ELBOW, c: LM.R_WRIST, ids: [12, 14, 16] as [number, number, number] };

const EXAMPLES: (ReaderExample & { tab: string; note: string })[] = [
  { id: "squat", tab: "Sentadilla", metric: "flexión rodilla", note: "Rodilla · cadera · tobillo — el tren inferior en flexión.", video: "posedemo-v3", pose: "/hero/posedemo-pose.json", origin: "50% 74%", scale: 2, joints: [legL, legR], label: "Sentadilla" },
  { id: "lunge", tab: "Estocada", metric: "flexión rodilla", note: "Rodilla adelantada + cadera — control unilateral y equilibrio.", video: "posedemo-lunge", pose: "/hero/lunge-pose.json", origin: "50% 66%", scale: 1.7, joints: [legL, legR], label: "Estocada" },
  { id: "pullup", tab: "Dominadas", metric: "flexión codo", note: "Hombro · codo · muñeca — fuerza de tracción del tren superior en la barra.", video: "posedemo-bars", pose: "/hero/bars-pose.json", origin: "50% 34%", scale: 1.8, joints: [armL, armR], label: "Dominadas" },
];

const legend = [
  { t: "Ángulo articular", d: "El grado exacto de flexión en cada articulación, cuadro a cuadro." },
  { t: "Velocidad angular", d: "Qué tan rápido se mueve la articulación — control y explosividad." },
  { t: "Simetría izq / der", d: "Compara ambos lados para detectar compensaciones." },
  { t: "Confianza de lectura", d: "Cuán segura está la IA de cada punto que ubica." },
];

export function ReadingMethod() {
  const [sel, setSel] = useState(EXAMPLES[0]);

  return (
    <section id="lectura" className="brut-sec brut-concrete relative overflow-hidden border-t border-white/[0.14] bg-concrete px-6 py-32 text-chalk md:px-8 md:py-44">
      <div className="brut-grid absolute inset-0 opacity-50" aria-hidden />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-10 max-w-3xl">
          <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="brut-label mb-6">
            [ LECTURA // BIOMECÁNICA EN DETALLE ]
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
            className="brut-display text-[clamp(2.6rem,6vw,4.8rem)] text-chalk">
            Cómo lee la tecnología <span className="text-cyan">tu cuerpo.</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.16 }}
            className="mt-6 max-w-2xl text-base leading-7 text-chalk/65 md:text-lg">
            Sobre cada articulación, treinta veces por segundo, la IA mide el ángulo, la velocidad y la simetría. Elegí un ejercicio y miralo en detalle — el esqueleto sale de la detección real, siempre pegado al cuerpo.
          </motion.p>
        </div>

        {/* Selector de ejemplos */}
        <div className="mb-6 flex flex-wrap">
          {EXAMPLES.map((e) => (
            <button
              key={e.id}
              onClick={() => setSel(e)}
              className={`brut-mono -ml-px border px-5 py-3 text-[0.72rem] font-bold uppercase tracking-[0.08em] transition-colors first:ml-0 ${
                sel.id === e.id ? "border-cyan bg-cyan/10 text-cyan" : "border-white/[0.14] bg-white/[0.03] text-chalk/55 hover:border-cyan/60 hover:text-chalk"
              }`}
            >
              {e.tab}
            </button>
          ))}
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-12">
          <div>
            <ZoomReader key={sel.id} ex={sel} />
            <p className="brut-mono mt-3 text-[0.62rem] uppercase tracking-[0.06em] text-chalk/40">
              {sel.note}
            </p>
          </div>

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
            <p className="mt-4 flex items-start gap-2.5 border-l-2 border-cyan bg-white/[0.02] py-2.5 pl-4 text-[0.82rem] leading-6 text-chalk/55">
              <span className="brut-mono mt-0.5 shrink-0 text-cyan">ℹ</span>
              <span>Los ángulos se calculan sobre la pose <span className="text-chalk/80">3D</span> que estima el modelo, así el ángulo de la cámara casi no influye. Y en la evaluación real medimos sobre todo <span className="text-chalk/80">repeticiones, tiempos y umbrales</span> —lo más confiable con una sola cámara— y te guiamos a la mejor posición para cada test.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
