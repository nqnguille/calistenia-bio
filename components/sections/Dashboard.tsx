"use client";
import { motion } from "framer-motion";

const C = { cream:"#F8F6F2", cream2:"#F1EEE8", cream3:"#E8E4DC", ink:"#151716", ink2:"#343A36", sage:"#7A8F74", muted:"#8E9188", border:"#DED9CE" };

export function Dashboard() {
  return (
    <section style={{ backgroundColor:C.cream, borderTop:`1px solid ${C.border}` }} className="py-52 px-8">
      <div style={{ maxWidth:1152, margin:"0 auto" }}>

        {/* Centered header */}
        <div style={{ textAlign:"center", marginBottom:104 }}>
          <motion.div initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
            style={{ display:"inline-flex", alignItems:"center", gap:16, fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:C.sage, marginBottom:28 }}>
            <span style={{ width:24, height:1, background:C.sage }} />El dashboard<span style={{ width:24, height:1, background:C.sage }} />
          </motion.div>
          <motion.h2 initial={{ opacity:0,y:24 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:0.1 }}
            style={{ fontSize:"clamp(2.8rem,5vw,4.5rem)", fontWeight:900, color:C.ink, lineHeight:0.95, letterSpacing:"-0.03em", marginBottom:28 }}>
            Tu salud motora, <span style={{ color:C.muted, fontWeight:300 }}>de un vistazo.</span>
          </motion.h2>
          <motion.p initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:0.2 }}
            style={{ fontSize:"1.1rem", color:C.ink2, lineHeight:1.7, fontWeight:300, maxWidth:460, margin:"0 auto" }}>
            Todo tu progreso, tus métricas y tu evolución semanal en un solo lugar.
          </motion.p>
        </div>

        {/* Dashboard card */}
        <motion.div initial={{ opacity:0,y:32 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:0.2 }}
          style={{ background:"#fff", border:`1px solid ${C.border}`, borderRadius:28, boxShadow:"0 32px 80px rgba(27,27,27,0.08)", overflow:"hidden" }}>

          {/* Header bar */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"22px 32px", borderBottom:`1px solid ${C.border}`, background:C.cream2, flexWrap:"wrap", gap:12 }}>
            <div>
              <p style={{ fontSize:"0.65rem", color:C.muted, textTransform:"uppercase", letterSpacing:"0.12em", fontWeight:600, marginBottom:4 }}>Hola, Martina</p>
              <p style={{ fontSize:"1.3rem", fontWeight:900, color:C.ink, letterSpacing:"-0.02em" }}>Semana 8 de tu plan</p>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(122,143,116,0.1)", border:"1px solid rgba(122,143,116,0.25)", borderRadius:999, padding:"8px 16px" }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:C.sage }} />
              <span style={{ fontSize:"0.85rem", color:C.sage, fontWeight:600 }}>Mejorando</span>
            </div>
          </div>

          {/* 4 metrics */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)" }} className="md:grid-cols-4">
            {[
              { l:"Edad de Movimiento", v:"46", u:"años", d:"−8 años" },
              { l:"Nivel Físico",        v:"3",  u:"/5",   d:"+1 nivel" },
              { l:"Adherencia",          v:"87", u:"%",    d:"+12%" },
              { l:"Racha",               v:"12", u:"días", d:"🔥" },
            ].map((m,i) => (
              <motion.div key={m.l} initial={{ opacity:0,y:12 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:0.08*i }}
                style={{ padding:"28px 24px", borderRight: i%2===0 ? `1px solid ${C.border}` : "none", borderBottom:`1px solid ${C.border}` }}>
                <p style={{ fontSize:"0.62rem", color:C.muted, textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:600, marginBottom:10 }}>{m.l}</p>
                <div style={{ display:"flex", alignItems:"flex-end", gap:4, marginBottom:6 }}>
                  <p style={{ fontSize:"2.8rem", fontWeight:900, color:C.ink, letterSpacing:"-0.03em", lineHeight:1 }}>{m.v}</p>
                  <p style={{ color:C.ink2, marginBottom:8, fontWeight:500 }}>{m.u}</p>
                </div>
                <p style={{ fontSize:"0.85rem", color:C.sage, fontWeight:700 }}>{m.d}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", borderTop:`1px solid ${C.border}` }}>
            {/* Radar */}
            <div style={{ padding:"40px", borderRight:`1px solid ${C.border}`, background:`${C.cream2}80` }}>
              <p style={{ fontSize:"0.7rem", fontWeight:700, color:C.ink, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:28 }}>Perfil de movimiento</p>
              <svg viewBox="0 0 220 200" style={{ width:"100%", maxWidth:220, margin:"0 auto", display:"block" }}>
                {[0.25,0.5,0.75,1].map((s,gi) => (
                  <polygon key={gi}
                    points={[0,1,2,3,4,5].map(j => { const a=(j*60-90)*Math.PI/180; return `${110+Math.cos(a)*85*s},${100+Math.sin(a)*75*s}`; }).join(" ")}
                    fill="none" stroke={C.border} strokeWidth="1" />
                ))}
                <polygon points="110,30 172,65 163,130 110,155 57,130 48,65"
                  fill="rgba(122,143,116,0.15)" stroke={C.sage} strokeWidth="1.5" />
                {["Movilidad","Estabilidad","Equilibrio","Fuerza","Coordinación","Técnica"].map((l,j) => {
                  const a=(j*60-90)*Math.PI/180;
                  return <text key={l} x={110+Math.cos(a)*100} y={100+Math.sin(a)*92} fontSize="9" fill={C.muted} textAnchor="middle" fontWeight="500">{l}</text>;
                })}
              </svg>
            </div>

            {/* Progress bars */}
            <div style={{ padding:"40px" }}>
              <p style={{ fontSize:"0.7rem", fontWeight:700, color:C.ink, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:28 }}>Evolución semanal</p>
              <div style={{ display:"flex", flexDirection:"column", gap:28 }}>
                {[
                  { l:"Movilidad",       curr:82, prev:74 },
                  { l:"Equilibrio",      curr:91, prev:84 },
                  { l:"Fuerza funcional",curr:70, prev:65 },
                  { l:"Coordinación",    curr:77, prev:71 },
                ].map(m => (
                  <div key={m.l}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                      <span style={{ color:C.ink2, fontSize:"0.9rem", fontWeight:500 }}>{m.l}</span>
                      <span style={{ color:C.sage, fontSize:"0.9rem", fontWeight:700 }}>+{m.curr-m.prev}%</span>
                    </div>
                    <div style={{ height:6, background:C.cream3, borderRadius:3, overflow:"hidden" }}>
                      <motion.div initial={{ width:`${m.prev}%` }} whileInView={{ width:`${m.curr}%` }} viewport={{ once:true }}
                        transition={{ duration:1, ease:[0.16,1,0.3,1] }}
                        style={{ height:"100%", background:C.sage, borderRadius:3 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
