"use client";
import { motion } from "framer-motion";

const C = {
  cream: "#F8F6F2",
  cream2: "#F1EEE8",
  ink: "#151716",
  ink2: "#343A36",
  sage: "#7A8F74",
  muted: "#8E9188",
  border: "#DED9CE",
  dark: "#080B0F",
  dark2: "#111821",
  petrol: "#203040",
};

const pillars = [
  {
    icon: "◎",
    title: "Cada movimiento",
    desc: "Cada sesión genera datos biomecánicos anonimizados que alimentan el modelo global y mejoran la precisión para todos.",
  },
  {
    icon: "⊕",
    title: "Cada evaluación",
    desc: "Las evaluaciones semanales crean una línea de tiempo longitudinal de salud motora única en el mundo.",
  },
  {
    icon: "◈",
    title: "Cada mejora",
    desc: "Los avances individuales se convierten en evidencia de que el movimiento consistente rejuvenece el cuerpo.",
  },
];

export function RealWorldEvidence() {
  return (
    <section
      style={{ backgroundColor: C.dark, overflow: "hidden", position: "relative" }}
      className="py-52 px-8"
    >
      {/* Grid pattern overlay */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(122,143,116,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(122,143,116,0.04) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth:1152, margin:"0 auto" }}>
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <p className="section-tag" style={{ color: C.sage }}>
            Evidencia del mundo real
          </p>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.1 }}
          style={{
            fontSize: "clamp(2.5rem,4.5vw,4.5rem)",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            lineHeight: 0.95,
            color: C.cream,
            maxWidth: 680,
            marginBottom: 24,
          }}
        >
          Construimos evidencia del mundo real.
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.18 }}
          style={{
            fontSize: "1.05rem",
            lineHeight: 1.75,
            fontWeight: 300,
            color: C.muted,
            maxWidth: 500,
            marginBottom: 64,
          }}
        >
          Cada usuario contribuye —con su consentimiento— a la base de datos más grande
          del mundo sobre salud motora en adultos. No hipótesis. Datos reales.
        </motion.p>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.55 }}
              style={{
                backgroundColor: C.dark2,
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 20,
                padding: "32px 28px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                transition: "border-color 0.2s",
              }}
              whileHover={{ borderColor: `${C.sage}44` } as Record<string, string>}
            >
              <span style={{ fontSize: "1.6rem", color: C.sage }}>{p.icon}</span>
              <h3 style={{ color: C.cream, fontWeight: 700, fontSize: "1.1rem" }}>{p.title}</h3>
              <p
                style={{
                  fontSize: "1.05rem",
                  lineHeight: 1.75,
                  fontWeight: 300,
                  color: C.muted,
                  flex: 1,
                }}
              >
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Transparency box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.35 }}
          style={{
            border: `1px solid ${C.sage}44`,
            backgroundColor: `${C.sage}0d`,
            borderRadius: 20,
            padding: "32px 36px",
          }}
        >
          <p
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              color: C.sage,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            Compromiso de transparencia
          </p>
          <p
            style={{
              fontSize: "1.05rem",
              lineHeight: 1.75,
              fontWeight: 300,
              color: `${C.cream}bb`,
              maxWidth: 680,
            }}
          >
            No hacemos afirmaciones médicas. No prometemos curaciones. Lo que sí prometemos:
            medición rigurosa, metodología transparente, y evidencia observable de que el
            movimiento consistente mejora cómo funciona tu cuerpo.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
