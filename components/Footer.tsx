"use client";

const cols = [
  { title: "Producto", links: ["Evaluación", "Edad de Movimiento", "Dashboard", "Coaches"] },
  { title: "Ciencia", links: ["Biomecánica", "Longevidad", "Evidencia", "FAQ"] },
  { title: "Legal", links: ["Privacidad", "Términos", "Cookies"] },
];

export function Footer() {
  return (
    <footer className="brut-concrete border-t border-white/[0.14] bg-void px-6 py-16 text-chalk">
      <div className="mx-auto max-w-6xl">
        <div className="brut-hazard h-1.5 w-full opacity-60" />

        <div className="grid gap-10 border-b border-white/[0.1] py-12 md:grid-cols-[1.1fr_1fr]">
          <div>
            <a href="/" className="inline-flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center border border-cyan bg-cyan/10">
                <span className="brut-mono text-base font-bold text-cyan">C</span>
              </span>
              <span className="brut-display text-2xl text-chalk">
                CALISTENIA<span className="text-cyan">.BIO</span>
              </span>
            </a>
            <p className="brut-mono mt-5 max-w-sm text-sm leading-6 text-cement">
              {">"} plataforma para medir, entender y mejorar la salud motora con IA_
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {cols.map((col) => (
              <div key={col.title}>
                <p className="brut-label mb-4">[{col.title}]</p>
                {col.links.map((l) => (
                  <a key={l} href="#" className="brut-mono mb-3 block text-xs uppercase tracking-[0.06em] text-chalk/45 transition hover:text-cyan">
                    {l}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="brut-mono flex flex-wrap items-center justify-between gap-4 pt-8 text-[0.68rem] uppercase tracking-[0.06em] text-chalk/30">
          <p>© 2026 CALISTENIA.bio // demo pública gratuita // producto en construcción</p>
          <p>hecho con IA // basado en evidencia // para vivir más joven</p>
        </div>
        <p className="brut-mono pt-4 text-[0.6rem] uppercase tracking-[0.06em] text-chalk/20">
          imágenes y video: Pexels // Sport O&apos;Scope · Ketut Subiyanto · Niko Twisty · Instituto Alpha Fitness
        </p>
      </div>
    </footer>
  );
}
