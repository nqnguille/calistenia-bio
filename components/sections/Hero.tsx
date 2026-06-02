"use client";
import { motion } from "framer-motion";

const C = { cream:"#F8F6F2", cream2:"#F1EEE8", ink:"#1B1B1B", ink2:"#3A3A3A", sage:"#6B7B68", muted:"#888880", border:"#E0DDD6" };

export function Hero() {
  return (
    <section style={{ background: C.cream, minHeight: "100vh", position: "relative", overflow: "hidden" }}
      className="flex flex-col">

      {/* Glow background */}
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 50% at 50% -10%, rgba(107,123,104,0.12) 0%, transparent 70%)", pointerEvents:"none" }} />
      {/* Dot grid */}
      <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle, rgba(107,123,104,0.18) 1px, transparent 1px)", backgroundSize:"44px 44px", pointerEvents:"none", opacity:0.7 }} />

      {/* Main content — centered */}
      <div className="relative flex-1 flex flex-col items-center justify-center text-center px-6 pt-28 pb-20">
        <div style={{ maxWidth: 760, width:"100%" }} className="flex flex-col items-center gap-8">

          {/* Tag */}
          <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
            style={{ display:"inline-flex", alignItems:"center", gap:16, fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:C.sage }}>
            <span style={{ width:24, height:1, background:C.sage, flexShrink:0 }} />
            Healthtech · IA · Longevidad
            <span style={{ width:24, height:1, background:C.sage, flexShrink:0 }} />
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity:0, y:32 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.9, ease:[0.16,1,0.3,1], delay:0.1 }}
            style={{ fontSize:"clamp(3rem,7vw,6rem)", fontWeight:900, color:C.ink, lineHeight:0.93, letterSpacing:"-0.04em", textAlign:"center" }}>
            Descubrí la edad real<br/>
            de tu <span style={{ background:"linear-gradient(135deg,#6B7B68,#9AAF97)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>movimiento.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.22 }}
            style={{ fontSize:"1.2rem", color:C.ink2, lineHeight:1.7, fontWeight:300, maxWidth:520, textAlign:"center" }}>
            La primera evaluación física con IA usando solo tu webcam. Conocé cuánto envejece —o rejuvenece— tu cuerpo, semana a semana.
          </motion.p>

          {/* CTA */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.35 }}
            className="flex flex-col sm:flex-row items-center gap-4" id="cta">
            <motion.a href="#"
              whileHover={{ scale:1.04, boxShadow:"0 20px 50px rgba(27,27,27,0.22)" }} whileTap={{ scale:0.97 }}
              style={{ background:C.ink, color:C.cream, fontWeight:700, fontSize:"1.05rem", padding:"16px 36px", borderRadius:999, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:16 }}>
              Hacer evaluación gratuita <span style={{ color:C.sage }}>→</span>
            </motion.a>
            <span style={{ color:C.muted, fontSize:"0.9rem", fontWeight:500, cursor:"pointer" }}>Ver cómo funciona ↓</span>
          </motion.div>

          {/* Trust pills */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
            className="flex flex-wrap justify-center gap-2">
            {["5 minutos","Solo webcam","Sin tarjeta","IA personalizada"].map(t => (
              <span key={t} style={{ background:"#fff", border:`1px solid ${C.border}`, color:C.ink2, fontSize:"0.8rem", fontWeight:600, padding:"8px 16px", borderRadius:999, display:"inline-flex", alignItems:"center", gap:8 }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:C.sage, flexShrink:0 }} />{t}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Dashboard preview card — centered below */}
        <motion.div initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:1, ease:[0.16,1,0.3,1], delay:0.5 }}
          style={{ maxWidth:680, width:"100%", marginTop:80 }}>

          <div style={{ background:"#fff", border:`1px solid ${C.border}`, borderRadius:24, boxShadow:"0 24px 80px rgba(27,27,27,0.1)", overflow:"hidden" }}>
            {/* Card header */}
            <div style={{ background:C.cream2, borderBottom:`1px solid ${C.border}`, padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", gap:6 }}>
                {["#fca5a5","#fde68a","#86efac"].map(c => <div key={c} style={{ width:10, height:10, borderRadius:"50%", background:c }} />)}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, color:C.muted, fontSize:"0.72rem", fontFamily:"monospace", fontWeight:500 }}>
                <motion.div animate={{ opacity:[1,0.2,1] }} transition={{ duration:1.8, repeat:Infinity }}
                  style={{ width:7, height:7, borderRadius:"50%", background:C.sage }} />
                Analizando movimiento...
              </div>
              <div style={{ width:60 }} />
            </div>

            {/* Metrics row */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)" }}>
              {[
                { l:"Edad de Movimiento", v:"54", u:"años", c:"#ef4444", delta:"Tu línea base" },
                { l:"Movilidad",          v:"74", u:"%",   c:C.sage,    delta:"Buena" },
                { l:"Equilibrio",         v:"91", u:"%",   c:C.sage,    delta:"Excelente" },
                { l:"Adherencia",         v:"87", u:"%",   c:C.sage,    delta:"+12% sem." },
              ].map((m,i) => (
                <div key={m.l} style={{ padding:"24px 16px", borderRight: i<3 ? `1px solid ${C.border}` : "none", textAlign:"center" }}>
                  <p style={{ fontSize:"2rem", fontWeight:900, color:m.c, lineHeight:1 }}>
                    {m.v}<span style={{ fontSize:"0.7rem", color:C.muted, fontWeight:500, marginLeft:2 }}>{m.u}</span>
                  </p>
                  <p style={{ fontSize:"0.6rem", color:C.muted, textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:700, marginTop:4 }}>{m.l}</p>
                  <p style={{ fontSize:"0.72rem", color:m.c, fontWeight:600, marginTop:2 }}>{m.delta}</p>
                </div>
              ))}
            </div>

            {/* Progress bar row */}
            <div style={{ padding:"20px 28px", borderTop:`1px solid ${C.border}`, background:C.cream, display:"flex", flexDirection:"column", gap:16 }}>
              {[{ l:"Semana 1 → Semana 8", from:54, to:46 }].map(b => (
                <div key={b.l}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontSize:"0.8rem", color:C.ink2, fontWeight:500 }}>{b.l}</span>
                    <span style={{ fontSize:"0.8rem", color:C.sage, fontWeight:700 }}>−8 años de Edad de Movimiento</span>
                  </div>
                  <div style={{ height:6, background:C.border, borderRadius:3 }}>
                    <motion.div initial={{ width:"90%" }} animate={{ width:"60%" }}
                      transition={{ duration:2, delay:1.2, ease:[0.16,1,0.3,1] }}
                      style={{ height:"100%", background:C.sage, borderRadius:3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:2 }}
        style={{ display:"flex", justifyContent:"center", paddingBottom:32 }}>
        <motion.div animate={{ y:[0,8,0] }} transition={{ duration:2.5, repeat:Infinity }}
          style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:"0.6rem", color:C.muted, letterSpacing:"0.2em", textTransform:"uppercase", fontWeight:700 }}>Scroll</span>
          <div style={{ width:1, height:32, background:`linear-gradient(to bottom, ${C.muted}60, transparent)` }} />
        </motion.div>
      </motion.div>
    </section>
  );
}
