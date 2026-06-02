export function Footer() {
  return (
    <footer className="bg-dark border-t border-white/8 py-12 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="font-semibold text-cream tracking-tight">
            CALISTENIA<span className="text-sage">.bio</span>
          </p>
          <p className="text-muted text-xs mt-1">Construimos evidencia de que el movimiento rejuvenece.</p>
        </div>
        <div className="flex items-center gap-8 text-xs text-muted">
          <a href="#" className="hover:text-cream/60 transition-colors">Privacidad</a>
          <a href="#" className="hover:text-cream/60 transition-colors">Términos</a>
          <a href="#" className="hover:text-cream/60 transition-colors">Contacto</a>
          <span>© 2025 CALISTENIA.bio</span>
        </div>
      </div>
    </footer>
  );
}
