"use client";
import { motion } from "framer-motion";
import { ShaderHero } from "@/components/shared/ShaderHero";

const CYAN = "#00E5FF";
const RED = "#FF5A5A";
const AMBER = "#FFB020";

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
    tono: AMBER,
    titulo: "Menos series de las que tu cuerpo necesita",
    texto:
      "Vas, entrenás, transpirás — pero ese músculo no recibe suficiente estímulo para cambiar. Es el motivo más común por el que alguien entrena hace meses y no ve resultados: no falta esfuerzo, faltan series.",
  },
  {
    zona: "En rango",
    pos: 55,
    tono: CYAN,
    titulo: "La cantidad que estimula y se recupera",
    texto:
      "Suficientes series para progresar, pocas como para llegar recuperado a la próxima sesión. Acá vive tu plan: para la mayoría de los músculos, entre 10 y 20 series semanales, repartidas en dos o más días.",
  },
  {
    zona: "Te pasaste",
    pos: 92,
    tono: RED,
    titulo: "Más trabajo del que podés recuperar",
    texto:
      "Rendís peor cada semana, te duele todo y el progreso se frena. No es más disciplina: es fatiga acumulada. La señal es clara — si tus números bajan dos semanas seguidas, sobran series o falta descanso.",
  },
];

export function MetodoFlora() {
  return (
    <>
      {/* ───────────────────────── Hero WebGL ───────────────────────── */}
      <section id="metodo-hero" className="brut-sec relative">
        <ShaderHero
          imageSrc="/hero/metodo.jpg"
          fallbackSrc="/hero/metodo_duo.jpg"
          minH="72vh"
          darken={0.5}
        >
          <div className="mx-auto flex min-h-[72vh] max-w-5xl flex-col justify-center px-6 pb-16 pt-32 md:px-8">
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="brut-label mb-5 flex items-center gap-3"
            >
              <span className="inline-block h-2 w-2 bg-cyan brut-glow" />
              [FLORA_00 // MÉTODO]
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
              className="brut-display text-[clamp(3rem,8vw,7rem)] drop-shadow-[0_4px_40px_rgba(0,0,0,0.7)]"
            >
              Método <span className="text-cyan brut-glow">FLORA</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.24 }}
              className="mt-6 max-w-xl border-l-2 border-cyan bg-black/30 py-1 pl-4 text-base leading-7 text-chalk/85 backdrop-blur-sm md:text-lg"
            >
              Ciencia simple, aplicada con constancia.
            </motion.p>
          </div>
        </ShaderHero>
      </section>

      {/* ───────────────────── Intro · pilares (acrónimo) ───────────────────── */}
      <section className="brut-sec brut-concrete relative overflow-hidden bg-void px-8 pb-32 pt-28 text-chalk">
        <div className="brut-grid absolute inset-0 opacity-70" aria-hidden />
        <div
          className="brut-display brut-outline-text pointer-events-none absolute -right-10 top-16 select-none text-[22rem] leading-none opacity-60 max-lg:hidden"
          aria-hidden
        >
          FLORA
        </div>

        <div className="relative mx-auto max-w-6xl text-center">
          <motion.p {...reveal} className="brut-label mb-6">
            [FLORA_01 // EL_METODO_DETRAS_DE_CALISTENIA]
          </motion.p>
          <motion.h2
            {...reveal}
            transition={{ ...reveal.transition, delay: 0.08 }}
            className="brut-display mx-auto mb-10 mt-4 text-[clamp(2.2rem,5vw,3.8rem)] text-chalk"
          >
            Ciencia simple, aplicada con constancia.
          </motion.h2>
          <motion.p
            {...reveal}
            transition={{ ...reveal.transition, delay: 0.22 }}
            className="mx-auto mb-16 max-w-[620px] border-l-2 border-cyan pl-4 text-left text-[1.1rem] font-light leading-7 text-chalk/60"
          >
            Un sistema para progresar con tu propio peso y comer mejor, sin
            fórmulas mágicas: la cantidad justa de trabajo, el descanso que lo
            convierte en resultado, y datos para no adivinar. Cinco pilares.
          </motion.p>

          {/* Acrónimo */}
          <motion.div
            {...reveal}
            transition={{ ...reveal.transition, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-[clamp(10px,2.4vw,22px)]"
          >
            {PILARES.map((p) => (
              <motion.a
                key={p.letra}
                href={`#pilar-${p.letra.toLowerCase()}`}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.12 }}
                className="flex cursor-pointer flex-col items-center gap-2.5"
              >
                <span className="brut-display flex h-[clamp(56px,9vw,92px)] w-[clamp(56px,9vw,92px)] items-center justify-center border border-white/[0.14] bg-white/[0.03] text-[clamp(1.6rem,3.4vw,2.6rem)] text-cyan transition-colors hover:border-cyan">
                  {p.letra}
                </span>
                <span className="brut-mono text-[0.68rem] font-bold uppercase tracking-[0.1em] text-chalk/55">
                  {p.nombre}
                </span>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────────────────────── Manifiesto ───────────────────────── */}
      <section className="brut-sec brut-concrete relative overflow-hidden bg-concrete px-8 py-52 text-chalk">
        <div className="brut-hazard absolute left-0 right-0 top-0 h-[1.5px] opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-[880px] text-center">
          <motion.p {...reveal} className="brut-label mb-6">
            [FLORA_02 // LA_IDEA_CENTRAL]
          </motion.p>
          <motion.h2
            {...reveal}
            className="brut-display mx-auto mb-8 mt-2 text-[clamp(2.6rem,6vw,4.6rem)] text-chalk"
          >
            El 80% del resultado está en{" "}
            <span className="text-cyan">hacer lo simple, sostenido.</span>
          </motion.h2>
          <motion.p
            {...reveal}
            className="mx-auto max-w-[680px] text-[1.15rem] font-light leading-8 text-chalk/70"
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
      <section className="brut-sec brut-concrete relative overflow-hidden bg-void px-8 py-52 text-chalk">
        <div
          className="brut-display brut-outline-text pointer-events-none absolute -left-6 top-10 select-none text-[18rem] leading-none opacity-50 max-lg:hidden"
          aria-hidden
        >
          03
        </div>
        <div className="relative mx-auto max-w-6xl">
          <motion.p {...reveal} className="brut-label mb-6">
            [FLORA_03 // LOS_CINCO_PILARES]
          </motion.p>
          <motion.h2
            {...reveal}
            className="brut-display mb-16 mt-2 max-w-[720px] text-[clamp(2.6rem,6vw,4.6rem)] text-chalk"
          >
            F·L·O·R·A: cada letra sostiene a las demás.
          </motion.h2>

          <div className="flex flex-col gap-5">
            {PILARES.map((p, i) => (
              <motion.div
                key={p.letra}
                id={`pilar-${p.letra.toLowerCase()}`}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.06, ease: "easeOut" }}
                className="grid scroll-mt-28 grid-cols-[minmax(64px,96px)_1fr] items-start gap-[clamp(20px,3.5vw,44px)] border border-white/[0.14] bg-white/[0.03] p-[clamp(28px,4vw,44px)] transition-colors hover:border-cyan/60"
              >
                <span className="brut-display flex aspect-square items-center justify-center bg-cyan text-[clamp(1.8rem,3vw,2.6rem)] text-black">
                  {p.letra}
                </span>
                <div>
                  <h3 className="brut-display mb-2 text-[1.6rem] text-chalk">
                    {p.nombre}{" "}
                    <span className="brut-mono text-[0.95rem] font-bold uppercase tracking-[0.04em] text-cyan">
                      — {p.frase}
                    </span>
                  </h3>
                  <p className="m-0 max-w-[760px] text-base font-light leading-7 text-chalk/70">
                    {p.texto}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── Series semanales ───────────────────────── */}
      <section className="brut-sec brut-concrete relative overflow-hidden bg-concrete px-8 py-52 text-chalk">
        <div className="relative mx-auto max-w-6xl">
          <motion.p {...reveal} className="brut-label mb-6">
            [FLORA_04 // LA_UNIDAD_DE_MEDIDA]
          </motion.p>
          <motion.h2
            {...reveal}
            className="brut-display mb-5 mt-2 max-w-[800px] text-[clamp(2.6rem,6vw,4.6rem)] text-chalk"
          >
            Series semanales: el número que decide si crecés.
          </motion.h2>
          <motion.p
            {...reveal}
            className="mb-16 max-w-[660px] text-[1.05rem] font-light leading-7 text-chalk/70"
          >
            El progreso de cada músculo depende de cuántas series que de verdad
            cuestan hace por semana — no de cuántos días vas ni de cuánto
            transpirás. Ese número tiene tres zonas, y el trabajo del método es
            mantenerte en la del medio:
          </motion.p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
            {ZONAS.map((z, i) => (
              <motion.div
                key={z.zona}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                className={`flex flex-col gap-4 p-8 ${
                  z.tono === CYAN
                    ? "brut-panel-raised"
                    : "border border-white/[0.14] bg-white/[0.03]"
                }`}
              >
                <span
                  className="brut-mono self-start border px-3.5 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.14em]"
                  style={{ color: z.tono, borderColor: `${z.tono}55`, background: `${z.tono}14` }}
                >
                  {z.zona}
                </span>

                {/* medidor horizontal */}
                <div aria-hidden className="relative h-2.5 border border-white/[0.14] bg-black/40">
                  <motion.span
                    initial={{ left: 0, opacity: 0 }}
                    whileInView={{ left: `calc(${z.pos}% - 9px)`, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: 0.3 + i * 0.1, ease: "easeOut" }}
                    className="absolute -top-[5px] h-[18px] w-[18px]"
                    style={{ background: z.tono, boxShadow: `3px 3px 0 ${z.tono}33` }}
                  />
                </div>

                <h3 className="brut-display m-0 text-[1.3rem] text-chalk">
                  {z.titulo}
                </h3>
                <p className="m-0 text-[0.95rem] font-light leading-7 text-chalk/70">
                  {z.texto}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.p
            {...reveal}
            className="mt-10 max-w-[660px] border-l-2 border-cyan pl-4 text-[0.95rem] leading-7 text-chalk/55"
          >
            ¿Cómo sabés en qué zona estás? Por tu respuesta, no por una tabla:
            si la semana siguiente rendís igual o mejor, la cantidad era buena;
            si rendís peor, te pasaste. CalistenIA hace esa lectura por vos,
            sesión a sesión, y ajusta tus series semanales según cómo venís.
          </motion.p>
        </div>
      </section>

      {/* ───────────────────────── Bloques y descarga ───────────────────────── */}
      <section className="brut-sec brut-concrete relative overflow-hidden bg-void px-8 py-52 text-chalk">
        <div className="relative mx-auto max-w-6xl">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] items-center gap-16">
            <div>
              <motion.p {...reveal} className="brut-label mb-6">
                [FLORA_05 // LA_PLANIFICACION]
              </motion.p>
              <motion.h2
                {...reveal}
                className="brut-display mb-6 mt-2 text-[clamp(2.6rem,6vw,4.6rem)] text-chalk"
              >
                Bloques de 5 semanas, no rutinas eternas.
              </motion.h2>
              <motion.p {...reveal} className="mb-5 text-[1.05rem] font-light leading-8 text-chalk/70">
                Entrenar igual todo el año no funciona: la fatiga se acumula más
                rápido de lo que el cuerpo se adapta. Por eso el método trabaja
                en <strong className="font-bold text-chalk">bloques de 5 semanas</strong>: cuatro donde las series
                semanales suben de a poco, y una{" "}
                <strong className="font-bold text-chalk">semana de descarga</strong> — mitad de series, sin exigirte
                al límite.
              </motion.p>
              <motion.p {...reveal} className="m-0 text-[1.05rem] font-light leading-8 text-chalk/70">
                La descarga no es una semana perdida: es donde el esfuerzo del
                mes se convierte en resultado, y lo que te permite arrancar el
                próximo bloque un escalón más arriba. Saltearla es la vía rápida
                al estancamiento.
              </motion.p>
            </div>

            {/* Bloque visual */}
            <motion.div
              {...reveal}
              className="brut-panel-raised p-[clamp(28px,4vw,48px)]"
            >
              <p className="brut-label mb-7">[un_bloque_tipo]</p>
              <div className="flex flex-col gap-3.5">
                {[
                  { s: "Semana 1", l: "Arranque conservador", w: 34 },
                  { s: "Semana 2", l: "Suben las series", w: 52 },
                  { s: "Semana 3", l: "Suben las series", w: 70 },
                  { s: "Semana 4", l: "Semana pico — tu mejor semana", w: 92 },
                  { s: "Semana 5", l: "Descarga — 50% del trabajo", w: 26, deload: true },
                ].map((w, i) => (
                  <div key={w.s} className="grid grid-cols-[88px_1fr] items-center gap-4">
                    <span
                      className={`brut-mono text-[0.78rem] font-bold uppercase tracking-[0.04em] ${
                        w.deload ? "text-cyan" : "text-chalk/70"
                      }`}
                    >
                      {w.s}
                    </span>
                    <div>
                      <div className="mb-1.5 h-3 border border-white/[0.14] bg-black/40">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${w.w}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, delay: 0.2 + i * 0.12, ease: "easeOut" }}
                          className="h-full"
                          style={{
                            background: w.deload
                              ? "repeating-linear-gradient(-45deg, #00E5FF 0 8px, transparent 8px 16px)"
                              : CYAN,
                          }}
                        />
                      </div>
                      <span className="brut-mono text-[0.72rem] text-chalk/50">{w.l}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── Repeticiones en reserva ───────────────────────── */}
      <section className="brut-sec brut-concrete relative overflow-hidden bg-concrete px-8 py-52 text-chalk">
        <div className="brut-hazard absolute left-0 right-0 top-0 h-[1.5px] opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-[880px] text-center">
          <motion.p {...reveal} className="brut-label mb-6">
            [FLORA_06 // LA_INTENSIDAD]
          </motion.p>
          <motion.h2
            {...reveal}
            className="brut-display mx-auto mb-7 mt-2 text-[clamp(2.6rem,6vw,4.6rem)] text-chalk"
          >
            Repeticiones <span className="text-cyan">en reserva.</span>
          </motion.h2>
          <motion.p
            {...reveal}
            className="mx-auto mb-12 max-w-[680px] text-[1.1rem] font-light leading-8 text-chalk/70"
          >
            La intensidad se maneja con una pregunta simple al final de cada
            serie: ¿cuántas repeticiones más podrías haber hecho bien? El punto
            ideal para construir músculo es terminar con 1 o 2 en reserva — las
            últimas tienen que costar. Cero en reserva es el fallo: se usa poco
            y a propósito, porque cuesta caro de recuperar.
          </motion.p>
          <motion.div {...reveal} className="flex flex-wrap justify-center gap-3.5">
            {[
              { t: "5+ en reserva", d: "Demasiado fácil · esa serie no cuenta", on: false },
              { t: "1–2 en reserva", d: "El punto ideal · acá se progresa", on: true },
              { t: "0 en reserva (fallo)", d: "Caro de recuperar · con moderación", on: false },
            ].map((z) => (
              <div
                key={z.t}
                className={`min-w-[210px] px-6 py-4 text-left ${
                  z.on
                    ? "brut-panel-raised border-cyan bg-cyan/10"
                    : "border border-white/[0.14] bg-white/[0.03]"
                }`}
              >
                <p
                  className={`brut-mono mb-1 text-[0.95rem] font-bold uppercase tracking-[0.02em] ${
                    z.on ? "text-cyan" : "text-chalk/80"
                  }`}
                >
                  {z.t}
                </p>
                <p className="m-0 text-[0.8rem] text-chalk/55">{z.d}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────────────────────── Consistencia ───────────────────────── */}
      <section className="brut-sec brut-concrete relative overflow-hidden bg-void px-8 py-52 text-chalk">
        <div
          className="brut-display brut-outline-cyan pointer-events-none absolute -right-8 bottom-8 select-none text-[16rem] leading-none opacity-40 max-lg:hidden"
          aria-hidden
        >
          92
        </div>
        <div className="relative mx-auto max-w-6xl">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] items-center gap-16">
            <div>
              <motion.p {...reveal} className="brut-label mb-6">
                [FLORA_07 // LA_METRICA_QUE_MANDA]
              </motion.p>
              <motion.h2
                {...reveal}
                className="brut-display mb-6 mt-2 text-[clamp(2.6rem,6vw,4.6rem)] text-chalk"
              >
                Tu consistencia vale más que tu mejor sesión.
              </motion.h2>
              <motion.p {...reveal} className="mb-5 text-[1.05rem] font-light leading-8 text-chalk/70">
                El método mide tu consistencia como un porcentaje: cuántas de
                las sesiones del mes cumpliste. Arriba del 80%, los resultados
                llegan solos — la evidencia sobre adherencia es contundente. Por
                debajo, no hay rutina que te salve.
              </motion.p>
              <motion.p {...reveal} className="m-0 text-[1.05rem] font-light leading-8 text-chalk/70">
                ¿Día complicado, poco tiempo? En vez de saltear, la app te
                ofrece la <strong className="font-bold text-chalk">sesión mínima</strong>: 15 minutos, los 2 o 3
                ejercicios que más mueven la aguja. Cuenta para tu consistencia
                — porque mantener el hábito importa más que la sesión perfecta.
              </motion.p>
            </div>

            {/* Score visual */}
            <motion.div
              {...reveal}
              className="brut-panel-raised p-[clamp(28px,4vw,48px)] text-center"
            >
              <p className="brut-label mb-6">[consistencia_del_mes]</p>
              <p className="brut-display m-0 mb-2 text-[clamp(3.5rem,7vw,5.5rem)] leading-none text-cyan">
                92%
              </p>
              <p className="brut-mono mb-8 text-[0.8rem] uppercase tracking-[0.06em] text-chalk/50">
                11 de 12 sesiones cumplidas
              </p>
              <div className="mb-7 flex flex-wrap justify-center gap-2">
                {[1, 1, 1, 1, 2, 1, 1, 1, 0, 1, 1, 1].map((s, i) => (
                  <span
                    key={i}
                    title={s === 2 ? "Sesión mínima" : s === 1 ? "Sesión completa" : "No cumplida"}
                    className="h-[22px] w-[22px]"
                    style={{
                      background: s === 1 ? CYAN : s === 2 ? "rgba(0,229,255,0.4)" : "transparent",
                      border: s === 0 ? "1px solid rgba(255,255,255,0.32)" : "1px solid transparent",
                    }}
                  />
                ))}
              </div>
              <p className="brut-mono m-0 text-[0.72rem] uppercase tracking-[0.04em] text-chalk/55">
                <span className="font-bold text-cyan">■</span> completa ·{" "}
                <span className="font-bold text-cyan/40">■</span> sesión mínima ·{" "}
                <span className="font-bold">□</span> no cumplida
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── Alimentación consciente ───────────────────────── */}
      <section className="brut-sec brut-concrete relative overflow-hidden bg-concrete px-8 py-52 text-chalk">
        <div className="relative mx-auto max-w-6xl">
          <motion.p {...reveal} className="brut-label mb-6">
            [FLORA_08 // ALIMENTACION_CONSCIENTE]
          </motion.p>
          <motion.h2
            {...reveal}
            className="brut-display mb-5 mt-2 max-w-[760px] text-[clamp(2.6rem,6vw,4.6rem)] text-chalk"
          >
            Cuatro decisiones por día. Ninguna dieta.
          </motion.h2>
          <motion.p
            {...reveal}
            className="mb-16 max-w-[640px] text-[1.05rem] font-light leading-7 text-chalk/70"
          >
            Ninguna dieta con nombre propio tiene magia: todas funcionan cuando
            te ayudan a comer comida real en la cantidad que tu cuerpo necesita.
            El método lo reduce a cuatro decisiones conscientes:
          </motion.p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
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
                className="border border-white/[0.14] bg-white/[0.03] p-8 transition-colors hover:border-cyan/60"
              >
                <span className="brut-display mb-4 inline-flex h-10 w-10 items-center justify-center bg-cyan text-base text-black">
                  {i + 1}
                </span>
                <h3 className="brut-display mb-2.5 mt-0 text-[1.3rem] text-chalk">
                  {c.t}
                </h3>
                <p className="m-0 text-[0.93rem] font-light leading-7 text-chalk/70">
                  {c.d}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── CTA final ───────────────────────── */}
      <section className="brut-sec brut-concrete relative overflow-hidden bg-void px-8 py-52 text-chalk">
        <div className="relative mx-auto max-w-6xl">
          <motion.div
            {...reveal}
            className="brut-panel-raised relative overflow-hidden px-[clamp(28px,6vw,80px)] py-[clamp(56px,8vw,96px)] text-center"
          >
            <div className="brut-hazard absolute left-0 right-0 top-0 h-[6px]" aria-hidden />
            <p className="brut-label mb-6">[FLORA_09 // EMPEZA_HOY]</p>
            <h2 className="brut-display mx-auto mb-5 mt-0 text-[clamp(2.6rem,6vw,4.6rem)] text-chalk">
              El método empieza midiendo dónde estás.
            </h2>
            <p className="mx-auto mb-12 max-w-[560px] text-[1.05rem] font-light leading-7 text-chalk/60">
              Cuatro minutos frente a tu cámara alcanzan para conocer tu punto
              de partida. Desde ahí, tus series semanales las calculamos con
              datos, no a ojo.
            </p>
            <a href="/evaluacion" className="brut-btn px-9 py-4 text-sm">
              Hacer mi evaluación gratis →
            </a>
            <p className="mx-auto mt-12 max-w-[560px] text-[0.78rem] leading-6 text-chalk/45">
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
