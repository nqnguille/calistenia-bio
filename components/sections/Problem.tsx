"use client";
import { motion } from "framer-motion";

const C = { cream:"#F8F6F2", cream2:"#F1EEE8", ink:"#1B1B1B", ink2:"#3A3A3A", sage:"#6B7B68", muted:"#888880", border:"#E0DDD6" };

const caps = [
  { icon:"◎", n:"01", title:"Movilidad",        desc:"¿Tus articulaciones se mueven en el rango que deberían? La rigidez es silenciosa y acumulativa." },
  { icon:"⊕", n:"02", title:"Estabilidad",       desc:"El control de tu cuerpo en el espacio determina cuánto durás activo sin lesiones." },
  { icon:"◈", n:"03", title:"Equilibrio",        desc:"Indicador crítico de envejecimiento neuromotor. Se puede medir con precisión. Se puede revertir." },
  { icon:"◉", n:"04", title:"Fuerza funcional",  desc:"No la del gimnasio. La fuerza de levantarte, cargar y moverte sin esfuerzo." },
  { icon:"⊗", n:"05", title:"Coordinación",      desc:"La sincronía entre tu sistema nervioso y tu cuerpo. El primero en deteriorarse." },
];

export function Problem() {
  return (
    <section style={{ background:C.cream2, borderTop:`1px solid ${C.border}` }} className="py-52 px-8">
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
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:28, marginBottom:112 }}>
          {caps.map((c,i) => (
            <motion.div key={c.n} initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ delay:i*0.07 }}
              style={{ background:"#fff", border:`1px solid ${C.border}`, borderRadius:20, padding:"40px 32px", display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:"1.6rem", color:C.sage }}>{c.icon}</span>
                <span style={{ fontSize:"0.65rem", color:C.muted, fontFamily:"monospace", fontWeight:600 }}>{c.n}</span>
              </div>
              <h3 style={{ color:C.ink, fontSize:"1.05rem", fontWeight:700 }}>{c.title}</h3>
              <p style={{ color:C.ink2, fontSize:"0.9rem", lineHeight:1.65 }}>{c.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:64, borderTop:`1px solid ${C.border}`, paddingTop:60 }}>
          {[
            { num:"0",    desc:"de estas 5 dimensiones aparece en tu historia clínica" },
            { num:"100%", desc:"son mejorables con el estímulo y la frecuencia correctos" },
            { num:"5min", desc:"es lo que tarda nuestra evaluación completa con IA" },
          ].map(s => (
            <div key={s.num} style={{ textAlign:"center" }}>
              <p style={{ fontSize:"clamp(3rem,5vw,4.5rem)", fontWeight:900, color:C.ink, letterSpacing:"-0.03em", lineHeight:1, marginBottom:12 }}>{s.num}</p>
              <p style={{ color:C.ink2, fontSize:"1rem", lineHeight:1.65 }}>{s.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
