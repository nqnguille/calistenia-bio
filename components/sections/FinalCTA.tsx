"use client";
import { motion } from "framer-motion";

export function FinalCTA() {
  return (
    <section className="relative bg-dark min-h-[90vh] flex items-center justify-center px-6 py-36 overflow-hidden">
      {/* Glow rings */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px]"
          style={{ background:"radial-gradient(ellipse, rgba(107,123,104,0.15) 0%, transparent 60%)" }} />
        {[300,500,700].map((size) => (
          <motion.div key={size}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]"
            style={{ width:size, height:size }}
            animate={{ scale:[1,1.05,1], opacity:[0.4,0.7,0.4] }}
            transition={{ duration:4+size/200, repeat:Infinity, ease:"easeInOut" }}
          />
        ))}
      </div>

      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage:"linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize:"60px 60px" }} />

      <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center gap-10">
        <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
          transition={{ duration:0.6 }}
          className="section-label justify-center" style={{ color:"#6B7B68" }}
        >
          CALISTENIA.bio
        </motion.div>

        <motion.h2
          initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }}
          transition={{ duration:1, ease:[0.16,1,0.3,1], delay:0.1 }}
          className="text-[3.5rem] sm:text-[5rem] lg:text-[7rem] font-black text-cream leading-[0.9] tracking-[-0.04em]"
        >
          Tu cuerpo<br />
          envejece<br />
          todos los días.
        </motion.h2>

        <motion.p
          initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }}
          transition={{ duration:0.8, delay:0.3 }}
          className="text-2xl md:text-3xl font-light text-cream/40 tracking-tight"
        >
          ¿Estás haciendo algo para rejuvenecerlo?
        </motion.p>

        <motion.div
          initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }}
          transition={{ duration:0.7, delay:0.45 }}
        >
          <motion.a href="/evaluacion"
            whileHover={{ scale:1.04, boxShadow:"0 24px 64px rgba(248,246,242,0.2)" }}
            whileTap={{ scale:0.97 }}
            className="inline-flex items-center gap-3 bg-cream text-ink font-black text-xl px-10 py-5 rounded-full cursor-pointer tracking-[-0.02em]"
          >
            Descubrir mi Edad de Movimiento
            <span className="text-sage">→</span>
          </motion.a>
        </motion.div>

        <motion.div
          initial={{ opacity:0 }} whileInView={{ opacity:1 }}
          viewport={{ once:true }} transition={{ delay:0.6 }}
          className="flex flex-wrap justify-center gap-6 text-sm text-cream/25 font-medium"
        >
          {["Evaluación gratuita","Sin tarjeta","5 minutos","Solo webcam"].map((t,i) => (
            <span key={t} className="flex items-center gap-2">
              {i>0 && <span className="w-1 h-1 rounded-full bg-cream/15" />}
              {t}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
