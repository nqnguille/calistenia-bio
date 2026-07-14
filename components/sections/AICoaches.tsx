"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = { cream:"#F8F6F2", cream2:"#F1EEE8", ink:"#151716", ink2:"#343A36", sage:"#7A8F74", muted:"#8E9188", border:"#DED9CE", dark:"#080B0F", dark2:"#111821" };

const coaches = [
  { id:"scientist", emoji:"🔬", name:"El Científico", style:"Preciso · Datos · Objetivo",     msg:'"Tu ángulo de dorsiflexión mejoró 8° esta semana. Eso corresponde a una reducción de 2.3 años en tu Edad de Movimiento. Protocolo ajustado."' },
  { id:"mentor",    emoji:"🧭", name:"El Mentor",    style:"Guía · Experiencia · Paciencia",  msg:'"Llevás tres semanas siendo consistente. Eso es más difícil de lo que parece. Ahora construimos sobre eso."' },
  { id:"military",  emoji:"⚡", name:"El Militar",   style:"Directo · Disciplinado · Claro",   msg:'"Dos días sin sesión. No me importa el porqué. Hoy hacés la evaluación. Sin negociación."' },
  { id:"friend",    emoji:"🤝", name:"El Amigo",     style:"Cercano · Empático · Motivador",   msg:'"¡Eso estuvo increíble! Sé que la semana estuvo pesada pero igual lo hiciste. ¿Qué tal si mañana probamos algo nuevo?"' },
  { id:"zen",       emoji:"🌿", name:"El Zen",       style:"Calmo · Presencia · Proceso",       msg:'"El cuerpo habla cuando lo escuchás. Hoy tu equilibrio mejoró sin que lo forzaras. Así funciona el cambio real."' },
];

export function AICoaches() {
  const [sel, setSel] = useState(coaches[0]);
  return (
    <section style={{ backgroundColor:C.cream, borderTop:`1px solid ${C.border}` }} className="py-52 px-8" id="coaches">
      <div style={{ maxWidth:1152, margin:"0 auto" }}>

        {/* Centered header */}
        <div style={{ textAlign:"center", marginBottom:104 }}>
          <motion.div initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
            style={{ display:"inline-flex", alignItems:"center", gap:16, fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:C.sage, marginBottom:28 }}>
            <span style={{ width:24, height:1, background:C.sage }} />Coaching con IA<span style={{ width:24, height:1, background:C.sage }} />
          </motion.div>
          <motion.h2 initial={{ opacity:0,y:24 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:0.1 }}
            style={{ fontSize:"clamp(2.8rem,5vw,4.5rem)", fontWeight:900, color:C.ink, lineHeight:0.95, letterSpacing:"-0.03em", marginBottom:28 }}>
            Misma inteligencia. <span style={{ color:C.muted, fontWeight:300 }}>Tu estilo.</span>
          </motion.h2>
          <motion.p initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:0.2 }}
            style={{ fontSize:"1.1rem", color:C.ink2, lineHeight:1.7, fontWeight:300, maxWidth:460, margin:"0 auto" }}>
            El motor de IA es el mismo para todos. Lo que cambia es la personalidad del coach. Elegís el estilo que mejor funciona para tu mente.
          </motion.p>
        </div>

        {/* 2-col: selector + preview */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:64, alignItems:"start" }}>
          <motion.div initial={{ opacity:0,x:-24 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:true }}
            style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {coaches.map(c => (
              <button key={c.id} onClick={() => setSel(c)}
                style={{ display:"flex", alignItems:"center", gap:20, padding:"16px 20px", borderRadius:16, border:`1px solid ${sel.id===c.id ? C.ink : C.border}`, background: sel.id===c.id ? C.ink : C.cream2, cursor:"pointer", textAlign:"left", transition:"all 0.2s" }}>
                <span style={{ fontSize:"1.4rem" }}>{c.emoji}</span>
                <div>
                  <p style={{ fontWeight:700, color: sel.id===c.id ? C.cream : C.ink, fontSize:"0.95rem" }}>{c.name}</p>
                  <p style={{ fontSize:"0.75rem", color: sel.id===c.id ? "rgba(248,246,242,0.5)" : C.muted, marginTop:2 }}>{c.style}</p>
                </div>
                {sel.id===c.id && <span style={{ marginLeft:"auto", color:C.sage, fontWeight:700 }}>✓</span>}
              </button>
            ))}
          </motion.div>

          <div style={{ position:"sticky", top:96 }}>
            <AnimatePresence mode="wait">
              <motion.div key={sel.id} initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-12 }} transition={{ duration:0.3 }}
                style={{ background:C.dark, borderRadius:24, padding:"36px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:24 }}>
                  <div style={{ width:48, height:48, borderRadius:"50%", background:"rgba(122,143,116,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.4rem" }}>{sel.emoji}</div>
                  <div>
                    <p style={{ color:C.cream, fontWeight:700, fontSize:"1rem" }}>{sel.name}</p>
                    <p style={{ color:C.muted, fontSize:"0.78rem", marginTop:2 }}>{sel.style}</p>
                  </div>
                </div>
                <div style={{ background:C.dark2, borderRadius:16, padding:"28px 32px" }}>
                  <p style={{ color:"rgba(248,246,242,0.75)", fontSize:"0.95rem", lineHeight:1.7, fontStyle:"italic" }}>{sel.msg}</p>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:20, fontSize:"0.75rem", color:C.muted }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:C.sage, animation:"pulse 1.5s infinite" }} />
                  Mismo motor de IA · Estilo diferente
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
