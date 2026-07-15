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
};

const reveal = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: "easeOut" as const },
};

const PILARES = [
  {
    letra: "F",
    nombre: "Fuerza",
    frase: "Tu peso es el gimnasio.",
    texto:
      "Dominadas, fondos, sentadillas a una pierna. Los movimientos grandes primero, los detalles después. Cada semana le pedís a tu cuerpo un poquito más que la anterior: una repetición, una serie, una variante más exigente. Eso —y no la motivación— es lo que construye músculo.",
  },
  {
    letra: "L",
    nombre: "Longevidad",
    frase: "El músculo es el órgano de la juventud.",
    texto:
      "No entrenamos para el verano: entrenamos para bajar tu Edad de Movimiento. La fuerza es el pilar mejor documentado de la salud a largo plazo — sostiene tu metabolismo, tus huesos y tu cabeza. Piernas fuertes hoy son independencia dentro de 40 años.",
  },
  {
    letra: "O",
    nombre: "Orden",
    frase: "Lo que se registra, mejora.",
    texto:
      "Entrenar “a sensación” es entrenar a ciegas: la sensación cambia con el ánimo y el sueño. El método vive en el registro — qué hiciste, cuántas veces, cuánto te costó. Tu único rival es tu semana anterior, y para ganarle primero hay que anotarla.",
  },
  {
    letra: "R",
    nombre: "Recuperación",
    frase: "El cuerpo crece cuando descansás.",
    texto:
      "El entrenamiento es la semilla; el crecimiento pasa después, durmiendo y comiendo bien. Si dormís poco o vivís estresado, tu capacidad de absorber entrenamiento baja — y el método se adapta: menos dosis, mejor ejecutada.",
  },
  {
    letra: "A",
    nombre: "Alimentación",
    frase: "Consciente, real, sin dietas mágicas.",
    texto:
      "Plato en tercios: verduras, proteína, energía. Proteína en cada comida, comida real cocinada en casa, y un margen para disfrutar sin culpa — la restricción total no se sostiene, y lo que no se sostiene no funciona. Comer consciente es saber qué estás eligiendo y por qué.",
  },
];

const RIEGO = [
  {
    nivel: "Sequía",
    nivelPct: 18,
    tono: "#C9A227",
    texto:
      "Le das a tu cuerpo menos estímulo del que necesita para cambiar. Vas, te movés, transpirás — pero nada crece. Es lo que le pasa a la mayoría: no falta esfuerzo, falta dosis.",
  },
  {
    nivel: "Riego justo",
    nivelPct: 62,
    tono: "#7A8F74",
    texto:
      "La dosis que tu cuerpo puede absorber y convertir en progreso. Suficiente para crecer, recuperable por completo antes de la próxima sesión. Acá vive el método: en la dosis justa, no en la dosis máxima.",
  },
  {
    nivel: "Inundación",
    nivelPct: 96,
    tono: "#B0673F",
    texto:
      "Más de lo que podés recuperar. No sos más disciplinado: te estás ahogando. Rendís peor cada semana, duele todo y el progreso se frena. Más no es mejor — mejor es mejor.",
  },
];

export function MetodoFlora() {
  return (
    <>
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section
        style={{ background: C.petrol, paddingTop: 176, paddingBottom: 128 }}
        className="px-8"
      >
        <div style={{ maxWidth: 1152, margin: "0 auto", textAlign: "center" }}>
          <motion.p {...reveal} className="section-label" style={{ justifyContent: "center", width: "100%" }}>
            El método detrás de CalistenIA
          </motion.p>
          <motion.h1
            {...reveal}
            transition={{ ...reveal.transition, delay: 0.08 }}
            style={{
              fontSize: "clamp(3rem,7vw,6rem)",
              fontWeight: 900,
              color: C.cream,
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              margin: "28px 0 12px",
            }}
          >
            Método <span style={{ color: C.sage2 }}>FLORA</span>
          </motion.h1>
          <motion.p
            {...reveal}
            transition={{ ...reveal.transition, delay: 0.16 }}
            style={{
              fontSize: "clamp(1.4rem,2.6vw,2rem)",
              fontWeight: 300,
              color: "rgba(248,246,242,0.85)",
              letterSpacing: "-0.01em",
              marginBottom: 40,
            }}
          >
            Cultivá tu cuerpo.
          </motion.p>
          <motion.p
            {...reveal}
            transition={{ ...reveal.transition, delay: 0.22 }}
            style={{
              fontSize: "1.1rem",
              color: "rgba(248,246,242,0.6)",
              lineHeight: 1.7,
              fontWeight: 300,
              maxWidth: 620,
              margin: "0 auto 64px",
            }}
          >
            Un sistema para entrenar con tu propio peso y comer consciente,
            construido sobre ciencia simple y aplicado con constancia. Cinco
            pilares. Cero fórmulas mágicas.
          </motion.p>

          {/* Acrónimo */}
          <motion.div
            {...reveal}
            transition={{ ...reveal.transition, delay: 0.3 }}
            style={{ display: "flex", justifyContent: "center", gap: "clamp(10px,2.4vw,22px)", flexWrap: "wrap" }}
          >
            {PILARES.map((p, i) => (
              <motion.a
                key={p.letra}
                href={`#pilar-${p.letra.toLowerCase()}`}
                whileHover={{ y: -6 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "clamp(56px,9vw,92px)",
                    height: "clamp(56px,9vw,92px)",
                    borderRadius: 24,
                    border: "1px solid rgba(175,195,165,0.35)",
                    background: `rgba(175,195,165,${0.05 + i * 0.02})`,
                    fontSize: "clamp(1.6rem,3.4vw,2.6rem)",
                    fontWeight: 900,
                    color: C.sage2,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {p.letra}
                </span>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(248,246,242,0.55)" }}>
                  {p.nombre}
                </span>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────────────────────── Manifiesto ───────────────────────── */}
      <section style={{ backgroundColor: C.cream, borderTop: `1px solid ${C.border}` }} className="py-52 px-8">
        <div style={{ maxWidth: 880, margin: "0 auto", textAlign: "center" }}>
          <motion.p {...reveal} className="section-label" style={{ justifyContent: "center", width: "100%" }}>
            Manifiesto
          </motion.p>
          <motion.h2
            {...reveal}
            style={{
              fontSize: "clamp(2.2rem,4.6vw,3.8rem)",
              fontWeight: 900,
              color: C.ink,
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
              margin: "28px 0 32px",
            }}
          >
            El cuerpo se cultiva,{" "}
            <span style={{ color: C.sage }}>igual que una planta.</span>
          </motion.h2>
          <motion.p
            {...reveal}
            style={{ fontSize: "1.15rem", color: C.ink2, lineHeight: 1.8, fontWeight: 300, maxWidth: 680, margin: "0 auto" }}
          >
            Necesita la dosis justa de estímulo — ni sequía ni inundación.
            Crece de noche, cuando descansa. Da frutos por temporadas, no en
            línea recta. Y depende menos del jardinero inspirado que del riego
            constante. El Método FLORA es eso: agronomía aplicada a tu cuerpo,
            medida con tecnología y sostenida con hábitos simples.
          </motion.p>
        </div>
      </section>

      {/* ───────────────────────── Pilares ───────────────────────── */}
      <section style={{ backgroundColor: C.cream2, borderTop: `1px solid ${C.border}` }} className="py-52 px-8">
        <div style={{ maxWidth: 1152, margin: "0 auto" }}>
          <motion.p {...reveal} className="section-tag">Los cinco pilares</motion.p>
          <motion.h2
            {...reveal}
            style={{
              fontSize: "clamp(2.2rem,4.6vw,3.6rem)",
              fontWeight: 900,
              color: C.ink,
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
              margin: "24px 0 64px",
              maxWidth: 720,
            }}
          >
            F·L·O·R·A: cada letra sostiene a las demás.
          </motion.h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {PILARES.map((p, i) => (
              <motion.div
                key={p.letra}
                id={`pilar-${p.letra.toLowerCase()}`}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.06, ease: "easeOut" }}
                className="soft-card"
                style={{
                  borderRadius: 24,
                  padding: "clamp(28px,4vw,44px)",
                  display: "grid",
                  gridTemplateColumns: "minmax(64px,96px) 1fr",
                  gap: "clamp(20px,3.5vw,44px)",
                  alignItems: "start",
                  scrollMarginTop: 110,
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    aspectRatio: "1",
                    borderRadius: 20,
                    background: C.forest,
                    color: C.sage2,
                    fontSize: "clamp(1.8rem,3vw,2.6rem)",
                    fontWeight: 900,
                  }}
                >
                  {p.letra}
                </span>
                <div>
                  <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: C.ink, letterSpacing: "-0.02em", margin: "0 0 4px" }}>
                    {p.nombre}{" "}
                    <span style={{ color: C.sage, fontWeight: 600, fontSize: "1.05rem" }}>— {p.frase}</span>
                  </h3>
                  <p style={{ fontSize: "1rem", color: C.ink2, lineHeight: 1.75, fontWeight: 300, margin: 0, maxWidth: 760 }}>
                    {p.texto}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── El riego justo ───────────────────────── */}
      <section style={{ backgroundColor: C.cream, borderTop: `1px solid ${C.border}` }} className="py-52 px-8">
        <div style={{ maxWidth: 1152, margin: "0 auto" }}>
          <motion.p {...reveal} className="section-tag">La regla central</motion.p>
          <motion.h2
            {...reveal}
            style={{
              fontSize: "clamp(2.2rem,4.6vw,3.6rem)",
              fontWeight: 900,
              color: C.ink,
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
              margin: "24px 0 20px",
              maxWidth: 760,
            }}
          >
            El riego justo: la dosis que tu cuerpo puede absorber.
          </motion.h2>
          <motion.p
            {...reveal}
            style={{ fontSize: "1.05rem", color: C.ink2, lineHeight: 1.75, fontWeight: 300, maxWidth: 640, marginBottom: 64 }}
          >
            El error más común no es entrenar mal: es regar mal. Cada grupo
            muscular tiene una dosis semanal de trabajo que lo hace crecer — por
            debajo no pasa nada, por arriba te ahogás. El método arranca
            conservador y sube el riego de a poco, mirando cómo responde tu
            cuerpo.
          </motion.p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
            {RIEGO.map((r, i) => (
              <motion.div
                key={r.nivel}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                className="soft-card"
                style={{ borderRadius: 24, padding: 32, display: "flex", flexDirection: "column", gap: 18 }}
              >
                {/* indicador de nivel de agua */}
                <div
                  aria-hidden
                  style={{
                    position: "relative",
                    height: 96,
                    borderRadius: 16,
                    border: `1px solid ${C.border}`,
                    background: "rgba(255,255,255,0.6)",
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: `${r.nivelPct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, delay: 0.25 + i * 0.1, ease: "easeOut" }}
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: `linear-gradient(180deg, ${r.tono}55, ${r.tono}99)`,
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 14,
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: r.tono,
                    }}
                  >
                    {r.nivel}
                  </span>
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: C.ink, letterSpacing: "-0.02em", margin: 0 }}>
                  {r.nivel}
                </h3>
                <p style={{ fontSize: "0.95rem", color: C.ink2, lineHeight: 1.7, fontWeight: 300, margin: 0 }}>
                  {r.texto}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.p
            {...reveal}
            style={{
              marginTop: 40,
              fontSize: "0.95rem",
              color: C.muted,
              lineHeight: 1.7,
              maxWidth: 640,
            }}
          >
            ¿Cómo sabés cuál es tu riego justo? Registrando. Si a la semana
            siguiente rendís más, la dosis era buena. Si rendís menos o seguís
            molido, era inundación. CalistenIA hace esta lectura por vos, sesión
            a sesión, con la cámara de tu compu.
          </motion.p>
        </div>
      </section>

      {/* ───────────────────────── Temporadas ───────────────────────── */}
      <section style={{ backgroundColor: C.cream2, borderTop: `1px solid ${C.border}` }} className="py-52 px-8">
        <div style={{ maxWidth: 1152, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 64, alignItems: "center" }}>
            <div>
              <motion.p {...reveal} className="section-tag">Temporadas</motion.p>
              <motion.h2
                {...reveal}
                style={{
                  fontSize: "clamp(2.2rem,4.6vw,3.4rem)",
                  fontWeight: 900,
                  color: C.ink,
                  lineHeight: 1.02,
                  letterSpacing: "-0.03em",
                  margin: "24px 0 24px",
                }}
              >
                Nada crece en línea recta.
              </motion.h2>
              <motion.p {...reveal} style={{ fontSize: "1.05rem", color: C.ink2, lineHeight: 1.8, fontWeight: 300, marginBottom: 20 }}>
                El método organiza el año en <strong style={{ fontWeight: 700 }}>temporadas de cinco semanas</strong>:
                cuatro de crecimiento, donde el riego sube de a poco, y una{" "}
                <strong style={{ fontWeight: 700 }}>semana de raíces</strong>, donde bajás la carga a propósito
                para que el cuerpo consolide todo lo que sembró.
              </motion.p>
              <motion.p {...reveal} style={{ fontSize: "1.05rem", color: C.ink2, lineHeight: 1.8, fontWeight: 300, margin: 0 }}>
                La semana de raíces no es una semana perdida: es la que hace
                posible la próxima temporada. Saltearla es la forma más rápida
                de pasar de riego justo a inundación.
              </motion.p>
            </div>

            {/* Ciclo visual */}
            <motion.div
              {...reveal}
              className="soft-card"
              style={{ borderRadius: 28, padding: "clamp(28px,4vw,48px)" }}
            >
              <p style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: C.sage, marginBottom: 28 }}>
                Una temporada
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { s: "Semana 1", l: "Siembra — arrancás conservador", w: 34 },
                  { s: "Semana 2", l: "Crecimiento — sube el riego", w: 52 },
                  { s: "Semana 3", l: "Crecimiento — sube el riego", w: 70 },
                  { s: "Semana 4", l: "Floración — tu mejor semana", w: 92 },
                  { s: "Semana 5", l: "Raíces — bajás, consolidás", w: 26, root: true },
                ].map((w, i) => (
                  <div key={w.s} style={{ display: "grid", gridTemplateColumns: "88px 1fr", gap: 16, alignItems: "center" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: w.root ? C.forest : C.ink2 }}>{w.s}</span>
                    <div>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${w.w}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: 0.2 + i * 0.12, ease: "easeOut" }}
                        style={{
                          height: 12,
                          borderRadius: 99,
                          background: w.root
                            ? `linear-gradient(90deg, ${C.forest}, ${C.sage})`
                            : `linear-gradient(90deg, ${C.sage2}, ${C.sage})`,
                          marginBottom: 5,
                        }}
                      />
                      <span style={{ fontSize: "0.75rem", color: C.muted }}>{w.l}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── Al borde, no al fallo ───────────────────────── */}
      <section style={{ backgroundColor: C.cream, borderTop: `1px solid ${C.border}` }} className="py-52 px-8">
        <div style={{ maxWidth: 880, margin: "0 auto", textAlign: "center" }}>
          <motion.p {...reveal} className="section-label" style={{ justifyContent: "center", width: "100%" }}>
            La intensidad
          </motion.p>
          <motion.h2
            {...reveal}
            style={{
              fontSize: "clamp(2.2rem,4.6vw,3.6rem)",
              fontWeight: 900,
              color: C.ink,
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
              margin: "28px 0 28px",
            }}
          >
            Al borde, <span style={{ color: C.sage }}>no al fallo.</span>
          </motion.h2>
          <motion.p
            {...reveal}
            style={{ fontSize: "1.1rem", color: C.ink2, lineHeight: 1.8, fontWeight: 300, maxWidth: 660, margin: "0 auto 48px" }}
          >
            Una serie que termina fresca no le dice nada a tu cuerpo. Una serie
            que termina rota te cobra más de lo que te da. La zona del método:
            terminar cada serie sintiendo que te quedaban una o dos repeticiones
            buenas en el tanque. Las últimas tienen que costar — las de más,
            sobran.
          </motion.p>
          <motion.div
            {...reveal}
            style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}
          >
            {[
              { t: "Demasiado fácil", d: "5+ reps en el tanque · no cuenta", on: false },
              { t: "Al borde", d: "1–2 reps en el tanque · acá se crece", on: true },
              { t: "Al fallo siempre", d: "0 reps · caro de recuperar", on: false },
            ].map((z) => (
              <div
                key={z.t}
                style={{
                  borderRadius: 18,
                  padding: "18px 26px",
                  border: `1px solid ${z.on ? C.sage : C.border}`,
                  background: z.on ? "rgba(122,143,116,0.12)" : "rgba(255,255,255,0.6)",
                  minWidth: 200,
                }}
              >
                <p style={{ fontSize: "0.95rem", fontWeight: 800, color: z.on ? C.forest : C.ink2, margin: "0 0 4px" }}>{z.t}</p>
                <p style={{ fontSize: "0.8rem", color: C.muted, margin: 0 }}>{z.d}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────────────────────── Alimentación consciente ───────────────────────── */}
      <section style={{ backgroundColor: C.cream2, borderTop: `1px solid ${C.border}` }} className="py-52 px-8">
        <div style={{ maxWidth: 1152, margin: "0 auto" }}>
          <motion.p {...reveal} className="section-tag">Alimentación consciente</motion.p>
          <motion.h2
            {...reveal}
            style={{
              fontSize: "clamp(2.2rem,4.6vw,3.6rem)",
              fontWeight: 900,
              color: C.ink,
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
              margin: "24px 0 20px",
              maxWidth: 760,
            }}
          >
            Se cocina en casa, se come sin culpa.
          </motion.h2>
          <motion.p
            {...reveal}
            style={{ fontSize: "1.05rem", color: C.ink2, lineHeight: 1.75, fontWeight: 300, maxWidth: 640, marginBottom: 64 }}
          >
            Ninguna dieta con nombre propio tiene magia: todas funcionan cuando
            te ayudan a comer comida real en la cantidad que tu cuerpo necesita.
            El método lo reduce a cuatro decisiones conscientes por día.
          </motion.p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 20 }}>
            {[
              {
                t: "El plato en tercios",
                d: "Un tercio de verduras, un tercio de proteína, un tercio de energía (arroz, papa, legumbres). ¿Querés bajar? Agrandá el tercio verde. ¿Querés subir? Agrandá el de energía.",
              },
              {
                t: "Proteína en cada comida",
                d: "El músculo que entrenás a la mañana se construye con lo que comés durante el día. Un puñado generoso de proteína por comida, tres o cuatro veces al día — animal o vegetal, da igual.",
              },
              {
                t: "Comida real primero",
                d: "Lo que más resultados da no es sumar superalimentos: es restar ultraprocesados. Si tiene más ingredientes que una receta de tu abuela, probablemente no te está ayudando.",
              },
              {
                t: "Margen para disfrutar",
                d: "Una porción de tu vida alimentaria es para la pizza con amigos y la torta de cumpleaños, sin culpa ni compensación. La restricción total siempre termina igual: en el atracón y el abandono.",
              },
            ].map((c, i) => (
              <motion.div
                key={c.t}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
                className="soft-card"
                style={{ borderRadius: 24, padding: 32 }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: "rgba(122,143,116,0.14)",
                    color: C.forest,
                    fontWeight: 900,
                    fontSize: "1rem",
                    marginBottom: 18,
                  }}
                >
                  {i + 1}
                </span>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: C.ink, letterSpacing: "-0.015em", margin: "0 0 10px" }}>
                  {c.t}
                </h3>
                <p style={{ fontSize: "0.93rem", color: C.ink2, lineHeight: 1.7, fontWeight: 300, margin: 0 }}>
                  {c.d}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── CTA final ───────────────────────── */}
      <section style={{ backgroundColor: C.cream, borderTop: `1px solid ${C.border}` }} className="py-52 px-8">
        <div style={{ maxWidth: 1152, margin: "0 auto" }}>
          <motion.div
            {...reveal}
            style={{ background: C.forest, borderRadius: 28, padding: "clamp(56px,8vw,96px) clamp(28px,6vw,80px)", textAlign: "center" }}
          >
            <p style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: C.sage2, marginBottom: 24 }}>
              Empezá hoy
            </p>
            <h2
              style={{
                fontSize: "clamp(2.2rem,4.8vw,4rem)",
                fontWeight: 900,
                color: C.cream,
                lineHeight: 1,
                letterSpacing: "-0.03em",
                margin: "0 0 20px",
              }}
            >
              El método empieza midiendo dónde estás.
            </h2>
            <p style={{ fontSize: "1.05rem", color: "rgba(248,246,242,0.65)", lineHeight: 1.7, fontWeight: 300, maxWidth: 560, margin: "0 auto 48px" }}>
              Cuatro minutos frente a tu cámara alcanzan para conocer tu punto
              de partida. Desde ahí, el riego justo lo calculamos juntos.
            </p>
            <motion.a
              href="/evaluacion"
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
              Hacer mi evaluación gratis <span style={{ color: C.sage }}>→</span>
            </motion.a>
            <p style={{ fontSize: "0.78rem", color: "rgba(248,246,242,0.4)", marginTop: 48, maxWidth: 560, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
              El Método FLORA es educación sobre entrenamiento y hábitos. No
              reemplaza el consejo de profesionales de la salud ni pretende
              diagnosticar o tratar condiciones médicas.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
