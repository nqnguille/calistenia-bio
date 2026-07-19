"use client";
import { motion } from "framer-motion";
import { ShaderHero } from "@/components/shared/ShaderHero";

const reveal = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: "easeOut" as const },
};

const TIMELINE = [
  {
    era: "Años 90",
    lugar: "Parques de Nueva York",
    texto:
      "La cultura nace en los playgrounds públicos, no en un gimnasio. Practicantes como Zef Zakaveli instalan una idea que persiste hasta hoy: el estilo con el que te movés importa tanto como la fuerza que mostrás.",
  },
  {
    era: "Años 2000",
    lugar: "Wingate Park, Brooklyn",
    texto:
      "La escena se consolida alrededor de una barra pública en Brooklyn, donde una generación de pioneros fija el estándar técnico que después se volvería global.",
  },
  {
    era: "2003",
    lugar: "Bartendaz, Harlem",
    texto:
      "Hassan Yasin-Bradley funda Bartendaz en un parque de Harlem: entrenamiento gratuito, progresión por los siete movimientos naturales (flexiones, dominadas, sentadillas, zancadas, saltos, fondos, plancha) y una sesión abierta a cualquiera los sábados. El código fundacional de la cultura, en estado puro.",
  },
  {
    era: "Julio 2008",
    lugar: "YouTube",
    texto:
      "Un video de Hannibal Lanham (\"Hannibal for King\") haciendo planche, front lever y muscle-ups se vuelve viral — más de 9,5 millones de vistas para 2014. Es el momento que la propia literatura académica señala como el disparador de la explosión global: de ahí en más, cualquiera con una cámara y una barra podía mostrar lo que sabía hacer.",
  },
  {
    era: "Desde 2011",
    lugar: "WSWCF",
    texto:
      "La cultura se formaliza sin dejar de ser callejera: la World Street Workout & Calisthenics Federation organiza mundiales separados de freestyle (estilo libre, acrobacia) y de fuerza (streetlifting) — las dos almas de la disciplina, compitiendo bajo el mismo techo.",
  },
];

const CODIGOS = [
  {
    t: "El parque es el gimnasio",
    d: "Nada de membresía. Una barra pública alcanza. Es una elección de fondo, no solo de presupuesto: entrenar a la vista de cualquiera es parte del código.",
  },
  {
    t: "Se progresa por habilidades, no por PRs",
    d: "El objetivo no es un número en una planilla: es una dominada que se vuelve muscle-up, que se vuelve front lever, que se vuelve planche. Cada truco nuevo se gana.",
  },
  {
    t: "La barra no miente",
    d: "No hay máquina que te ayude a compensar una técnica floja. Lo que podés hacer con tu cuerpo, lo podés hacer — no hay forma de simularlo.",
  },
  {
    t: "La sesión abierta es el corazón",
    d: "Desde Bartendaz hasta cualquier parque hoy: la práctica se enseña puertas afuera. El que sabe más, le muestra al que recién empieza.",
  },
];

export function CulturaCalistenia() {
  return (
    <>
      {/* ───────────────────────── Hero WebGL ───────────────────────── */}
      <section id="cultura-hero" className="brut-sec relative">
        <ShaderHero
          imageSrc="/hero/cultura.jpg"
          fallbackSrc="/hero/cultura_duo.jpg"
          minH="72vh"
          darken={0.5}
        >
          <div className="mx-auto flex min-h-[72vh] max-w-5xl flex-col justify-center px-5 pb-16 pt-32 md:px-6 md:pt-36">
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="brut-label mb-5 flex items-center gap-3"
            >
              <span className="inline-block h-2 w-2 bg-cyan brut-glow" />
              [CULT_00 // CULTURA]
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.06 }}
              className="brut-mono mb-4 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-chalk/60"
            >
              De los parques de Nueva York a las barras de acá
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="brut-display max-w-[900px] text-[clamp(3rem,8vw,7rem)] drop-shadow-[0_4px_40px_rgba(0,0,0,0.7)]"
            >
              La cultura de la <span className="text-cyan brut-glow">calistenia</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.26 }}
              className="mt-7 max-w-xl border-l-2 border-cyan bg-black/30 py-1 pl-4 text-base leading-[1.7] text-chalk/85 backdrop-blur-sm md:text-lg"
            >
              No es una tendencia de gimnasio: es un movimiento con treinta años de historia, nacido en parques
              públicos y sostenido por gente que entrena gratis, a la vista de todos. Esto es lo que hay documentado
              — con fuente citada en cada dato.
            </motion.p>
          </div>
        </ShaderHero>
      </section>

      {/* ───────────────────────── Timeline ───────────────────────── */}
      <section className="brut-sec brut-concrete relative overflow-hidden bg-concrete py-52 px-8 text-chalk">
        <div
          className="brut-display brut-outline-text pointer-events-none absolute -left-6 top-10 select-none text-[20rem] leading-none opacity-50 max-lg:hidden"
          aria-hidden
        >
          30
        </div>

        <div className="relative mx-auto max-w-[900px]">
          <motion.p {...reveal} className="brut-label mb-6">
            [CULT_02 // LA_HISTORIA]
          </motion.p>
          <motion.h2
            {...reveal}
            className="brut-display mb-14 max-w-[700px] text-[clamp(2.6rem,6vw,4.6rem)]"
          >
            Treinta años, de una barra en Harlem a un mundial en Riga.
          </motion.h2>

          <div className="flex flex-col">
            {TIMELINE.map((item, i) => (
              <motion.div
                key={item.era}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
                className={`grid gap-7 py-[26px] md:grid-cols-[140px_1fr] ${i === 0 ? "" : "border-t border-white/[0.14]"}`}
              >
                <div>
                  <p className="brut-display text-2xl text-cyan">{item.era}</p>
                  <p className="brut-mono mt-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-chalk/45">
                    {item.lugar}
                  </p>
                </div>
                <p className="m-0 text-base leading-[1.75] text-chalk/70">{item.texto}</p>
              </motion.div>
            ))}
          </div>

          <motion.p {...reveal} className="brut-mono mt-8 text-[0.7rem] leading-[1.6] text-chalk/40">
            Fuentes: Rolling Stone (2024), Wikipedia/estudios académicos sobre Hannibal for King (Mueller 2016;
            François &amp; Robène 2020), CrossFit Journal sobre Bartendaz, y las páginas oficiales de WSWCF.
          </motion.p>
        </div>
      </section>

      {/* ───────────────────────── Códigos ───────────────────────── */}
      <section className="brut-sec brut-concrete relative bg-void py-52 px-8 text-chalk">
        <div className="relative mx-auto max-w-6xl">
          <motion.p {...reveal} className="brut-label mb-6">
            [CULT_03 // LOS_CODIGOS]
          </motion.p>
          <motion.h2
            {...reveal}
            className="brut-display mb-14 max-w-[760px] text-[clamp(2.6rem,6vw,4.6rem)]"
          >
            Lo que no cambió en treinta años.
          </motion.h2>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CODIGOS.map((c, i) => (
              <motion.div
                key={c.t}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
                className="group border border-white/[0.14] bg-white/[0.03] p-7 transition-colors hover:border-cyan"
              >
                <p className="brut-mono mb-4 text-[0.62rem] font-bold text-cyan" aria-hidden>
                  0{i + 1}_
                </p>
                <h3 className="brut-display mb-3 text-xl text-chalk">{c.t}</h3>
                <p className="m-0 text-[0.93rem] leading-[1.7] text-chalk/65">{c.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── Argentina ───────────────────────── */}
      <section className="brut-sec brut-concrete relative bg-concrete py-52 px-8 text-chalk">
        <div className="relative mx-auto max-w-6xl">
          <div className="grid items-start gap-16 lg:grid-cols-2">
            <div>
              <motion.p {...reveal} className="brut-label mb-6">
                [CULT_04 // LA_ESCENA_LOCAL]
              </motion.p>
              <motion.h2 {...reveal} className="brut-display mb-6 text-[clamp(2.6rem,6vw,4.6rem)]">
                También pasa acá.
              </motion.h2>
              <motion.p {...reveal} className="mb-[18px] text-[1.02rem] leading-[1.8] text-chalk/70">
                <strong className="font-bold text-chalk">Pablo Urruty</strong>, presidente de la Federación Internacional
                de Calistenia y Street Workout (ICSWF) y fundador de la Fundación Calistenia Argentina en 2012,
                es el nombre detrás de la formalización del deporte en el país.{" "}
                <strong className="font-bold text-chalk">Carlos Saona</strong>, campeón sudamericano, entrena tres veces
                por semana en el circuito de Plaza República de Haití, en Buenos Aires.
              </motion.p>
              <motion.p {...reveal} className="text-[1.02rem] leading-[1.8] text-chalk/70">
                Y la escena no termina en Buenos Aires: la plataforma comunitaria Calisthenics Parks tiene{" "}
                <strong className="font-bold text-chalk">7 puntos de entrenamiento registrados en la región de Neuquén</strong>,
                incluido un circuito sobre Avenida Coronel Olascoaga, en la capital.
              </motion.p>
            </div>

            <motion.div {...reveal} className="brut-panel-raised relative p-[clamp(32px,5vw,52px)]">
              <span className="brut-mono absolute left-2 top-1 text-xs text-cyan/60" aria-hidden>+</span>
              <span className="brut-mono absolute bottom-1 right-2 text-xs text-cyan/60" aria-hidden>+</span>
              <p className="brut-label mb-5">[sumamos_lo_que_falta]</p>
              <p className="brut-display mb-4 text-2xl leading-tight text-chalk">
                Todavía no encontramos crews con nombre propio ni la jerga real de la escena neuquina.
              </p>
              <p className="mb-6 text-[0.94rem] leading-[1.75] text-chalk/65">
                Preferimos decir esto antes que inventarlo. Si entrenás en las barras de Neuquén, Cipolletti o
                alrededores — o conocés a quien lo hace — queremos escuchar esa historia y contarla bien, con tu
                nombre y tu barra.
              </p>
              <a href="/#faq" className="brut-btn-ghost px-6 py-3 text-xs">
                Contanos tu historia →
              </a>
            </motion.div>
          </div>

          <motion.p {...reveal} className="brut-mono mt-10 text-[0.7rem] leading-[1.6] text-chalk/40">
            Fuentes: Gobierno de la Ciudad de Buenos Aires, ICSWF, Fundación Calistenia Argentina, Calisthenics
            Parks (directorio comunitario de puntos de entrenamiento).
          </motion.p>
        </div>
      </section>

      {/* ───────────────────────── CTA final ───────────────────────── */}
      <section className="brut-sec brut-concrete relative overflow-hidden bg-void py-52 px-8 text-chalk">
        <div className="brut-grid absolute inset-0 opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-6xl">
          <motion.div
            {...reveal}
            className="brut-panel-raised relative overflow-hidden px-[clamp(28px,6vw,80px)] py-[clamp(56px,8vw,96px)] text-center"
          >
            <div className="brut-hazard absolute left-0 right-0 top-0 h-[3px] opacity-50" aria-hidden />
            <p className="brut-label mb-6 justify-center">[CULT_05 // LA_CULTURA_CON_TU_CUERPO]</p>
            <h2 className="brut-display mx-auto mb-5 max-w-[820px] text-[clamp(2.6rem,6vw,4.6rem)]">
              Treinta años de historia, tu primera dominada.
            </h2>
            <p className="mx-auto mb-11 max-w-[540px] text-[1.02rem] leading-[1.7] text-chalk/65">
              El Método FLORA toma la ciencia del entrenamiento y la aplica con tu propio peso — la misma
              herramienta que usa esta cultura hace tres décadas.
            </p>
            <a href="/metodo/" className="brut-btn px-9 py-4 text-sm">
              Conocer el Método FLORA →
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
