"use client";
import { motion } from "framer-motion";

// Fuentes REALES usadas por el motor de la evaluación (lib/norms.ts).
// No inflar ni inventar: cada una corresponde a una tabla normativa publicada.
const tests = [
  {
    n: "01",
    test: "Equilibrio en una pierna",
    eng: "One-Leg Stand",
    mide: "Control neuromotor y estabilidad — de los primeros indicadores en envejecer.",
    fuente: "Springer et al., 2007",
    pub: "J. of Geriatric Physical Therapy",
  },
  {
    n: "02",
    test: "Sentadilla a silla · 30s",
    eng: "30-Second Chair Stand",
    mide: "Fuerza y resistencia del tren inferior.",
    fuente: "Rikli & Jones, 1999",
    pub: "Protocolo de referencia · CDC STEADI",
  },
  {
    n: "03",
    test: "Flexiones de brazos",
    eng: "Push-up Test",
    mide: "Fuerza de empuje del tren superior.",
    fuente: "ACSM / Cooper Institute · Yang et al., 2019",
    pub: "JAMA Network Open",
  },
  {
    n: "04",
    test: "Sentadilla profunda",
    eng: "Deep Squat · FMS",
    mide: "Movilidad y calidad del patrón de movimiento.",
    fuente: "Cook et al., 2014",
    pub: "Int. J. of Sports Physical Therapy",
  },
];

const steps = [
  { k: "Tu marca", v: "Repeticiones, segundos o rango que hace tu cuerpo." },
  { k: "Curva normativa", v: "Se ubica en la norma publicada por edad y sexo." },
  { k: "Edad-equivalente", v: "La curva devuelve a qué edad corresponde esa marca." },
  { k: "Edad de Movimiento", v: "Promedio ponderado de los cuatro ejes." },
];

export function EvidenceScience() {
  return (
    <section id="ciencia" className="brut-sec brut-concrete relative overflow-hidden border-t border-white/[0.14] bg-void px-6 py-32 text-chalk md:px-8 md:py-44">
      <div className="brut-grid absolute inset-0 opacity-50" aria-hidden />
      <div className="brut-display brut-outline-text pointer-events-none absolute -left-4 top-10 select-none text-[16rem] leading-none opacity-40 max-lg:hidden" aria-hidden>
        DOI
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-14 max-w-3xl">
          <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="brut-label mb-6">
            [ CIENCIA // EVIDENCIA DEL TEST ]
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
            className="brut-display text-[clamp(2.6rem,6vw,4.8rem)] text-chalk">
            Cada número se mide contra <span className="text-cyan">ciencia publicada.</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.16 }}
            className="mt-6 max-w-2xl text-base leading-7 text-chalk/65 md:text-lg">
            La Edad de Movimiento se apoya en cuatro tests con tablas normativas revisadas por pares. Tu marca se compara contra la norma por edad y sexo — el mismo principio de los relojes de edad biológica.
          </motion.p>
        </div>

        {/* Los 4 tests con su fuente */}
        <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
          {tests.map((t, i) => (
            <motion.div key={t.n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="-ml-px -mt-px flex flex-col gap-4 border border-white/[0.14] bg-white/[0.03] p-6 transition-colors duration-150 hover:border-cyan">
              <div className="flex items-center justify-between">
                <span className="brut-mono text-[0.62rem] font-bold text-chalk/40">{t.n}</span>
                <span className="brut-mono text-[0.58rem] uppercase tracking-[0.08em] text-cyan">{t.eng}</span>
              </div>
              <h3 className="brut-display text-xl leading-none text-chalk">{t.test}</h3>
              <p className="text-[0.9rem] leading-6 text-chalk/60">{t.mide}</p>
              <div className="mt-auto border-t border-white/[0.1] pt-3">
                <p className="brut-mono text-[0.62rem] font-bold uppercase tracking-[0.06em] text-chalk">{t.fuente}</p>
                <p className="brut-mono mt-1 text-[0.6rem] uppercase tracking-[0.04em] text-chalk/40">{t.pub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Cómo se calcula */}
        <div className="mt-10 border border-white/[0.14] bg-white/[0.02] p-6 md:p-8">
          <p className="brut-label mb-6 text-[0.62rem]">[ cómo_se_calcula ]</p>
          <div className="grid gap-0 md:grid-cols-4">
            {steps.map((s, i) => (
              <motion.div key={s.k} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="relative flex flex-col gap-2 border-white/[0.14] px-4 py-3 max-md:border-b md:border-l md:first:border-l-0 md:pl-5">
                <p className="brut-mono text-[0.66rem] font-bold uppercase tracking-[0.06em] text-cyan">{s.k}</p>
                <p className="text-[0.82rem] leading-6 text-chalk/60">{s.v}</p>
                {i < steps.length - 1 && <span className="brut-mono absolute -right-2 top-3 hidden text-cyan md:block" aria-hidden>→</span>}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Nota honesta */}
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="mt-8 flex items-start gap-3 border-l-2 border-cyan bg-white/[0.02] py-3 pl-4 text-sm leading-6 text-chalk/55">
          <span className="brut-mono mt-0.5 shrink-0 text-cyan">ℹ</span>
          <span>
            Es un índice simplificado para esta demo pública gratuita, pensado para orientarte — no reemplaza un diagnóstico clínico. La sentadilla profunda es cualitativa (sin curva poblacional), así que pesa menos en el cálculo, y cada resultado se entrega con su margen de error.
          </span>
        </motion.p>
      </div>
    </section>
  );
}
