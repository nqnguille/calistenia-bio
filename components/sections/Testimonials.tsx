"use client";
import { motion } from "framer-motion";

const C = { cream:"#F8F6F2", ink:"#151716", sage:"#7A8F74", muted:"#8E9188", dark:"#080B0F", dark2:"#111821" };

const testimonials = [
  { quote:"Tenía 52 años y pensaba que lo que sentía era normal para la edad. La evaluación me mostró que mi cuerpo se movía como el de alguien de 64. En 4 meses bajé a 51. Por primera vez en años, subí escaleras sin pensar.", name:"Marcela R.", role:"Docente · Buenos Aires · 52 años", delta:"−13 años" },
  { quote:"Soy médico y me acerqué con escepticismo. Lo que me convenció fue la metodología: mide lo que importa, no lo que es fácil de medir. El equilibrio y la coordinación son predictores reales de longevidad.", name:"Dr. Sebastián M.", role:"Médico internista · Córdoba · 48 años", delta:"Usuario beta" },
  { quote:"Viajo mucho por trabajo. Lo que me enganchó es que funciona en cualquier lado. 4 minutos y tengo mi sesión. Llevo 6 meses sin saltear una semana de evaluación.", name:"Fernando A.", role:"Director comercial · Remoto · 44 años", delta:"26 semanas" },
  { quote:"No vengo del mundo fitness. Siempre me aburrieron los gimnasios. Esto es diferente porque el objetivo no es verme bien, es entender cómo funciona mi cuerpo. Eso sí me motiva.", name:"Lucía T.", role:"Diseñadora · Montevideo · 39 años", delta:"−6 años" },
];

export function Testimonials() {
  return (
    <section style={{ backgroundColor:C.dark, position:"relative", overflow:"hidden" }} className="py-52 px-8">
      <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(122,143,116,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(122,143,116,0.04) 1px,transparent 1px)", backgroundSize:"48px 48px", pointerEvents:"none" }} />
      <div style={{ maxWidth:1152, margin:"0 auto", position:"relative" }}>

        <div style={{ textAlign:"center", marginBottom:104 }}>
          <motion.div initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
            style={{ display:"inline-flex", alignItems:"center", gap:16, fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:C.sage, marginBottom:28 }}>
            <span style={{ width:24, height:1, background:C.sage }} />Personas reales<span style={{ width:24, height:1, background:C.sage }} />
          </motion.div>
          <motion.h2 initial={{ opacity:0,y:24 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:0.1 }}
            style={{ fontSize:"clamp(2.8rem,5vw,4.5rem)", fontWeight:900, color:C.cream, lineHeight:0.95, letterSpacing:"-0.03em" }}>
            Transformaciones de movimiento. <span style={{ color:C.muted, fontWeight:300 }}>No de apariencia.</span>
          </motion.h2>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16 }}>
          {testimonials.map((t,i) => (
            <motion.div key={t.name} initial={{ opacity:0,y:24 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:i*0.08 }}
              style={{ background:C.dark2, border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:"44px", display:"flex", flexDirection:"column", gap:24 }}>
              <p style={{ fontSize:"0.95rem", lineHeight:1.75, color:"rgba(248,246,242,0.75)", fontWeight:300, flex:1 }}>"{t.quote}"</p>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:20 }}>
                <div>
                  <p style={{ fontWeight:700, color:C.cream, fontSize:"0.9rem" }}>{t.name}</p>
                  <p style={{ color:C.muted, fontSize:"0.75rem", marginTop:2 }}>{t.role}</p>
                </div>
                <div style={{ background:"rgba(122,143,116,0.15)", border:"1px solid rgba(122,143,116,0.3)", borderRadius:999, padding:"6px 14px" }}>
                  <p style={{ fontSize:"0.75rem", color:C.sage, fontWeight:700 }}>{t.delta}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
