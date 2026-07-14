"use client";
import { motion } from "framer-motion";

const C = { cream:"#F8F6F2", cream2:"#F1EEE8", ink:"#151716", ink2:"#343A36", sage:"#7A8F74", muted:"#8E9188", border:"#DED9CE", dark:"#080B0F" };

const caps = [
  { icon:"◎", n:"01", title:"Movilidad",        desc:"¿Tus articulaciones se mueven en el rango que deberían? La rigidez es silenciosa y acumulativa." },
  { icon:"⊕", n:"02", title:"Estabilidad",       desc:"El control de tu cuerpo en el espacio determina cuánto durás activo sin lesiones." },
  { icon:"◈", n:"03", title:"Equilibrio",        desc:"Indicador crítico de envejecimiento neuromotor. Se puede medir con precisión. Se puede revertir." },
  { icon:"◉", n:"04", title:"Fuerza funcional",  desc:"No la del gimnasio. La fuerza de levantarte, cargar y moverte sin esfuerzo." },
  { icon:"⊗", n:"05", title:"Coordinación",      desc:"La sincronía entre tu sistema nervioso y tu cuerpo. El primero en deteriorarse." },
];

export function Problem() {
  return (
    <section style={{ background:"linear-gradient(180deg,#F1EEE8 0%,#F8F6F2 100%)", borderTop:`1px solid ${C.border}` }} className="py-52 px-8 overflow-hidden">
      <div style={{ maxWidth:1152, margin:"0 auto" }}>

        {/* Centered header */}
        <div style={{ textAlign:"center", marginBottom:112 }}>
          <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            style={{ display:"inline-flex", alignItems:"center", gap:16, fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:C.sage, marginBottom:24 }}>
            <span style={{ width:24, height:1, background:C.sage }} />El problema<span style={{ width:24, height:1, background:C.sage }} />
          </motion.div>
          <motion.h2 initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.1 }}
            style={{ fontSize:"clamp(2.8rem,5vw,4.5rem)", fontWeight:900, color:C.ink, lineHeight:0.95, letterSpacing:"-0.03em", marginBottom:28 }}>
            Todos conocemos nuestra edad.<br/>
            <span style={{ color:C.muted, fontWeight:300 }}>Pocos conocen la edad de su cuerpo.</span>
          </motion.h2>
          <motion.p initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.2 }}
            style={{ fontSize:"1.1rem", color:C.ink2, lineHeight:1.7, fontWeight:300, maxWidth:500, margin:"0 auto" }}>
            Cinco dimensiones del movimiento determinan cómo envejece tu cuerpo. Ninguna aparece en tu historia clínica. Hasta ahora.
          </motion.p>
        </div>

        {/* Cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(190px, 1fr))", gap:18, marginBottom:112 }}>
          {caps.map((c,i) => (
            <motion.div key={c.n} initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ delay:i*0.07 }}
              className="soft-card" style={{ borderRadius:28, padding:"34px 28px", display:"flex", flexDirection:"column", gap:16, minHeight:260 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ width:46, height:46, borderRadius:16, background:"rgba(122,143,116,0.10)", color:C.sage, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.55rem" }}>{c.icon}</span>
                <span style={{ fontSize:"0.65rem", color:C.muted, fontFamily:"monospace", fontWeight:600 }}>{c.n}</span>
              </div>
              <h3 style={{ color:C.ink, fontSize:"1.22rem", fontWeight:900, letterSpacing:"-0.03em" }}>{c.title}</h3>
              <p style={{ color:C.ink2, fontSize:"0.95rem", lineHeight:1.7, fontWeight:300 }}>{c.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          className="soft-card" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:0, borderRadius:32, overflow:"hidden" }}>
          {[
            { num:"0",    desc:"de estas 5 dimensiones aparece en tu historia clínica" },
            { num:"100%", desc:"son mejorables con el estímulo y la frecuencia correctos" },
            { num:"5min", desc:"es lo que tarda nuestra evaluación completa con IA" },
          ].map(s => (
            <div key={s.num} style={{ textAlign:"center", padding:"42px 30px", borderRight:`1px solid ${C.border}` }}>
              <p style={{ fontSize:"clamp(3rem,5vw,4.5rem)", fontWeight:900, color:C.ink, letterSpacing:"-0.03em", lineHeight:1, marginBottom:12 }}>{s.num}</p>
              <p style={{ color:C.ink2, fontSize:"1rem", lineHeight:1.65 }}>{s.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
