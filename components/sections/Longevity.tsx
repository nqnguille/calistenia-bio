"use client";
import { motion } from "framer-motion";

const C = { cream:"#F8F6F2", cream2:"#F1EEE8", ink:"#151716", border:"#DED9CE", sage:"#7A8F74", muted:"#8E9188", petrol:"#203040" };

export function Longevity() {
  return (
    <section style={{ backgroundColor:C.cream, borderTop:`1px solid ${C.border}` }} className="py-52 px-8">
      <div style={{ maxWidth:1152, margin:"0 auto" }}>
        <motion.div initial={{ opacity:0,y:32 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
          style={{ background:C.petrol, borderRadius:28, padding:"96px 80px" }}>
          <div style={{ maxWidth:760, margin:"0 auto", textAlign:"center" }}>
            <p style={{ fontSize:"0.7rem", fontWeight:700, color:C.sage, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:24 }}>La filosofía</p>
            <h2 style={{ fontSize:"clamp(2.5rem,5vw,4.5rem)", fontWeight:900, color:C.cream, lineHeight:0.95, letterSpacing:"-0.03em", marginBottom:16 }}>
              No entrenamos para el verano.
            </h2>
            <h2 style={{ fontSize:"clamp(2.5rem,5vw,4.5rem)", fontWeight:900, color:C.sage, lineHeight:0.95, letterSpacing:"-0.03em", marginBottom:32 }}>
              Entrenamos para los próximos 40 años.
            </h2>
            <p style={{ fontSize:"1.1rem", color:"rgba(248,246,242,0.65)", lineHeight:1.7, fontWeight:300, marginBottom:56 }}>
              La obsesión por la estética destruyó la relación de millones de personas con el movimiento. Nosotros proponemos otra cosa: moverte bien, durante mucho tiempo, porque te hace sentir joven.
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:32, borderTop:"1px solid rgba(255,255,255,0.1)", paddingTop:48, marginBottom:48 }}>
              {[{ n:"10+", l:"años de rejuvenecimiento posible" }, { n:"4min", l:"es suficiente para empezar" }, { n:"∞", l:"progreso compuesto en el tiempo" }].map(s => (
                <div key={s.l} style={{ textAlign:"center" }}>
                  <p style={{ fontSize:"clamp(2rem,4vw,3.5rem)", fontWeight:900, color:C.cream, letterSpacing:"-0.03em", lineHeight:1, marginBottom:8 }}>{s.n}</p>
                  <p style={{ fontSize:"0.85rem", color:"rgba(248,246,242,0.45)", lineHeight:1.6 }}>{s.l}</p>
                </div>
              ))}
            </div>
            <motion.a href="/evaluacion" whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
              style={{ display:"inline-flex", alignItems:"center", gap:16, background:C.cream, color:C.ink, fontWeight:700, fontSize:"1rem", padding:"16px 36px", borderRadius:999, cursor:"pointer" }}>
              Comenzar mi evaluación <span style={{ color:C.sage }}>→</span>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
