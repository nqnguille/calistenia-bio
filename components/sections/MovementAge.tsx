"use client";
import { motion } from "framer-motion";

const C = { cream:"#F8F6F2", cream2:"#F1EEE8", ink:"#1B1B1B", ink2:"#3A3A3A", sage:"#6B7B68", muted:"#888880", border:"#E0DDD6", red:"#ef4444" };

export function MovementAge() {
  return (
    <section style={{ backgroundColor:C.cream, borderTop:`1px solid ${C.border}` }} className="py-52 px-8" id="producto">
      <div style={{ maxWidth:1152, margin:"0 auto" }}>

        {/* Centered header */}
        <div style={{ textAlign:"center", marginBottom:112 }}>
          <motion.div initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
            style={{ display:"inline-flex", alignItems:"center", gap:16, fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:C.sage, marginBottom:28 }}>
            <span style={{ width:24, height:1, background:C.sage }} />La métrica central<span style={{ width:24, height:1, background:C.sage }} />
          </motion.div>
          <motion.h2 initial={{ opacity:0,y:24 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:0.1 }}
            style={{ fontSize:"clamp(2.8rem,5vw,4.5rem)", fontWeight:900, color:C.ink, lineHeight:0.95, letterSpacing:"-0.03em", marginBottom:28 }}>
            Edad de Movimiento
          </motion.h2>
          <motion.p initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:0.2 }}
            style={{ fontSize:"1.1rem", color:C.ink2, lineHeight:1.7, fontWeight:300, maxWidth:480, margin:"0 auto" }}>
            Una sola cifra que resume cómo se mueve tu cuerpo comparado con lo que debería para tu edad cronológica.
          </motion.p>
        </div>

        {/* 2-col: numbers + explanation */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:72, alignItems:"start" }}>

          {/* Giant number comparison */}
          <motion.div initial={{ opacity:0,x:-24 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:true }}
            style={{ display:"flex", flexDirection:"column", gap:32 }}>
            <div>
              <p style={{ color:C.muted, fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:8 }}>Edad cronológica</p>
              <p style={{ fontSize:"clamp(5rem,10vw,9rem)", fontWeight:900, color:"rgba(27,27,27,0.15)", lineHeight:0.9, letterSpacing:"-0.04em" }}>40</p>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:28, paddingLeft:8 }}>
              <div style={{ width:1, height:48, background:C.border }} />
              <p style={{ color:C.muted, fontSize:"0.85rem" }}>vs. tu movimiento real</p>
            </div>
            <div>
              <p style={{ color:C.sage, fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:8 }}>Edad de Movimiento</p>
              <p style={{ fontSize:"clamp(5rem,10vw,9rem)", fontWeight:900, color:C.ink, lineHeight:0.9, letterSpacing:"-0.04em" }}>54</p>
              <div style={{ height:2, background:`linear-gradient(to right, ${C.sage}, transparent)`, borderRadius:2, marginTop:12 }} />
              <p style={{ color:C.red, fontSize:"0.95rem", fontWeight:600, marginTop:10 }}>Tu cuerpo mueve 14 años más viejo de lo que sos.</p>
            </div>
          </motion.div>

          {/* Explanation card */}
          <motion.div initial={{ opacity:0,x:24 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:true }} transition={{ delay:0.15 }}
            style={{ background:C.cream2, border:`1px solid ${C.border}`, borderRadius:24, padding:"40px", display:"flex", flexDirection:"column", gap:28 }}>
            <div>
              <h3 style={{ color:C.ink, fontSize:"1.2rem", fontWeight:700, marginBottom:10 }}>¿Cómo se calcula?</h3>
              <p style={{ color:C.ink2, fontSize:"1rem", lineHeight:1.7, fontWeight:300 }}>La IA analiza tus patrones de movimiento y los compara con miles de perfiles biomecánicos reales. El resultado es una edad funcional, no una estimación genética.</p>
            </div>
            {[
              { l:"Movilidad articular",  v:62 },
              { l:"Control postural",      v:78 },
              { l:"Velocidad de reacción", v:55 },
              { l:"Fuerza funcional",       v:70 },
            ].map(m => (
              <div key={m.l}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <span style={{ color:C.ink2, fontSize:"0.9rem" }}>{m.l}</span>
                  <span style={{ color:C.ink, fontSize:"0.9rem", fontWeight:700 }}>{m.v}%</span>
                </div>
                <div style={{ height:6, background:C.border, borderRadius:3, overflow:"hidden" }}>
                  <motion.div initial={{ width:0 }} whileInView={{ width:`${m.v}%` }} viewport={{ once:true }}
                    transition={{ duration:1, ease:[0.16,1,0.3,1] }}
                    style={{ height:"100%", background:C.sage, borderRadius:3 }} />
                </div>
              </div>
            ))}
            <div style={{ background:"rgba(107,123,104,0.08)", border:"1px solid rgba(107,123,104,0.2)", borderRadius:12, padding:16 }}>
              <p style={{ color:C.ink2, fontSize:"0.9rem", lineHeight:1.65 }}><strong style={{ color:C.ink }}>Buena noticia:</strong> En 8 semanas de práctica consistente, la mayoría de usuarios reduce su Edad de Movimiento entre 3 y 9 años.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
