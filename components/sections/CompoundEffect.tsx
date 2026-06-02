"use client";
import { motion } from "framer-motion";

const C = { cream:"#F8F6F2", ink:"#1B1B1B", ink2:"#3A3A3A", sage:"#6B7B68", muted:"#888880", border:"#E0DDD6", dark:"#0E1117", dark2:"#161B24" };

const milestones = [
  { time:"1 semana",  pct:4,  label:"Primeros cambios perceptibles" },
  { time:"1 mes",     pct:14, label:"Patrones de movimiento mejorados" },
  { time:"6 meses",   pct:38, label:"Transformación biomecánica visible" },
  { time:"1 año",     pct:60, label:"Un cuerpo que mueve años más joven" },
  { time:"5 años",    pct:90, label:"Rejuvenecimiento sostenido" },
];

export function CompoundEffect() {
  return (
    <section style={{ backgroundColor:C.cream, borderTop:`1px solid ${C.border}` }} className="py-52 px-8">
      <div style={{ maxWidth:1152, margin:"0 auto" }}>

        {/* Centered header */}
        <div style={{ textAlign:"center", marginBottom:112 }}>
          <motion.div initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
            style={{ display:"inline-flex", alignItems:"center", gap:16, fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:C.sage, marginBottom:28 }}>
            <span style={{ width:24, height:1, background:C.sage }} />El efecto compuesto<span style={{ width:24, height:1, background:C.sage }} />
          </motion.div>
          <motion.h2 initial={{ opacity:0,y:24 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:0.1 }}
            style={{ fontSize:"clamp(2.8rem,5vw,4.5rem)", fontWeight:900, color:C.ink, lineHeight:0.95, letterSpacing:"-0.03em", marginBottom:28 }}>
            Pequeñas mejoras hoy.<br/>
            <span style={{ color:C.muted, fontWeight:300 }}>Grandes cambios mañana.</span>
          </motion.h2>
          <motion.p initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:0.2 }}
            style={{ fontSize:"1.1rem", color:C.ink2, lineHeight:1.7, fontWeight:300, maxWidth:480, margin:"0 auto" }}>
            El movimiento consistente no suma — multiplica. Cada semana construye sobre la anterior generando un efecto compuesto en tu biología.
          </motion.p>
        </div>

        {/* Timeline bars */}
        <div style={{ maxWidth:720, margin:"0 auto", display:"flex", flexDirection:"column", gap:28, marginBottom:112 }}>
          {milestones.map((m,i) => (
            <motion.div key={m.time} initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:i*0.08 }}
              style={{ display:"flex", alignItems:"center", gap:28 }}>
              <div style={{ width:88, textAlign:"right", flexShrink:0 }}>
                <span style={{ fontSize:"0.85rem", fontWeight:600, color:C.ink2 }}>{m.time}</span>
              </div>
              <div style={{ flex:1, height:40, background:C.border, borderRadius:8, overflow:"hidden" }}>
                <motion.div initial={{ width:0 }} whileInView={{ width:`${m.pct}%` }} viewport={{ once:true }}
                  transition={{ duration:1, delay:0.2+i*0.08, ease:[0.16,1,0.3,1] }}
                  style={{ height:"100%", background:`linear-gradient(90deg,${C.sage},#8A9E87)`, borderRadius:8, display:"flex", alignItems:"center", paddingLeft:14, minWidth:40 }}>
                  {m.pct > 8 && <span style={{ color:"#fff", fontSize:"0.8rem", fontWeight:700, whiteSpace:"nowrap" }}>+{m.pct}%</span>}
                </motion.div>
              </div>
              <div style={{ width:180, flexShrink:0, display:"none" }} className="md:block">
                <span style={{ fontSize:"0.85rem", color:C.muted }}>{m.label}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dark quote */}
        <motion.div initial={{ opacity:0,y:24 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
          style={{ background:C.dark, borderRadius:24, padding:"56px 64px", textAlign:"center" }}>
          <p style={{ fontSize:"0.7rem", fontWeight:700, color:C.sage, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:28 }}>La premisa</p>
          <p style={{ fontSize:"clamp(1.4rem,2.5vw,2rem)", fontWeight:600, color:"#F8F6F2", lineHeight:1.4, maxWidth:600, margin:"0 auto" }}>
            "El envejecimiento físico no es lineal. Con el estímulo correcto,{" "}
            <span style={{ color:C.sage }}>se puede revertir.</span>"
          </p>
          <p style={{ fontSize:"0.8rem", color:"rgba(136,136,128,0.8)", marginTop:20 }}>— Principio de plasticidad biomecánica</p>
        </motion.div>
      </div>
    </section>
  );
}
