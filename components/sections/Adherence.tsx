"use client";
import { motion } from "framer-motion";

const C = { cream:"#F8F6F2", cream2:"#F1EEE8", ink:"#1B1B1B", ink2:"#3A3A3A", sage:"#6B7B68", muted:"#888880", border:"#E0DDD6" };
const active = new Set([0,1,2,4,5,7,8,9,11,14,15,16,17,18,21,22,23,24,25,28,29,30,31,32,33,34]);
const streak = new Set([21,22,23,24,25,28,29,30,31,32,33,34]);
const days = Array.from({ length:35 },(_,i) => ({ active:active.has(i), streak:streak.has(i) }));

export function Adherence() {
  return (
    <section style={{ backgroundColor:C.cream2, borderTop:`1px solid ${C.border}` }} className="py-52 px-8">
      <div style={{ maxWidth:1152, margin:"0 auto" }}>

        {/* Centered header */}
        <div style={{ textAlign:"center", marginBottom:104 }}>
          <motion.div initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
            style={{ display:"inline-flex", alignItems:"center", gap:16, fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:C.sage, marginBottom:28 }}>
            <span style={{ width:24, height:1, background:C.sage }} />Adherencia<span style={{ width:24, height:1, background:C.sage }} />
          </motion.div>
          <motion.h2 initial={{ opacity:0,y:24 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:0.1 }}
            style={{ fontSize:"clamp(2.8rem,5vw,4.5rem)", fontWeight:900, color:C.ink, lineHeight:0.95, letterSpacing:"-0.03em", marginBottom:28 }}>
            El entrenamiento más importante<br/>
            <span style={{ color:C.muted, fontWeight:300 }}>es el que no abandonás.</span>
          </motion.h2>
          <motion.p initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:0.2 }}
            style={{ fontSize:"1.1rem", color:C.ink2, lineHeight:1.7, fontWeight:300, maxWidth:480, margin:"0 auto" }}>
            4 minutos cuentan tanto como 45. Lo que importa es que mañana también lo hagas.
          </motion.p>
        </div>

        {/* 2-col: features + calendar */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:72, alignItems:"start" }}>
          <motion.div initial={{ opacity:0,x:-24 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:true }}
            style={{ display:"flex", flexDirection:"column", gap:28 }}>
            {[
              { icon:"⏱", text:"Micro-sesiones desde 4 minutos" },
              { icon:"🧠", text:"Recordatorios basados en tu ritmo circadiano" },
              { icon:"🎯", text:"Objetivos semanales adaptados a tu vida real" },
              { icon:"📈", text:"El progreso visible genera su propio momentum" },
            ].map(f => (
              <div key={f.text} style={{ display:"flex", alignItems:"flex-start", gap:16 }}>
                <span style={{ fontSize:"1.4rem", flexShrink:0 }}>{f.icon}</span>
                <span style={{ fontSize:"1.05rem", lineHeight:1.65, color:C.ink2, fontWeight:300 }}>{f.text}</span>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity:0,x:24 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:true }} transition={{ delay:0.15 }}
            style={{ background:"#fff", border:`1px solid ${C.border}`, borderRadius:24, padding:"44px", boxShadow:"0 16px 48px rgba(27,27,27,0.07)" }}>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
              <div>
                <p style={{ fontSize:"0.7rem", color:C.muted, textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:600, marginBottom:4 }}>Racha actual</p>
                <p style={{ fontSize:"2.5rem", fontWeight:900, color:C.ink, lineHeight:1 }}>12 <span style={{ fontSize:"1rem", fontWeight:400, color:C.muted }}>días</span></p>
              </div>
              <span style={{ fontSize:"2rem" }}>🔥</span>
            </div>

            {/* Heatmap */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:16 }}>
              {["L","M","X","J","V","S","D"].map(d => (
                <p key={d} style={{ textAlign:"center", fontSize:"0.65rem", color:C.muted, fontWeight:600, marginBottom:4 }}>{d}</p>
              ))}
              {days.map((d,i) => (
                <motion.div key={i} initial={{ scale:0,opacity:0 }} whileInView={{ scale:1,opacity:1 }}
                  viewport={{ once:true }} transition={{ delay:0.01*i, duration:0.2 }}
                  style={{ aspectRatio:"1", borderRadius:4, background: d.streak ? C.sage : d.active ? `${C.sage}44` : C.border }} />
              ))}
            </div>

            <div style={{ display:"flex", gap:28, fontSize:"0.72rem", color:C.muted, marginBottom:24 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:10, height:10, borderRadius:2, background:C.sage }} /><span>Racha activa</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:10, height:10, borderRadius:2, background:`${C.sage}44` }} /><span>Día activo</span>
              </div>
            </div>

            <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:20, display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
              {[{ n:"26", l:"días activos" }, { n:"4min", l:"sesión mínima" }, { n:"87%", l:"consistencia" }].map(s => (
                <div key={s.l} style={{ textAlign:"center" }}>
                  <p style={{ fontSize:"1.4rem", fontWeight:900, color:C.ink }}>{s.n}</p>
                  <p style={{ fontSize:"0.7rem", color:C.muted, marginTop:2 }}>{s.l}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
