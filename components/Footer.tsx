"use client";
const C = { cream:"#F8F6F2", sage:"#7A8F74", sage2:"#AFC3A5", muted:"#8E9188", dark:"#05070A" };

const cols = [
  { title:"Producto", links:["Evaluación", "Edad de Movimiento", "Dashboard", "Coaches"] },
  { title:"Ciencia", links:["Biomecánica", "Longevidad", "Evidencia", "FAQ"] },
  { title:"Legal", links:["Privacidad", "Términos", "Cookies"] },
];

export function Footer() {
  return (
    <footer style={{ backgroundColor:C.dark, borderTop:"1px solid rgba(255,255,255,0.07)" }} className="px-6 py-16 text-cream">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 border-b border-white/[0.07] pb-12 md:grid-cols-[1.1fr_1fr]">
          <div>
            <a href="#" className="inline-flex items-center gap-3 font-black tracking-[-.04em] text-cream">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background:C.sage2 }} />
                <span className="absolute inset-1 rounded-full border" style={{ borderColor:"rgba(175,195,165,.28)" }} />
              </span>
              <span className="text-2xl">CALISTENIA<span style={{ color:C.sage2 }}>.bio</span></span>
            </a>
            <p className="mt-5 max-w-sm text-base font-light leading-7" style={{ color:C.muted }}>
              Una plataforma para medir, entender y mejorar la salud motora con IA.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {cols.map(col => (
              <div key={col.title}>
                <p className="mb-4 text-[.68rem] font-black uppercase tracking-[.16em] text-cream/28">{col.title}</p>
                {col.links.map(l => (
                  <a key={l} href="#" className="mb-3 block text-sm font-medium text-cream/44 transition hover:text-cream/80">{l}</a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 pt-8 text-sm text-cream/28">
          <p>© 2026 CALISTENIA.bio — Todos los derechos reservados</p>
          <p>Hecho con IA · Basado en evidencia · Para vivir más joven</p>
        </div>
      </div>
    </footer>
  );
}
