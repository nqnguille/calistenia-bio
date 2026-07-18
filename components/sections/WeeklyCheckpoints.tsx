"use client";
import { motion } from "framer-motion";

const CYAN = "#00E5FF";

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
    <section className="brut-sec brut-concrete relative overflow-hidden bg-concrete px-8 py-52 text-chalk">
      {/* Número de sección gigante contorneado de fondo */}
      <div className="brut-display brut-outline-text pointer-events-none absolute -left-6 top-10 select-none text-[18rem] leading-none opacity-50 max-lg:hidden" aria-hidden>
        06
      </div>

      <div className="relative mx-auto max-w-6xl">

        {/* Centered header */}
        <div className="mb-24 text-center">
          <motion.p initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
            className="brut-label mb-6">
            [SEC_06 // EVALUACIONES_SEMANALES]
          </motion.p>
          <motion.h2 initial={{ opacity:0,y:24 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:0.1 }}
            className="brut-display mb-7 text-[clamp(2.6rem,6vw,4.6rem)] text-chalk">
            Evolucionás. <span className="text-cyan">Lo medimos cada semana.</span>
          </motion.h2>
          <motion.p initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:0.2 }}
            className="mx-auto max-w-[500px] text-lg leading-7 text-chalk/70">
            Cada 7 días, la misma evaluación. Una nueva medición. Observás en tiempo real cómo tu cuerpo responde al movimiento.
          </motion.p>
        </div>

        {/* 2-col: bullets + chart */}
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div initial={{ opacity:0,x:-24 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:true }}
            className="flex flex-col">
            {["Evaluación biomecánica de 5 min con webcam","Edad de Movimiento actualizada cada 7 días","Comparativa automática semana a semana","Plan ajustado en base a tu progreso real"].map((b,i) => (
              <div key={i} className="-mt-px flex items-start gap-4 border border-white/[0.14] bg-white/[0.03] px-5 py-4 first:mt-0">
                <span className="brut-mono mt-0.5 shrink-0 text-[0.68rem] font-bold text-cyan">{String(i+1).padStart(2,"0")}</span>
                <span className="text-base leading-7 text-chalk/70">{b}</span>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity:0,x:24 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:true }} transition={{ delay:0.15 }}
            className="brut-panel-raised p-8 md:p-10">
            <p className="brut-label text-[0.62rem]">[edad_de_movimiento]</p>
            <p className="brut-mono mb-6 mt-2 text-sm font-bold uppercase tracking-[0.08em] text-chalk/60">Progreso — 20 semanas</p>

            <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" aria-hidden>
              {[41,45,48,51,54].map(v => (
                <g key={v}>
                  <line x1={PL} y1={yOf(v)} x2={W-PR} y2={yOf(v)} stroke="rgba(255,255,255,0.12)" strokeWidth={1} strokeDasharray="4 4" />
                  <text x={PL-6} y={yOf(v)+4} fontSize={9} fill="rgba(237,237,237,0.4)" textAnchor="end" fontWeight={700} fontFamily="var(--font-mono-b)">{v}</text>
                </g>
              ))}
              {weeks.map((w,i) => (
                <text key={i} x={xOf(i)} y={H-4} fontSize={9} fill="rgba(237,237,237,0.4)" textAnchor="middle" fontWeight={700} fontFamily="var(--font-mono-b)">{w.label}</text>
              ))}
              <motion.path d={areaD} fill="rgba(0,229,255,0.07)" initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ duration:1, delay:0.4 }} />
              <motion.path d={pathD} fill="none" stroke={CYAN} strokeWidth={2.5} strokeLinecap="square" strokeLinejoin="miter"
                initial={{ pathLength:0 }} whileInView={{ pathLength:1 }} viewport={{ once:true }} transition={{ duration:1.6, ease:[0.16,1,0.3,1], delay:0.3 }} />
              {pts.map((p,i) => (
                <motion.g key={i} initial={{ scale:0,opacity:0 }} whileInView={{ scale:1,opacity:1 }} viewport={{ once:true }}
                  transition={{ delay:0.5+i*0.14 }} style={{ transformOrigin:`${p.x}px ${p.y}px` }}>
                  <rect x={p.x-4} y={p.y-4} width={8} height={8} fill="#0A0A0A" stroke={CYAN} strokeWidth={2} />
                  <text x={p.x} y={p.y-10} fontSize={10} fill={CYAN} textAnchor="middle" fontWeight={700} fontFamily="var(--font-mono-b)">{weeks[i].val}</text>
                </motion.g>
              ))}
            </svg>

            <div className="mt-6 flex items-end gap-3 border-t border-white/[0.14] pt-5">
              <span className="brut-display text-4xl leading-none text-cyan">−13 años</span>
              <span className="brut-mono text-[0.72rem] font-bold uppercase tracking-[0.06em] text-chalk/45">de Edad de Movimiento en 20 semanas</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
