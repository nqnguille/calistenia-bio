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
      "Dominadas, fondos, sentadillas a una pierna. Primero los ejercicios grandes, que son los que más resultado dan por minuto; después los detalles. Y una sola regla de progreso: cada semana, ganale en algo a la anterior — una repetición más, una serie más o una variante más difícil.",
  },
  {
    letra: "L",
    nombre: "Longevidad",
    frase: "El músculo es salud a largo plazo.",
    texto:
      "No entrenamos para el verano: entrenamos para bajar tu Edad de Movimiento. La fuerza es uno de los factores mejor documentados de la salud a largo plazo — sostiene tu metabolismo, tus huesos y tu independencia. Las piernas fuertes de hoy son la autonomía de tus 70.",
  },
  {
    letra: "O",
    nombre: "Orden",
    frase: "Lo que se registra, mejora.",
    texto:
      "Entrenar “a sensación” no funciona: la sensación cambia con el sueño y el ánimo, y te engaña. Por eso el método registra todo — series, repeticiones y cuánto te costó. Con datos, tu único rival es tu semana anterior; sin datos, estás adivinando.",
  },
  {
    letra: "R",
    nombre: "Recuperación",
    frase: "El progreso se consolida descansando.",
    texto:
      "El entrenamiento genera el estímulo; el músculo se construye después, mientras dormís y comés bien. Si dormiste mal o venís muy exigido, tu capacidad de recuperación baja — y el plan se ajusta ese día: menos series, mejor ejecutadas. No es aflojar, es entrenar con la biología a favor.",
  },
  {
    letra: "A",
    nombre: "Alimentación",
    frase: "Consciente, real, sin dietas mágicas.",
    texto:
      "Ninguna dieta con nombre tiene magia: todas funcionan cuando te ayudan a comer comida real en la cantidad que necesitás. El método lo baja a lo concreto: plato en tercios, proteína en cada comida, ultraprocesados afuera y un margen para disfrutar sin culpa.",
  },
];

const ZONAS = [
  {
    zona: "Te falta",
    pos: 16,
    tono: "#C9A227",
    titulo: "Menos series de las que tu cuerpo necesita",
    texto:
      "Vas, entrenás, transpirás — pero ese músculo no recibe suficiente estímulo para cambiar. Es el motivo más común por el que alguien entrena hace meses y no ve resultados: no falta esfuerzo, faltan series.",
  },
  {
    zona: "En rango",
    pos: 55,
    tono: "#7A8F74",
    titulo: "La cantidad que estimula y se recupera",
    texto:
      "Suficientes series para progresar, pocas como para llegar recuperado a la próxima sesión. Acá vive tu plan: para la mayoría de los músculos, entre 10 y 20 series semanales, repartidas en dos o más días.",
  },
  {
    zona: "Te pasaste",
    pos: 92,
    tono: "#B0673F",
    titulo: "Más trabajo del que podés recuperar",
    texto:
      "Rendís peor cada semana, te duele todo y el progreso se frena. No es más disciplina: es fatiga acumulada. La señal es clara — si tus números bajan dos semanas seguidas, sobran series o falta descanso.",
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
            Ciencia simple, aplicada con constancia.
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
            Un sistema para progresar con tu propio peso y comer mejor, sin
            fórmulas mágicas: la cantidad justa de trabajo, el descanso que lo
            convierte en resultado, y datos para no adivinar. Cinco pilares.
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
            La idea central
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
            El 80% del resultado está en{" "}
            <span style={{ color: C.sage }}>hacer lo simple, sostenido.</span>
          </motion.h2>
          <motion.p
            {...reveal}
            style={{ fontSize: "1.15rem", color: C.ink2, lineHeight: 1.8, fontWeight: 300, maxWidth: 680, margin: "0 auto" }}
          >
            Entrenar lo suficiente, recuperarte bien, comer comida real y medir
            tu progreso. Nada de esto es novedoso — lo difícil es sostenerlo. Por
            eso el Método FLORA está diseñado alrededor de una sola métrica que
            manda: tu consistencia. Una rutina buena que cumplís le gana siempre
            a una rutina perfecta que abandonás.
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

      {/* ───────────────────────── Series semanales ───────────────────────── */}
      <section style={{ backgroundColor: C.cream, borderTop: `1px solid ${C.border}` }} className="py-52 px-8">
        <div style={{ maxWidth: 1152, margin: "0 auto" }}>
          <motion.p {...reveal} className="section-tag">La unidad de medida</motion.p>
          <motion.h2
            {...reveal}
            style={{
              fontSize: "clamp(2.2rem,4.6vw,3.6rem)",
              fontWeight: 900,
              color: C.ink,
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
              margin: "24px 0 20px",
              maxWidth: 800,
            }}
          >
            Series semanales: el número que decide si crecés.
          </motion.h2>
          <motion.p
            {...reveal}
            style={{ fontSize: "1.05rem", color: C.ink2, lineHeight: 1.75, fontWeight: 300, maxWidth: 660, marginBottom: 64 }}
          >
            El progreso de cada músculo depende de cuántas series que de verdad
            cuestan hace por semana — no de cuántos días vas ni de cuánto
            transpirás. Ese número tiene tres zonas, y el trabajo del método es
            mantenerte en la del medio:
          </motion.p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
            {ZONAS.map((z, i) => (
              <motion.div
                key={z.zona}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                className="soft-card"
                style={{ borderRadius: 24, padding: 32, display: "flex", flexDirection: "column", gap: 16 }}
              >
                <span
                  style={{
                    alignSelf: "flex-start",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: z.tono,
                    border: `1px solid ${z.tono}55`,
                    background: `${z.tono}14`,
                    borderRadius: 99,
                    padding: "6px 14px",
                  }}
                >
                  {z.zona}
                </span>

                {/* medidor horizontal */}
                <div aria-hidden style={{ position: "relative", height: 10, borderRadius: 99, background: C.cream2, border: `1px solid ${C.border}` }}>
                  <motion.span
                    initial={{ left: 0, opacity: 0 }}
                    whileInView={{ left: `calc(${z.pos}% - 9px)`, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: 0.3 + i * 0.1, ease: "easeOut" }}
                    style={{
                      position: "absolute",
                      top: -5,
                      width: 18,
                      height: 18,
                      borderRadius: 99,
                      background: z.tono,
                      boxShadow: `0 0 0 4px ${z.tono}26`,
                    }}
                  />
                </div>

                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: C.ink, letterSpacing: "-0.015em", margin: 0 }}>
                  {z.titulo}
                </h3>
                <p style={{ fontSize: "0.95rem", color: C.ink2, lineHeight: 1.7, fontWeight: 300, margin: 0 }}>
                  {z.texto}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.p
            {...reveal}
            style={{ marginTop: 40, fontSize: "0.95rem", color: C.muted, lineHeight: 1.7, maxWidth: 660 }}
          >
            ¿Cómo sabés en qué zona estás? Por tu respuesta, no por una tabla:
            si la semana siguiente rendís igual o mejor, la cantidad era buena;
            si rendís peor, te pasaste. CalistenIA hace esa lectura por vos,
            sesión a sesión, y ajusta tus series semanales según cómo venís.
          </motion.p>
        </div>
      </section>

      {/* ───────────────────────── Bloques y descarga ───────────────────────── */}
      <section style={{ backgroundColor: C.cream2, borderTop: `1px solid ${C.border}` }} className="py-52 px-8">
        <div style={{ maxWidth: 1152, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 64, alignItems: "center" }}>
            <div>
              <motion.p {...reveal} className="section-tag">La planificación</motion.p>
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
                Bloques de 5 semanas, no rutinas eternas.
              </motion.h2>
              <motion.p {...reveal} style={{ fontSize: "1.05rem", color: C.ink2, lineHeight: 1.8, fontWeight: 300, marginBottom: 20 }}>
                Entrenar igual todo el año no funciona: la fatiga se acumula más
                rápido de lo que el cuerpo se adapta. Por eso el método trabaja
                en <strong style={{ fontWeight: 700 }}>bloques de 5 semanas</strong>: cuatro donde las series
                semanales suben de a poco, y una{" "}
                <strong style={{ fontWeight: 700 }}>semana de descarga</strong> — mitad de series, sin exigirte
                al límite.
              </motion.p>
              <motion.p {...reveal} style={{ fontSize: "1.05rem", color: C.ink2, lineHeight: 1.8, fontWeight: 300, margin: 0 }}>
                La descarga no es una semana perdida: es donde el esfuerzo del
                mes se convierte en resultado, y lo que te permite arrancar el
                próximo bloque un escalón más arriba. Saltearla es la vía rápida
                al estancamiento.
              </motion.p>
            </div>

            {/* Bloque visual */}
            <motion.div
              {...reveal}
              className="soft-card"
              style={{ borderRadius: 28, padding: "clamp(28px,4vw,48px)" }}
            >
              <p style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: C.sage, marginBottom: 28 }}>
                Un bloque tipo
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { s: "Semana 1", l: "Arranque conservador", w: 34 },
                  { s: "Semana 2", l: "Suben las series", w: 52 },
                  { s: "Semana 3", l: "Suben las series", w: 70 },
                  { s: "Semana 4", l: "Semana pico — tu mejor semana", w: 92 },
                  { s: "Semana 5", l: "Descarga — 50% del trabajo", w: 26, deload: true },
                ].map((w, i) => (
                  <div key={w.s} style={{ display: "grid", gridTemplateColumns: "88px 1fr", gap: 16, alignItems: "center" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: w.deload ? C.forest : C.ink2 }}>{w.s}</span>
                    <div>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${w.w}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: 0.2 + i * 0.12, ease: "easeOut" }}
                        style={{
                          height: 12,
                          borderRadius: 99,
                          background: w.deload
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

      {/* ───────────────────────── Repeticiones en reserva ───────────────────────── */}
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
            Repeticiones <span style={{ color: C.sage }}>en reserva.</span>
          </motion.h2>
          <motion.p
            {...reveal}
            style={{ fontSize: "1.1rem", color: C.ink2, lineHeight: 1.8, fontWeight: 300, maxWidth: 680, margin: "0 auto 48px" }}
          >
            La intensidad se maneja con una pregunta simple al final de cada
            serie: ¿cuántas repeticiones más podrías haber hecho bien? El punto
            ideal para construir músculo es terminar con 1 o 2 en reserva — las
            últimas tienen que costar. Cero en reserva es el fallo: se usa poco
            y a propósito, porque cuesta caro de recuperar.
          </motion.p>
          <motion.div
            {...reveal}
            style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}
          >
            {[
              { t: "5+ en reserva", d: "Demasiado fácil · esa serie no cuenta", on: false },
              { t: "1–2 en reserva", d: "El punto ideal · acá se progresa", on: true },
              { t: "0 en reserva (fallo)", d: "Caro de recuperar · con moderación", on: false },
            ].map((z) => (
              <div
                key={z.t}
                style={{
                  borderRadius: 18,
                  padding: "18px 26px",
                  border: `1px solid ${z.on ? C.sage : C.border}`,
                  background: z.on ? "rgba(122,143,116,0.12)" : "rgba(255,255,255,0.6)",
                  minWidth: 210,
                }}
              >
                <p style={{ fontSize: "0.95rem", fontWeight: 800, color: z.on ? C.forest : C.ink2, margin: "0 0 4px" }}>{z.t}</p>
                <p style={{ fontSize: "0.8rem", color: C.muted, margin: 0 }}>{z.d}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────────────────────── Consistencia ───────────────────────── */}
      <section style={{ backgroundColor: C.cream2, borderTop: `1px solid ${C.border}` }} className="py-52 px-8">
        <div style={{ maxWidth: 1152, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 64, alignItems: "center" }}>
            <div>
              <motion.p {...reveal} className="section-tag">La métrica que manda</motion.p>
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
                Tu consistencia vale más que tu mejor sesión.
              </motion.h2>
              <motion.p {...reveal} style={{ fontSize: "1.05rem", color: C.ink2, lineHeight: 1.8, fontWeight: 300, marginBottom: 20 }}>
                El método mide tu consistencia como un porcentaje: cuántas de
                las sesiones del mes cumpliste. Arriba del 80%, los resultados
                llegan solos — la evidencia sobre adherencia es contundente. Por
                debajo, no hay rutina que te salve.
              </motion.p>
              <motion.p {...reveal} style={{ fontSize: "1.05rem", color: C.ink2, lineHeight: 1.8, fontWeight: 300, margin: 0 }}>
                ¿Día complicado, poco tiempo? En vez de saltear, la app te
                ofrece la <strong style={{ fontWeight: 700 }}>sesión mínima</strong>: 15 minutos, los 2 o 3
                ejercicios que más mueven la aguja. Cuenta para tu consistencia
                — porque mantener el hábito importa más que la sesión perfecta.
              </motion.p>
            </div>

            {/* Score visual */}
            <motion.div
              {...reveal}
              className="soft-card"
              style={{ borderRadius: 28, padding: "clamp(28px,4vw,48px)", textAlign: "center" }}
            >
              <p style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: C.sage, marginBottom: 24 }}>
                Consistencia del mes
              </p>
              <p style={{ fontSize: "clamp(3.5rem,7vw,5.5rem)", fontWeight: 900, color: C.forest, letterSpacing: "-0.04em", lineHeight: 1, margin: "0 0 8px" }}>
                92%
              </p>
              <p style={{ fontSize: "0.9rem", color: C.muted, marginBottom: 32 }}>11 de 12 sesiones cumplidas</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
                {[1, 1, 1, 1, 2, 1, 1, 1, 0, 1, 1, 1].map((s, i) => (
                  <span
                    key={i}
                    title={s === 2 ? "Sesión mínima" : s === 1 ? "Sesión completa" : "No cumplida"}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 7,
                      background: s === 1 ? C.sage : s === 2 ? C.sage2 : "transparent",
                      border: `1px solid ${s === 0 ? C.border : "transparent"}`,
                    }}
                  />
                ))}
              </div>
              <p style={{ fontSize: "0.78rem", color: C.muted, margin: 0 }}>
                <span style={{ color: C.sage, fontWeight: 700 }}>■</span> completa ·{" "}
                <span style={{ color: C.sage2, fontWeight: 700 }}>■</span> sesión mínima ·{" "}
                <span style={{ fontWeight: 700 }}>□</span> no cumplida
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── Alimentación consciente ───────────────────────── */}
      <section style={{ backgroundColor: C.cream, borderTop: `1px solid ${C.border}` }} className="py-52 px-8">
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
            Cuatro decisiones por día. Ninguna dieta.
          </motion.h2>
          <motion.p
            {...reveal}
            style={{ fontSize: "1.05rem", color: C.ink2, lineHeight: 1.75, fontWeight: 300, maxWidth: 640, marginBottom: 64 }}
          >
            Ninguna dieta con nombre propio tiene magia: todas funcionan cuando
            te ayudan a comer comida real en la cantidad que tu cuerpo necesita.
            El método lo reduce a cuatro decisiones conscientes:
          </motion.p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 20 }}>
            {[
              {
                t: "El plato en tercios",
                d: "Un tercio de verduras, un tercio de proteína, un tercio de energía (arroz, papa, legumbres). ¿Querés bajar? Agrandá el tercio de verduras. ¿Querés subir? Agrandá el de energía.",
              },
              {
                t: "Proteína en cada comida",
                d: "El músculo que entrenás a la mañana se construye con lo que comés durante el día. Una porción firme de proteína por comida, 3 o 4 veces al día — animal o vegetal, da igual.",
              },
              {
                t: "Comida real primero",
                d: "Lo que más resultado da no es sumar superalimentos: es restar ultraprocesados. Regla práctica: si tiene una lista de ingredientes que no reconocés, no te está ayudando.",
              },
              {
                t: "Margen para disfrutar",
                d: "Un 10-20% de tus comidas es para la pizza con amigos y la torta de cumpleaños, sin culpa ni compensación. La restricción total termina siempre igual: en el abandono.",
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
      <section style={{ backgroundColor: C.cream2, borderTop: `1px solid ${C.border}` }} className="py-52 px-8">
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
              de partida. Desde ahí, tus series semanales las calculamos con
              datos, no a ojo.
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
