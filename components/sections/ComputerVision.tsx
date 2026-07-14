"use client";
import { motion } from "framer-motion";

const C = { cream:"#F8F6F2", sage:"#7A8F74", muted:"#8E9188", border:"#DED9CE", dark:"#080B0F", dark2:"#111821", cream2:"rgba(248,246,242,0.08)" };

const detections = [
  { label:"Postura",    sub:"Alineación cervical",      score:82, icon:"⊕" },
  { label:"Equilibrio", sub:"Centro de masa estable",   score:91, icon:"◎" },
  { label:"Estabilidad",sub:"Control lumbar activo",    score:74, icon:"◈" },
  { label:"Movilidad",  sub:"Cadera 118° ROM",          score:88, icon:"◉" },
  { label:"Técnica",    sub:"Patrón de movimiento",     score:79, icon:"⊗" },
];

export function ComputerVision() {
  return (
    <section style={{ backgroundColor:C.dark, position:"relative", overflow:"hidden" }} className="py-52 px-8">
      <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)", backgroundSize:"56px 56px", pointerEvents:"none" }} />

      <div style={{ maxWidth:1152, margin:"0 auto", position:"relative" }}>

        {/* Centered header */}
        <div style={{ textAlign:"center", marginBottom:104 }}>
          <motion.div initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
            style={{ display:"inline-flex", alignItems:"center", gap:16, fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:C.sage, marginBottom:28 }}>
            <span style={{ width:24, height:1, background:C.sage }} />Visión por computadora<span style={{ width:24, height:1, background:C.sage }} />
          </motion.div>
          <motion.h2 initial={{ opacity:0,y:24 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:0.1 }}
            style={{ fontSize:"clamp(2.8rem,5vw,4.5rem)", fontWeight:900, color:"#F8F6F2", lineHeight:0.95, letterSpacing:"-0.03em", marginBottom:28 }}>
            Lo que la IA ve en tu cuerpo.
          </motion.h2>
          <motion.p initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:0.2 }}
            style={{ fontSize:"1.1rem", color:C.muted, lineHeight:1.7, fontWeight:300, maxWidth:480, margin:"0 auto" }}>
            En cada evaluación, el sistema analiza más de 30 variables biomecánicas simultáneamente. Sin contacto. Sin sensores. Solo tu webcam.
          </motion.p>
        </div>

        {/* 2-col: body scan + detections */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:64, alignItems:"start" }}>

          {/* Body scan card */}
          <motion.div initial={{ opacity:0,x:-24 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:true }}
            style={{ background:C.dark2, border:"1px solid rgba(255,255,255,0.08)", borderRadius:24, overflow:"hidden", position:"relative" }}>
            <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 30%, rgba(122,143,116,0.12) 0%, transparent 70%)", pointerEvents:"none" }} />
            <svg viewBox="0 0 300 400" style={{ width:"100%", maxHeight:360 }} aria-hidden>
              {/* Silhouette */}
              <ellipse cx="150" cy="45" rx="28" ry="32" fill="none" stroke="rgba(122,143,116,0.35)" strokeWidth="1.5" />
              <path d="M 115 75 L 95 130 L 85 190" fill="none" stroke="rgba(122,143,116,0.35)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 185 75 L 205 130 L 215 190" fill="none" stroke="rgba(122,143,116,0.35)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 115 75 L 185 75 L 190 160 L 150 175 L 110 160 Z" fill="none" stroke="rgba(122,143,116,0.35)" strokeWidth="1.5" />
              <path d="M 120 175 L 115 260 L 110 330" fill="none" stroke="rgba(122,143,116,0.35)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 180 175 L 185 260 L 190 330" fill="none" stroke="rgba(122,143,116,0.35)" strokeWidth="1.5" strokeLinecap="round" />
              {/* Landmark dots */}
              {[[150,45],[150,80],[115,78],[185,78],[85,128],[215,128],[150,175],[120,175],[180,175],[115,258],[185,258],[110,328],[190,328]].map(([cx,cy],i) => (
                <motion.circle key={i} cx={cx} cy={cy} r="4" fill="#7A8F74"
                  initial={{ scale:0,opacity:0 }} animate={{ scale:1,opacity:0.9 }}
                  transition={{ delay:0.05*i, duration:0.3 }} />
              ))}
              {/* Scan beam */}
              <motion.rect x="60" width="180" height="2" fill="#7A8F74" fillOpacity="0.5"
                initial={{ y:30 }} animate={{ y:[30,350,30], opacity:[0,0.5,0] }}
                transition={{ duration:3.5, repeat:Infinity, ease:"linear", delay:1 }} />
            </svg>
            {/* Floating badges */}
            {[
              { pos:"16px 16px auto auto", label:"Postura", val:"82%" },
              { pos:"auto auto 80px 16px", label:"ROM",     val:"118°" },
            ].map((b,i) => (
              <motion.div key={i} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.2+i*0.3 }}
                style={{ position:"absolute", top:b.pos.split(" ")[0]!=="auto"?b.pos.split(" ")[0]:undefined, right:b.pos.split(" ")[1]!=="auto"?b.pos.split(" ")[1]:undefined, bottom:b.pos.split(" ")[2]!=="auto"?b.pos.split(" ")[2]:undefined, left:b.pos.split(" ")[3]!=="auto"?b.pos.split(" ")[3]:undefined, background:"rgba(14,17,23,0.9)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"8px 14px" }}>
                <p style={{ color:C.muted, fontSize:"0.7rem" }}>{b.label}</p>
                <p style={{ color:"#F8F6F2", fontWeight:700, fontSize:"0.9rem" }}>{b.val}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Detection bars */}
          <motion.div initial={{ opacity:0,x:24 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:true }} transition={{ delay:0.15 }}
            style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {detections.map((d,i) => (
              <motion.div key={d.label} initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:0.1+i*0.08 }}
                style={{ background:C.dark2, border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:"28px 32px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <span style={{ fontSize:"1.2rem", color:C.sage }}>{d.icon}</span>
                    <div>
                      <p style={{ color:"#F8F6F2", fontWeight:600, fontSize:"0.95rem" }}>{d.label}</p>
                      <p style={{ color:C.muted, fontSize:"0.78rem", marginTop:2 }}>{d.sub}</p>
                    </div>
                  </div>
                  <span style={{ color:C.sage, fontWeight:700, fontSize:"1rem" }}>{d.score}</span>
                </div>
                <div style={{ height:5, background:"rgba(255,255,255,0.07)", borderRadius:3, overflow:"hidden" }}>
                  <motion.div initial={{ width:0 }} whileInView={{ width:`${d.score}%` }} viewport={{ once:true }}
                    transition={{ duration:0.9, ease:[0.16,1,0.3,1] }}
                    style={{ height:"100%", background:C.sage, borderRadius:3 }} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
