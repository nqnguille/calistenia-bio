"use client";
import { motion } from "framer-motion";

const C = { cream:"#F8F6F2", cream2:"#F1EEE8", ink:"#151716", ink2:"#343A36", sage:"#7A8F74", muted:"#8E9188", border:"#DED9CE" };

const weeks = [
  { label:"Sem 1", val:54 }, { label:"Sem 4", val:51 }, { label:"Sem 8", val:48 },
  { label:"Sem 12", val:45 }, { label:"Sem 16", val:43 }, { label:"Sem 20", val:41 },
];
const W=520, H=200, PL=44, PR=16, PT=20, PB=30, MIN=38, MAX=57;
const xOf = (i:number) => PL + (i/(weeks.length-1))*(W-PL-PR);
const yOf = (v:number) => PT + ((MAX-v)/(MAX-MIN))*(H-PT-PB);
const pts = weeks.map((_,i) => ({ x:xOf(i), y:yOf(weeks[i].val) }));
const pathD = pts.map((p,i) => `${i===0?"M":"L"} ${p.x} ${p.y}`).join(" ");
const areaD = `${pathD} L ${pts[pts.length-1].x} ${H-PB} L ${pts[0].x} ${H-PB} Z`;

export function WeeklyCheckpoints() {
  return (
    <section style={{ backgroundColor:C.cream2, borderTop:`1px solid ${C.border}` }} className="py-52 px-8">
      <div style={{ maxWidth:1152, margin:"0 auto" }}>

        {/* Centered header */}
        <div style={{ textAlign:"center", marginBottom:104 }}>
          <motion.div initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
            style={{ display:"inline-flex", alignItems:"center", gap:16, fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:C.sage, marginBottom:28 }}>
            <span style={{ width:24, height:1, background:C.sage }} />Evaluaciones semanales<span style={{ width:24, height:1, background:C.sage }} />
          </motion.div>
          <motion.h2 initial={{ opacity:0,y:24 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:0.1 }}
            style={{ fontSize:"clamp(2.8rem,5vw,4.5rem)", fontWeight:900, color:C.ink, lineHeight:0.95, letterSpacing:"-0.03em", marginBottom:28 }}>
            Evolucionás. <span style={{ color:C.muted, fontWeight:300 }}>Lo medimos cada semana.</span>
          </motion.h2>
          <motion.p initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:0.2 }}
            style={{ fontSize:"1.1rem", color:C.ink2, lineHeight:1.7, fontWeight:300, maxWidth:500, margin:"0 auto" }}>
            Cada 7 días, la misma evaluación. Una nueva medición. Observás en tiempo real cómo tu cuerpo responde al movimiento.
          </motion.p>
        </div>

        {/* 2-col: bullets + chart */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:72, alignItems:"center" }}>
          <motion.div initial={{ opacity:0,x:-24 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:true }}
            style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {["Evaluación biomecánica de 5 min con webcam","Edad de Movimiento actualizada cada 7 días","Comparativa automática semana a semana","Plan ajustado en base a tu progreso real"].map((b,i) => (
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:C.sage, marginTop:9, flexShrink:0 }} />
                <span style={{ fontSize:"1.05rem", lineHeight:1.75, fontWeight:300, color:C.ink2 }}>{b}</span>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity:0,x:24 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:true }} transition={{ delay:0.15 }}
            style={{ background:"#fff", border:`1px solid ${C.border}`, borderRadius:24, padding:"44px 40px", boxShadow:"0 16px 56px rgba(27,27,27,0.07)" }}>
            <p style={{ fontSize:"0.7rem", fontWeight:600, color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>Edad de Movimiento</p>
            <p style={{ fontSize:"1.1rem", fontWeight:700, color:C.ink, marginBottom:24 }}>Progreso — 20 semanas</p>

            <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", overflow:"visible" }} aria-hidden>
              <defs>
                <linearGradient id="wc-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.sage} stopOpacity="0.18" />
                  <stop offset="100%" stopColor={C.sage} stopOpacity="0" />
                </linearGradient>
              </defs>
              {[41,45,48,51,54].map(v => (
                <g key={v}>
                  <line x1={PL} y1={yOf(v)} x2={W-PR} y2={yOf(v)} stroke={C.border} strokeWidth={1} strokeDasharray="4 4" />
                  <text x={PL-6} y={yOf(v)+4} fontSize={9} fill={C.muted} textAnchor="end" fontWeight={500}>{v}</text>
                </g>
              ))}
              {weeks.map((w,i) => (
                <text key={i} x={xOf(i)} y={H-4} fontSize={9} fill={C.muted} textAnchor="middle" fontWeight={500}>{w.label}</text>
              ))}
              <motion.path d={areaD} fill="url(#wc-grad)" initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ duration:1, delay:0.4 }} />
              <motion.path d={pathD} fill="none" stroke={C.sage} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength:0 }} whileInView={{ pathLength:1 }} viewport={{ once:true }} transition={{ duration:1.6, ease:[0.16,1,0.3,1], delay:0.3 }} />
              {pts.map((p,i) => (
                <motion.g key={i} initial={{ scale:0,opacity:0 }} whileInView={{ scale:1,opacity:1 }} viewport={{ once:true }}
                  transition={{ delay:0.5+i*0.14 }} style={{ transformOrigin:`${p.x}px ${p.y}px` }}>
                  <circle cx={p.x} cy={p.y} r={5} fill="#fff" stroke={C.sage} strokeWidth={2.5} />
                  <text x={p.x} y={p.y-10} fontSize={10} fill={C.sage} textAnchor="middle" fontWeight={700}>{weeks[i].val}</text>
                </motion.g>
              ))}
            </svg>

            <div style={{ marginTop:24, paddingTop:20, borderTop:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:"2rem", fontWeight:900, color:C.sage, letterSpacing:"-0.03em" }}>−13 años</span>
              <span style={{ fontSize:"0.9rem", color:C.muted, fontWeight:300 }}>de Edad de Movimiento en 20 semanas</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
