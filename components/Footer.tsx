"use client";
const C = { cream:"#F8F6F2", sage:"#6B7B68", muted:"#888880", dark:"#0E1117" };

export function Footer() {
  return (
    <footer style={{ backgroundColor:C.dark, borderTop:"1px solid rgba(255,255,255,0.06)" }} className="py-16 px-6">
      <div style={{ maxWidth:1152, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"auto 1fr auto", gap:64, alignItems:"start", borderBottom:"1px solid rgba(255,255,255,0.06)", paddingBottom:40, marginBottom:32 }}>
          <div>
            <p style={{ fontWeight:900, fontSize:"1.3rem", letterSpacing:"-0.03em", color:C.cream, marginBottom:8 }}>
              CALISTENIA<span style={{ color:C.sage }}>.bio</span>
            </p>
            <p style={{ fontSize:"0.85rem", color:C.muted, lineHeight:1.65, maxWidth:200 }}>Construimos evidencia de que el movimiento rejuvenece.</p>
          </div>
          <div />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:40 }}>
            {[
              { title:"Producto", links:["Evaluación","Dashboard","Coaches","Precios"] },
              { title:"Empresa",  links:["Nosotros","Ciencia","Blog","Prensa"] },
              { title:"Legal",    links:["Privacidad","Términos","Cookies"] },
            ].map(col => (
              <div key={col.title}>
                <p style={{ fontSize:"0.65rem", color:"rgba(248,246,242,0.3)", textTransform:"uppercase", letterSpacing:"0.12em", fontWeight:700, marginBottom:14 }}>{col.title}</p>
                {col.links.map(l => (
                  <a key={l} href="#" style={{ display:"block", fontSize:"0.85rem", color:C.muted, marginBottom:10, textDecoration:"none" }}>{l}</a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <p style={{ fontSize:"0.8rem", color:"rgba(136,136,128,0.6)" }}>© 2025 CALISTENIA.bio — Todos los derechos reservados</p>
          <p style={{ fontSize:"0.8rem", color:"rgba(136,136,128,0.6)" }}>Hecho con IA · Basado en evidencia · Para vivir más joven</p>
        </div>
      </div>
    </footer>
  );
}
