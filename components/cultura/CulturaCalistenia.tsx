"use client";
import { motion } from "framer-motion";

const C = {
  cream: "#F8F6F2",
  cream2: "#F1EEE8",
  ink: "#151716",
  ink2: "#343A36",
  border: "#DED9CE",
  sage: "#7A8F74",
  sage2: "#AFC3A5",
  muted: "#8E9188",
  forest: "#1E3A2B",
  petrol: "#203040",
  clay: "#B0673F",
};

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
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section style={{ background: C.petrol, paddingTop: 176, paddingBottom: 112 }} className="px-8">
        <div style={{ maxWidth: 1152, margin: "0 auto", textAlign: "center" }}>
          <motion.p {...reveal} className="section-label" style={{ justifyContent: "center", width: "100%" }}>
            De los parques de Nueva York a las barras de acá
          </motion.p>
          <motion.h1
            {...reveal}
            transition={{ ...reveal.transition, delay: 0.08 }}
            style={{
              fontSize: "clamp(2.6rem,6.4vw,5.2rem)",
              fontWeight: 900,
              color: C.cream,
              lineHeight: 0.98,
              letterSpacing: "-0.03em",
              margin: "28px 0 20px",
              maxWidth: 900,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            La cultura de la calistenia
          </motion.h1>
          <motion.p
            {...reveal}
            transition={{ ...reveal.transition, delay: 0.16 }}
            style={{
              fontSize: "1.1rem",
              color: "rgba(248,246,242,0.62)",
              lineHeight: 1.75,
              fontWeight: 300,
              maxWidth: 620,
              margin: "0 auto",
            }}
          >
            No es una tendencia de gimnasio: es un movimiento con treinta años de historia, nacido en parques
            públicos y sostenido por gente que entrena gratis, a la vista de todos. Esto es lo que hay documentado
            — con fuente citada en cada dato.
          </motion.p>
        </div>
      </section>

      {/* ───────────────────────── Timeline ───────────────────────── */}
      <section style={{ backgroundColor: C.cream, borderTop: `1px solid ${C.border}` }} className="py-52 px-8">
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <motion.p {...reveal} className="section-tag">La historia</motion.p>
          <motion.h2
            {...reveal}
            style={{
              fontSize: "clamp(2.1rem,4.4vw,3.4rem)",
              fontWeight: 900,
              color: C.ink,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              margin: "24px 0 56px",
              maxWidth: 700,
            }}
          >
            Treinta años, de una barra en Harlem a un mundial en Riga.
          </motion.h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {TIMELINE.map((item, i) => (
              <motion.div
                key={item.era}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr",
                  gap: 28,
                  padding: "26px 0",
                  borderTop: i === 0 ? "none" : `1px solid ${C.border}`,
                }}
              >
                <div>
                  <p style={{ color: C.sage, fontWeight: 900, fontSize: "0.92rem", letterSpacing: "-0.01em" }}>{item.era}</p>
                  <p style={{ color: C.muted, fontSize: "0.78rem", fontWeight: 600, marginTop: 2 }}>{item.lugar}</p>
                </div>
                <p style={{ color: C.ink2, fontSize: "1rem", lineHeight: 1.75, fontWeight: 300, margin: 0 }}>{item.texto}</p>
              </motion.div>
            ))}
          </div>

          <motion.p {...reveal} style={{ fontSize: "0.8rem", color: C.muted, marginTop: 32, lineHeight: 1.6 }}>
            Fuentes: Rolling Stone (2024), Wikipedia/estudios académicos sobre Hannibal for King (Mueller 2016;
            François &amp; Robène 2020), CrossFit Journal sobre Bartendaz, y las páginas oficiales de WSWCF.
          </motion.p>
        </div>
      </section>

      {/* ───────────────────────── Códigos ───────────────────────── */}
      <section style={{ backgroundColor: C.cream2, borderTop: `1px solid ${C.border}` }} className="py-52 px-8">
        <div style={{ maxWidth: 1152, margin: "0 auto" }}>
          <motion.p {...reveal} className="section-tag">Los códigos</motion.p>
          <motion.h2
            {...reveal}
            style={{
              fontSize: "clamp(2.1rem,4.4vw,3.4rem)",
              fontWeight: 900,
              color: C.ink,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              margin: "24px 0 56px",
              maxWidth: 760,
            }}
          >
            Lo que no cambió en treinta años.
          </motion.h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
            {CODIGOS.map((c, i) => (
              <motion.div
                key={c.t}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
                className="soft-card"
                style={{ borderRadius: 24, padding: 30 }}
              >
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: C.ink, letterSpacing: "-0.015em", margin: "0 0 10px" }}>{c.t}</h3>
                <p style={{ fontSize: "0.93rem", color: C.ink2, lineHeight: 1.7, fontWeight: 300, margin: 0 }}>{c.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── Argentina ───────────────────────── */}
      <section style={{ backgroundColor: C.cream, borderTop: `1px solid ${C.border}` }} className="py-52 px-8">
        <div style={{ maxWidth: 1152, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 64, alignItems: "start" }}>
            <div>
              <motion.p {...reveal} className="section-tag">La escena local</motion.p>
              <motion.h2
                {...reveal}
                style={{
                  fontSize: "clamp(2.1rem,4.4vw,3.2rem)",
                  fontWeight: 900,
                  color: C.ink,
                  lineHeight: 1.05,
                  letterSpacing: "-0.03em",
                  margin: "24px 0 24px",
                }}
              >
                También pasa acá.
              </motion.h2>
              <motion.p {...reveal} style={{ fontSize: "1.02rem", color: C.ink2, lineHeight: 1.8, fontWeight: 300, marginBottom: 18 }}>
                <strong style={{ fontWeight: 700 }}>Pablo Urruty</strong>, presidente de la Federación Internacional
                de Calistenia y Street Workout (ICSWF) y fundador de la Fundación Calistenia Argentina en 2012,
                es el nombre detrás de la formalización del deporte en el país.{" "}
                <strong style={{ fontWeight: 700 }}>Carlos Saona</strong>, campeón sudamericano, entrena tres veces
                por semana en el circuito de Plaza República de Haití, en Buenos Aires.
              </motion.p>
              <motion.p {...reveal} style={{ fontSize: "1.02rem", color: C.ink2, lineHeight: 1.8, fontWeight: 300 }}>
                Y la escena no termina en Buenos Aires: la plataforma comunitaria Calisthenics Parks tiene{" "}
                <strong style={{ fontWeight: 700 }}>7 puntos de entrenamiento registrados en la región de Neuquén</strong>,
                incluido un circuito sobre Avenida Coronel Olascoaga, en la capital.
              </motion.p>
            </div>

            <motion.div
              {...reveal}
              style={{ background: C.forest, borderRadius: 28, padding: "clamp(32px,5vw,52px)" }}
            >
              <p style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: C.sage2, marginBottom: 20 }}>
                Sumamos lo que falta
              </p>
              <p style={{ color: C.cream, fontSize: "1.15rem", fontWeight: 700, lineHeight: 1.4, marginBottom: 16 }}>
                Todavía no encontramos crews con nombre propio ni la jerga real de la escena neuquina.
              </p>
              <p style={{ color: "rgba(248,246,242,0.65)", fontSize: "0.94rem", lineHeight: 1.75, fontWeight: 300, marginBottom: 24 }}>
                Preferimos decir esto antes que inventarlo. Si entrenás en las barras de Neuquén, Cipolletti o
                alrededores — o conocés a quien lo hace — queremos escuchar esa historia y contarla bien, con tu
                nombre y tu barra.
              </p>
              <a
                href="/#faq"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  color: C.sage2,
                  fontWeight: 800,
                  fontSize: "0.92rem",
                  textDecoration: "none",
                }}
              >
                Contanos tu historia →
              </a>
            </motion.div>
          </div>

          <motion.p {...reveal} style={{ fontSize: "0.8rem", color: C.muted, marginTop: 40, lineHeight: 1.6 }}>
            Fuentes: Gobierno de la Ciudad de Buenos Aires, ICSWF, Fundación Calistenia Argentina, Calisthenics
            Parks (directorio comunitario de puntos de entrenamiento).
          </motion.p>
        </div>
      </section>

      {/* ───────────────────────── CTA final ───────────────────────── */}
      <section style={{ backgroundColor: C.cream2, borderTop: `1px solid ${C.border}` }} className="py-52 px-8">
        <div style={{ maxWidth: 1152, margin: "0 auto" }}>
          <motion.div
            {...reveal}
            style={{ background: C.forest, borderRadius: 28, padding: "clamp(56px,8vw,96px) clamp(28px,6vw,80px)", textAlign: "center" }}
          >
            <p style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: C.sage2, marginBottom: 24 }}>
              La cultura, con tu cuerpo
            </p>
            <h2
              style={{
                fontSize: "clamp(2rem,4.6vw,3.6rem)",
                fontWeight: 900,
                color: C.cream,
                lineHeight: 1,
                letterSpacing: "-0.03em",
                margin: "0 0 20px",
              }}
            >
              Treinta años de historia, tu primera dominada.
            </h2>
            <p style={{ fontSize: "1.02rem", color: "rgba(248,246,242,0.65)", lineHeight: 1.7, fontWeight: 300, maxWidth: 540, margin: "0 auto 44px" }}>
              El Método FLORA toma la ciencia del entrenamiento y la aplica con tu propio peso — la misma
              herramienta que usa esta cultura hace tres décadas.
            </p>
            <motion.a
              href="/metodo/"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 16,
                background: C.cream,
                color: C.ink,
                fontWeight: 700,
                fontSize: "1rem",
                padding: "16px 36px",
                borderRadius: 999,
                cursor: "pointer",
              }}
            >
              Conocer el Método FLORA <span style={{ color: C.sage }}>→</span>
            </motion.a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
