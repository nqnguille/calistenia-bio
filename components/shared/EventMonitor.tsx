"use client";
// Panel de diagnóstico en vivo (solo desarrollo): últimos eventos del evlog.
import { useEffect, useState } from "react";
import { IS_DEV, getEvlog, subscribeEvlog } from "@/lib/evlog";

export function EventMonitor() {
  const [, force] = useState(0);
  useEffect(() => subscribeEvlog(() => force((x) => x + 1)), []);
  if (!IS_DEV) return null;
  const last = getEvlog().slice(-7);
  if (!last.length) return null;
  return (
    <div style={{ position:"absolute", right:12, bottom:10, zIndex:30, width:330, maxWidth:"44vw", background:"rgba(0,0,0,0.7)", border:"1px solid rgba(255,255,255,0.14)", borderRadius:0, padding:"8px 10px", pointerEvents:"none" }}>
      {last.map((e, i) => (
        <p key={`${e.t}-${i}`} style={{ margin:0, fontSize:"0.6rem", lineHeight:1.5, fontFamily:"var(--font-mono-b)", color: e.tag === "error" || e.tag === "promise" ? "#FF5A5A" : "rgba(237,237,237,0.55)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
          {new Date(e.t).toLocaleTimeString("es-AR", { hour12: false })} <b style={{ color: e.tag === "error" ? "#FF5A5A" : "#00E5FF" }}>{e.tag}</b> {e.msg}
        </p>
      ))}
    </div>
  );
}
