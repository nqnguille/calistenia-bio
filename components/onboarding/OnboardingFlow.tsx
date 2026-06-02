"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  cream: "#F8F6F2", ink: "#1B1B1B", ink2: "#3A3A3A",
  sage: "#6B7B68", muted: "#888880", border: "#E0DDD6",
  dark: "#0E1117", dark2: "#161B24", red: "#ef4444",
};

/* ─── Types ─────────────────────────────── */
type Step = "hook" | "camera" | "movement" | "calculating" | "reveal" | "save";

interface MovementTest {
  id: string;
  title: string;
  instruction: string;
  emoji: string;
  duration: number; // seconds
  hint: string;
}

const MOVEMENTS: MovementTest[] = [
  { id: "posture",  title: "Postura en reposo",   instruction: "Quedate quieto, brazos al costado, mirada al frente.", emoji: "🧍", duration: 6,  hint: "Estamos midiendo tu alineación natural" },
  { id: "arms",     title: "Movilidad de hombros", instruction: "Levantá ambos brazos sobre la cabeza, lo más alto que puedas.", emoji: "🙆", duration: 6, hint: "La movilidad del hombro es clave para la edad funcional" },
  { id: "balance",  title: "Equilibrio unipodal",  instruction: "Levantá la rodilla derecha y mantené el equilibrio.", emoji: "🦩", duration: 6, hint: "El equilibrio predice el envejecimiento neuromotor" },
];

/* ─── Helpers ────────────────────────────── */
function pad(n: number) { return String(n).padStart(2, "0"); }

function useCountdown(from: number, active: boolean, onDone: () => void) {
  const [remaining, setRemaining] = useState(from);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) { setRemaining(from); return; }
    setRemaining(from);
    ref.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { clearInterval(ref.current!); onDone(); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current!);
  }, [active, from]); // eslint-disable-line

  return remaining;
}

/* ─── Score generation (simulated) ──────── */
function generateScore(age: number): number {
  // Simulate a realistic spread around chronological age
  const offset = Math.floor(Math.random() * 18) - 4; // -4 to +14
  const raw = age + offset;
  return Math.max(22, Math.min(75, raw));
}

/* ─── Skeleton SVG overlay (simplified) ── */
function SkeletonOverlay({ detected }: { detected: boolean }) {
  const color = detected ? C.sage : "rgba(248,246,242,0.3)";
  return (
    <svg viewBox="0 0 300 480" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} aria-hidden>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {detected && (
        <motion.g filter="url(#glow)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          {/* skeleton lines */}
          {[
            [[150,65],[130,90],[120,130],[110,170]],
            [[150,65],[170,90],[180,130],[190,170]],
            [[130,90],[170,90]],
            [[150,65],[150,180]],
            [[150,180],[135,260],[130,340]],
            [[150,180],[165,260],[170,340]],
          ].map((seg, si) => seg.slice(0,-1).map(([x1,y1],pi) => {
            const [x2,y2] = seg[pi+1];
            return <line key={`${si}-${pi}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2.5" strokeLinecap="round" />;
          }))}
          {/* joints */}
          {[[150,65],[130,90],[170,90],[110,170],[190,170],[150,180],[135,260],[165,260],[130,340],[170,340]].map(([cx,cy],i) => (
            <motion.circle key={i} cx={cx} cy={cy} r={i<3?6:4} fill={color}
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i*0.05 }} />
          ))}
          {/* head */}
          <circle cx="150" cy="45" r="20" fill="none" stroke={color} strokeWidth="2" />
        </motion.g>
      )}
      {!detected && (
        <motion.text x="150" y="240" textAnchor="middle" fill="rgba(248,246,242,0.4)"
          fontSize="14" fontWeight="500" animate={{ opacity:[0.4,0.8,0.4] }} transition={{ duration:2, repeat:Infinity }}>
          Buscando tu cuerpo...
        </motion.text>
      )}
    </svg>
  );
}

/* ─── Progress dots ───────────────────── */
function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 20 : 6, height: 6, borderRadius: 3,
          background: i <= current ? C.sage : "rgba(255,255,255,0.2)",
          transition: "all 0.3s",
        }} />
      ))}
    </div>
  );
}

/* ─── STEP: HOOK ──────────────────────── */
function StepHook({ onNext }: { onNext: () => void }) {
  return (
    <motion.div key="hook" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", padding: "0 24px", gap: 32, maxWidth: 600, margin: "0 auto" }}>

      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        style={{ display:"inline-flex", alignItems:"center", gap:10, fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:C.sage }}>
        <span style={{ width:20, height:1, background:C.sage }} />CALISTENIA.bio<span style={{ width:20, height:1, background:C.sage }} />
      </motion.div>

      <motion.h1 initial={{ opacity:0, y:32 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2, ease:[0.16,1,0.3,1] }}
        style={{ fontSize:"clamp(2.2rem,5vw,3.8rem)", fontWeight:900, color:"#F8F6F2", lineHeight:0.95, letterSpacing:"-0.03em" }}>
        ¿Cuántos años tiene<br/>
        <span style={{ background:"linear-gradient(135deg,#6B7B68,#9AAF97)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
          realmente tu cuerpo?
        </span>
      </motion.h1>

      <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
        style={{ fontSize:"1.1rem", color:"rgba(248,246,242,0.6)", lineHeight:1.7, fontWeight:300, maxWidth:440 }}>
        8 de cada 10 personas descubren que su cuerpo se mueve de forma diferente a su edad real. Averiguá el tuyo en 4 minutos.
      </motion.p>

      <motion.button initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
        onClick={onNext}
        whileHover={{ scale:1.04, boxShadow:"0 20px 50px rgba(107,123,104,0.4)" }}
        whileTap={{ scale:0.97 }}
        style={{ background:C.sage, color:"#fff", fontWeight:700, fontSize:"1.1rem", padding:"18px 44px", borderRadius:999, border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:12 }}>
        Descubrirlo — es gratis
        <span style={{ fontSize:"1.2rem" }}>→</span>
      </motion.button>

      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.7 }}
        style={{ display:"flex", gap:24, flexWrap:"wrap", justifyContent:"center" }}>
        {["Sin registro previo","Solo tu cámara","Resultado inmediato"].map(t => (
          <span key={t} style={{ display:"flex", alignItems:"center", gap:6, fontSize:"0.8rem", color:"rgba(248,246,242,0.4)", fontWeight:500 }}>
            <span style={{ color:C.sage }}>✓</span>{t}
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
}

/* ─── STEP: CAMERA ───────────────────── */
function StepCamera({ videoRef, streamRef, onNext }: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  streamRef: React.MutableRefObject<MediaStream | null>;
  onNext: () => void;
}) {
  const [permission, setPermission] = useState<"idle"|"requesting"|"granted"|"denied">("idle");
  const [detected, setDetected] = useState(false);

  const requestCamera = useCallback(async () => {
    setPermission("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode:"user", width:640, height:480 } });
      // Store stream in the shared ref so StepMovement can reattach it
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; }
      setPermission("granted");
      setTimeout(() => setDetected(true), 2000);
    } catch {
      setPermission("denied");
    }
  }, [videoRef, streamRef]);

  // Auto-advance when detected
  useEffect(() => {
    if (detected) { const t = setTimeout(onNext, 1800); return () => clearTimeout(t); }
  }, [detected, onNext]);

  return (
    <motion.div key="camera" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:0 }}>

      {permission === "idle" && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", gap:28, padding:"0 24px", maxWidth:520 }}>
          <div style={{ width:72, height:72, borderRadius:"50%", background:"rgba(107,123,104,0.15)", border:`2px solid rgba(107,123,104,0.4)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem" }}>
            📷
          </div>
          <h2 style={{ fontSize:"clamp(1.8rem,4vw,2.8rem)", fontWeight:900, color:"#F8F6F2", lineHeight:0.95, letterSpacing:"-0.03em" }}>
            Activá tu cámara
          </h2>
          <p style={{ fontSize:"1rem", color:"rgba(248,246,242,0.55)", lineHeight:1.7, fontWeight:300 }}>
            Solo necesitamos verte. Nada se graba ni se almacena. La IA analiza tu movimiento en tiempo real, en tu dispositivo.
          </p>
          <button onClick={requestCamera}
            style={{ background:C.sage, color:"#fff", fontWeight:700, fontSize:"1rem", padding:"16px 40px", borderRadius:999, border:"none", cursor:"pointer" }}>
            Activar cámara →
          </button>
          <p style={{ fontSize:"0.75rem", color:"rgba(248,246,242,0.25)" }}>Tu navegador pedirá permiso. Clic en "Permitir".</p>
        </div>
      )}

      {permission === "requesting" && (
        <div style={{ textAlign:"center", color:"rgba(248,246,242,0.6)", fontSize:"1rem" }}>
          <motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:"linear" }}
            style={{ width:40, height:40, border:"3px solid rgba(107,123,104,0.2)", borderTopColor:C.sage, borderRadius:"50%", margin:"0 auto 20px" }} />
          Activando cámara...
        </div>
      )}

      {permission === "denied" && (
        <div style={{ textAlign:"center", maxWidth:420, padding:"0 24px" }}>
          <p style={{ fontSize:"3rem", marginBottom:16 }}>🚫</p>
          <h3 style={{ color:"#F8F6F2", fontSize:"1.4rem", fontWeight:700, marginBottom:12 }}>Permiso denegado</h3>
          <p style={{ color:"rgba(248,246,242,0.5)", fontSize:"0.95rem", lineHeight:1.65 }}>Habilitá el acceso a la cámara en la configuración de tu navegador e intentá de nuevo.</p>
          <button onClick={requestCamera}
            style={{ marginTop:20, background:C.sage, color:"#fff", fontWeight:700, fontSize:"0.95rem", padding:"12px 28px", borderRadius:999, border:"none", cursor:"pointer" }}>
            Intentar de nuevo
          </button>
        </div>
      )}

      {permission === "granted" && (
        <div style={{ position:"relative", width:"100%", maxWidth:480, aspectRatio:"4/3" }}>
          <video ref={videoRef} autoPlay playsInline muted
            style={{ width:"100%", height:"100%", objectFit:"cover", transform:"scaleX(-1)", borderRadius:20, display:"block" }} />
          <SkeletonOverlay detected={detected} />

          <div style={{ position:"absolute", bottom:16, left:0, right:0, textAlign:"center" }}>
            <motion.div animate={{ opacity:[0.5,1,0.5] }} transition={{ duration:1.5, repeat:Infinity }}
              style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(14,17,23,0.85)", backdropFilter:"blur(8px)", borderRadius:20, padding:"8px 16px", fontSize:"0.8rem", color:"#F8F6F2", fontWeight:500 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:detected?C.sage:"#fbbf24", flexShrink:0 }} />
              {detected ? "¡Cuerpo detectado! Comenzando..." : "Buscando tu cuerpo..."}
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ─── STEP: MOVEMENT ─────────────────── */
function StepMovement({ videoRef, streamRef, onComplete }: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  streamRef: React.MutableRefObject<MediaStream | null>;
  onComplete: (scores: number[]) => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState<"intro"|"counting"|"done">("intro");
  const [scores] = useState<number[]>([]);

  // Reattach stream to the new <video> element when this step mounts
  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [videoRef, streamRef]);

  const current = MOVEMENTS[currentIdx];

  const handleMoveDone = useCallback(() => {
    scores.push(Math.floor(Math.random() * 25) + 60); // 60-85 range
    if (currentIdx < MOVEMENTS.length - 1) {
      setPhase("intro");
      setCurrentIdx(i => i + 1);
    } else {
      onComplete(scores);
    }
  }, [currentIdx, scores, onComplete]);

  const timer = useCountdown(current.duration, phase === "counting", handleMoveDone);

  return (
    <motion.div key="movement" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ display:"flex", flexDirection:"column", height:"100%", width:"100%" }}>

      {/* Progress */}
      <div style={{ padding:"20px 24px 0", display:"flex", justifyContent:"center" }}>
        <ProgressDots current={currentIdx} total={MOVEMENTS.length} />
      </div>

      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20, padding:"16px 24px" }}>

        {/* Camera feed */}
        <div style={{ position:"relative", width:"100%", maxWidth:400, aspectRatio:"4/3" }}>
          <video ref={videoRef} autoPlay playsInline muted
            style={{ width:"100%", height:"100%", objectFit:"cover", transform:"scaleX(-1)", borderRadius:16, display:"block" }} />
          <SkeletonOverlay detected={true} />

          {/* Countdown overlay */}
          {phase === "counting" && (
            <div style={{ position:"absolute", top:12, right:12, background:"rgba(14,17,23,0.85)", borderRadius:12, padding:"8px 16px", display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:C.sage, animation:"pulse 1s infinite" }} />
              <span style={{ color:"#F8F6F2", fontWeight:700, fontFamily:"monospace", fontSize:"1rem" }}>0:{pad(timer)}</span>
            </div>
          )}

          {/* Movement number */}
          <div style={{ position:"absolute", top:12, left:12, background:"rgba(14,17,23,0.85)", borderRadius:8, padding:"4px 12px", fontSize:"0.72rem", color:C.sage, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" }}>
            {currentIdx+1}/{MOVEMENTS.length}
          </div>
        </div>

        {/* Instruction */}
        <div style={{ textAlign:"center", maxWidth:420 }}>
          <div style={{ fontSize:"2.5rem", marginBottom:8 }}>{current.emoji}</div>
          <h3 style={{ color:"#F8F6F2", fontSize:"1.4rem", fontWeight:800, letterSpacing:"-0.02em", marginBottom:8 }}>{current.title}</h3>
          <p style={{ color:"rgba(248,246,242,0.65)", fontSize:"1rem", lineHeight:1.65, fontWeight:300, marginBottom:6 }}>{current.instruction}</p>
          {phase === "counting" && (
            <p style={{ color:C.sage, fontSize:"0.8rem", fontWeight:500, fontStyle:"italic" }}>{current.hint}</p>
          )}
        </div>

        {/* CTA or auto-count */}
        {phase === "intro" && (
          <motion.button initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }}
            onClick={() => setPhase("counting")}
            whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
            style={{ background:C.sage, color:"#fff", fontWeight:700, fontSize:"1rem", padding:"14px 36px", borderRadius:999, border:"none", cursor:"pointer" }}>
            Listo →
          </motion.button>
        )}

        {phase === "counting" && (
          <div style={{ width:200, height:4, background:"rgba(255,255,255,0.1)", borderRadius:2, overflow:"hidden" }}>
            <motion.div
              initial={{ width:"100%" }}
              animate={{ width:"0%" }}
              transition={{ duration:current.duration, ease:"linear" }}
              style={{ height:"100%", background:C.sage, borderRadius:2 }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── STEP: CALCULATING ───────────────── */
function StepCalculating({ onDone }: { onDone: () => void }) {
  const steps = [
    "Procesando patrones de movimiento...",
    "Calibrando modelo biomecánico...",
    "Comparando con perfiles de referencia...",
    "Generando tu Edad de Movimiento...",
  ];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx(i => {
        if (i >= steps.length - 1) { clearInterval(t); setTimeout(onDone, 600); return i; }
        return i + 1;
      });
    }, 700);
    return () => clearInterval(t);
  }, []); // eslint-disable-line

  return (
    <motion.div key="calculating" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:32, textAlign:"center", padding:"0 24px" }}>

      {/* Animated rings */}
      <div style={{ position:"relative", width:120, height:120 }}>
        {[0,1,2].map(i => (
          <motion.div key={i}
            animate={{ scale:[1,1.3,1], opacity:[0.6,0.15,0.6] }}
            transition={{ duration:2, repeat:Infinity, delay:i*0.5, ease:"easeInOut" }}
            style={{ position:"absolute", inset:0, borderRadius:"50%", border:`2px solid ${C.sage}`, margin: i*(-16) }}
          />
        ))}
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2.5rem" }}>🧬</div>
      </div>

      <div>
        <h2 style={{ fontSize:"1.6rem", fontWeight:800, color:"#F8F6F2", marginBottom:16, letterSpacing:"-0.02em" }}>Calculando tu resultado</h2>
        <AnimatePresence mode="wait">
          <motion.p key={idx} initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-8 }}
            transition={{ duration:0.3 }}
            style={{ color:"rgba(248,246,242,0.5)", fontSize:"0.9rem", fontWeight:300 }}>
            {steps[idx]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div style={{ display:"flex", gap:6 }}>
        {steps.map((_,i) => (
          <div key={i} style={{ width:6, height:6, borderRadius:"50%", background: i<=idx ? C.sage : "rgba(255,255,255,0.15)", transition:"all 0.3s" }} />
        ))}
      </div>
    </motion.div>
  );
}

/* ─── STEP: REVEAL ───────────────────── */
function StepReveal({ movementAge, chronoAge, onNext }: { movementAge: number; chronoAge: number; onNext: () => void }) {
  const diff = movementAge - chronoAge;
  const isYounger = diff < 0;
  const isEqual = Math.abs(diff) <= 1;
  const color = isYounger ? "#4ade80" : isEqual ? C.sage : C.red;

  return (
    <motion.div key="reveal" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:28, textAlign:"center", padding:"0 24px" }}>

      <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.2 }}
        style={{ fontSize:"0.75rem", fontWeight:700, color:C.sage, letterSpacing:"0.2em", textTransform:"uppercase" }}>
        Tu resultado
      </motion.div>

      <motion.div initial={{ opacity:0,scale:0.8 }} animate={{ opacity:1,scale:1 }}
        transition={{ delay:0.4, ease:[0.16,1,0.3,1], duration:0.8 }}>
        <p style={{ fontSize:"0.85rem", color:"rgba(248,246,242,0.5)", marginBottom:4, fontWeight:500 }}>Edad de Movimiento</p>
        <motion.p
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }}
          style={{ fontSize:"clamp(5rem,15vw,8rem)", fontWeight:900, color:"#F8F6F2", lineHeight:0.9, letterSpacing:"-0.05em", filter:`drop-shadow(0 0 40px ${color}60)` }}>
          {movementAge}
        </motion.p>
        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.9 }}
          style={{ fontSize:"0.9rem", color:color, fontWeight:700, marginTop:8 }}>
          {isYounger ? `Tu cuerpo se mueve ${Math.abs(diff)} años más JOVEN que tu edad real. 🎉`
            : isEqual ? "Tu movimiento está exactamente alineado con tu edad."
            : `Tu cuerpo se mueve ${diff} años más viejo de lo que sos.`}
        </motion.p>
      </motion.div>

      {/* Comparison */}
      <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:1.1 }}
        style={{ display:"flex", gap:32, padding:"20px 32px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16 }}>
        <div style={{ textAlign:"center" }}>
          <p style={{ fontSize:"2rem", fontWeight:900, color:"rgba(248,246,242,0.3)", lineHeight:1 }}>{chronoAge}</p>
          <p style={{ fontSize:"0.7rem", color:"rgba(248,246,242,0.35)", textTransform:"uppercase", letterSpacing:"0.1em", marginTop:4 }}>Edad real</p>
        </div>
        <div style={{ width:1, background:"rgba(255,255,255,0.1)" }} />
        <div style={{ textAlign:"center" }}>
          <p style={{ fontSize:"2rem", fontWeight:900, color, lineHeight:1 }}>{movementAge}</p>
          <p style={{ fontSize:"0.7rem", color:"rgba(248,246,242,0.35)", textTransform:"uppercase", letterSpacing:"0.1em", marginTop:4 }}>Edad de mov.</p>
        </div>
      </motion.div>

      <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.3 }}
        style={{ fontSize:"0.95rem", color:"rgba(248,246,242,0.5)", lineHeight:1.7, maxWidth:380, fontWeight:300 }}>
        Este es tu punto de partida. Con práctica consistente, la mayoría reduce su Edad de Movimiento entre 3 y 9 años en 8 semanas.
      </motion.p>

      <motion.button initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:1.5 }}
        onClick={onNext}
        whileHover={{ scale:1.04, boxShadow:"0 20px 50px rgba(107,123,104,0.4)" }}
        whileTap={{ scale:0.97 }}
        style={{ background:C.sage, color:"#fff", fontWeight:700, fontSize:"1rem", padding:"16px 40px", borderRadius:999, border:"none", cursor:"pointer" }}>
        Guardar mi resultado →
      </motion.button>

      <motion.button initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.7 }}
        onClick={() => window.location.href = "/"}
        style={{ background:"transparent", border:"none", color:"rgba(248,246,242,0.3)", fontSize:"0.85rem", cursor:"pointer", fontWeight:500 }}>
        Volver al inicio
      </motion.button>
    </motion.div>
  );
}

/* ─── STEP: SAVE ──────────────────────── */
function StepSave({ movementAge }: { movementAge: number }) {
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  if (sent) {
    return (
      <motion.div initial={{ opacity:0,scale:0.95 }} animate={{ opacity:1,scale:1 }}
        style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:24, textAlign:"center", padding:"0 24px" }}>
        <motion.div animate={{ scale:[1,1.2,1] }} transition={{ duration:0.5 }}
          style={{ fontSize:"4rem" }}>🎉</motion.div>
        <h2 style={{ fontSize:"1.8rem", fontWeight:900, color:"#F8F6F2", letterSpacing:"-0.02em" }}>¡Listo!</h2>
        <p style={{ color:"rgba(248,246,242,0.55)", fontSize:"1rem", lineHeight:1.7, maxWidth:360, fontWeight:300 }}>
          Te enviamos tu resultado a <strong style={{ color:C.sage }}>{email}</strong>. En tu próxima sesión empezamos a reducir tu Edad de Movimiento.
        </p>
        <a href="/" style={{ background:C.sage, color:"#fff", fontWeight:700, fontSize:"1rem", padding:"14px 36px", borderRadius:999, textDecoration:"none" }}>
          Explorar CALISTENIA.bio →
        </a>
      </motion.div>
    );
  }

  return (
    <motion.div key="save" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:28, textAlign:"center", padding:"0 24px", maxWidth:480, margin:"0 auto" }}>

      <div>
        <p style={{ fontSize:"0.75rem", color:C.sage, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:8 }}>Guardá tu resultado</p>
        <h2 style={{ fontSize:"clamp(1.8rem,4vw,2.4rem)", fontWeight:900, color:"#F8F6F2", lineHeight:0.95, letterSpacing:"-0.03em", marginBottom:12 }}>
          Tu Edad de Movimiento es <span style={{ color:C.sage }}>{movementAge}</span>
        </h2>
        <p style={{ color:"rgba(248,246,242,0.5)", fontSize:"0.95rem", lineHeight:1.65, fontWeight:300 }}>
          Dejanos tu email para guardar el resultado y recibir tu plan personalizado para reducir tu Edad de Movimiento.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ width:"100%", display:"flex", flexDirection:"column", gap:12 }}>
        <input type="number" placeholder="Tu edad cronológica" value={age} onChange={e => setAge(e.target.value)} required min={16} max={80}
          style={{ width:"100%", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"14px 18px", color:"#F8F6F2", fontSize:"1rem", outline:"none" }} />
        <input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required
          style={{ width:"100%", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"14px 18px", color:"#F8F6F2", fontSize:"1rem", outline:"none" }} />
        <motion.button type="submit" whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
          style={{ width:"100%", background:C.sage, color:"#fff", fontWeight:700, fontSize:"1rem", padding:"16px", borderRadius:12, border:"none", cursor:"pointer" }}>
          Guardar mi resultado →
        </motion.button>
      </form>

      <p style={{ fontSize:"0.75rem", color:"rgba(248,246,242,0.2)" }}>Sin spam. Podés darte de baja cuando quieras.</p>

      <button onClick={() => window.location.href = "/"}
        style={{ background:"transparent", border:"none", color:"rgba(248,246,242,0.3)", fontSize:"0.85rem", cursor:"pointer" }}>
        Omitir por ahora
      </button>
    </motion.div>
  );
}

/* ─── MAIN FLOW ───────────────────────── */
export function OnboardingFlow() {
  const [step, setStep] = useState<Step>("hook");
  const [movementAge, setMovementAge] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // We use chronoAge=40 as default; real app would ask after reveal
  const CHRONO_AGE = 40;

  const handleMovementsComplete = useCallback((scores: number[]) => {
    setStep("calculating");
    const avg = scores.reduce((a,b) => a+b, 0) / scores.length;
    const ma = generateScore(CHRONO_AGE);
    setTimeout(() => { setMovementAge(ma); }, 100);
  }, []);

  const stepIndex = ["hook","camera","movement","calculating","reveal","save"].indexOf(step);

  return (
    <div style={{ position:"fixed", inset:0, background:C.dark, display:"flex", flexDirection:"column", overflow:"hidden" }}>

      {/* Top bar */}
      <div style={{ position:"absolute", top:0, left:0, right:0, zIndex:10, padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <a href="/" style={{ fontWeight:900, fontSize:"1.1rem", letterSpacing:"-0.03em", color:"#F8F6F2", textDecoration:"none" }}>
          CALISTENIA<span style={{ color:C.sage }}>.bio</span>
        </a>
        {step !== "hook" && step !== "reveal" && step !== "save" && (
          <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:"0.78rem", color:"rgba(248,246,242,0.35)", fontWeight:500 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:C.sage }} />
            {step === "camera" ? "Paso 1 de 3 — Cámara"
              : step === "movement" ? "Paso 2 de 3 — Evaluación"
              : step === "calculating" ? "Paso 3 de 3 — Analizando"
              : ""}
          </div>
        )}
        {step === "hook" && (
          <div style={{ fontSize:"0.75rem", color:"rgba(248,246,242,0.25)", fontWeight:500 }}>
            ~4 minutos · Sin registro
          </div>
        )}
      </div>

      {/* Step content */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", marginTop:56 }}>
        <AnimatePresence mode="wait">
          {step === "hook" && <StepHook key="hook" onNext={() => setStep("camera")} />}
          {step === "camera" && <StepCamera key="camera" videoRef={videoRef} streamRef={streamRef} onNext={() => setStep("movement")} />}
          {step === "movement" && (
            <StepMovement key="movement" videoRef={videoRef} streamRef={streamRef} onComplete={handleMovementsComplete} />
          )}
          {step === "calculating" && (
            <StepCalculating key="calculating" onDone={() => setStep("reveal")} />
          )}
          {step === "reveal" && (
            <StepReveal key="reveal" movementAge={movementAge} chronoAge={CHRONO_AGE} onNext={() => setStep("save")} />
          )}
          {step === "save" && <StepSave key="save" movementAge={movementAge} />}
        </AnimatePresence>
      </div>

      {/* Bottom progress bar */}
      {step !== "hook" && (
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:"rgba(255,255,255,0.06)" }}>
          <motion.div
            initial={{ width: `${(stepIndex/5)*100}%` }}
            animate={{ width: `${(stepIndex/5)*100}%` }}
            transition={{ duration:0.5 }}
            style={{ height:"100%", background:C.sage }} />
        </div>
      )}
    </div>
  );
}
