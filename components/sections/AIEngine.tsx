"use client";
import { motion } from "framer-motion";

const C = { cream:"#F8F6F2", sage:"#7A8F74", muted:"#8E9188", dark:"#080B0F", dark2:"#111821", border:"rgba(255,255,255,0.08)" };

const pipeline = [
  { n:"01", label:"Cuerpo humano",   sub:"Webcam · 30fps",                icon:"◎" },
  { n:"02", label:"33 landmarks",    sub:"Puntos anatómicos clave",       icon:"⊕" },
  { n:"03", label:"Biomecánica",     sub:"Ángulos · Velocidad · Simetría", icon:"◈" },
  { n:"04", label:"Insights",        sub:"Edad de Movimiento",            icon:"◉" },
];

export function AIEngine() {
  return (
    <section style={{ background:C.dark, position:"relative", overflow:"hidden" }} className="py-52 px-8" id="ciencia">
      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background:"radial-gradient(ellipse 70% 50% at 50% 40%, rgba(122,143,116,0.14) 0%, transparent 70%)"
      }} />
      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage:"linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)",
        backgroundSize:"64px 64px"
      }} />

      <div style={{ maxWidth:1152, margin:"0 auto" }}>

        <div className="section-tag mb-8" style={{ color:C.sage }}>Motor de IA</div>

        <motion.h2 initial={{ opacity:0,y:32 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
          style={{ color:C.cream, fontSize:"clamp(2.8rem,5vw,5rem)", fontWeight:900, lineHeight:0.95, letterSpacing:"-0.03em", maxWidth:"800px" }}
          className="mb-6"
        >
          Tu cuerpo genera miles de señales.<br/>
          <span className="grad-text">Nuestra IA las convierte en conocimiento.</span>
        </motion.h2>

        <motion.p initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
          style={{ color:C.muted, fontSize:"1.1rem", lineHeight:1.7, maxWidth:"480px" }} className="mb-20">
          En cada evaluación, el sistema analiza más de 30 variables biomecánicas simultáneamente. Sin contacto. Sin sensores. Solo tu cámara.
        </motion.p>

        {/* Pipeline */}
        <div className="grid md:grid-cols-4 gap-3 mb-6">
          {pipeline.map((p,i) => (
            <motion.div key={p.n}
              initial={{ opacity:0,y:24 }} whileInView={{ opacity:1,y:0 }}
              viewport={{ once:true }} transition={{ delay:i*0.1 }}
              style={{ background:C.dark2, border:`1px solid ${C.border}`, borderRadius:"1.25rem", padding:"40px" }}
            >
              <div className="flex justify-between items-start mb-5">
                <span style={{ fontSize:"1.6rem", color:C.sage }}>{p.icon}</span>
                <span style={{ fontSize:"0.65rem", color:"rgba(255,255,255,0.25)", fontFamily:"monospace", fontWeight:600 }}>{p.n}</span>
              </div>
              <p style={{ color:C.cream, fontWeight:700, fontSize:"1rem", marginBottom:4 }}>{p.label}</p>
              <p style={{ color:C.muted, fontSize:"0.85rem", lineHeight:1.6 }}>{p.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
          style={{ border:`1px solid ${C.border}`, borderRadius:"1.25rem", overflow:"hidden" }}
          className="grid grid-cols-2 md:grid-cols-4"
        >
          {[
            { n:"33",    l:"Puntos anatómicos" },
            { n:"30fps", l:"Tiempo real" },
            { n:"5",     l:"Dimensiones" },
            { n:"<5min", l:"Evaluación" },
          ].map((s,i) => (
            <div key={s.l} style={{ background:C.dark2, borderLeft: i>0 ? `1px solid ${C.border}` : "none", padding:"44px 40px" }}>
              <p style={{ color:C.cream, fontSize:"clamp(2rem,3vw,2.8rem)", fontWeight:900, letterSpacing:"-0.02em", lineHeight:1, marginBottom:8 }}>{s.n}</p>
              <p style={{ color:C.muted, fontSize:"0.85rem" }}>{s.l}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
