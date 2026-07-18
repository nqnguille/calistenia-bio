"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const links = [
  { label: "Método", href: "/metodo/" },
  { label: "Cultura", href: "/cultura/" },
  { label: "Producto", href: "/#producto" },
  { label: "Ciencia", href: "/#ciencia" },
  { label: "Coaches", href: "/#coaches" },
  { label: "FAQ", href: "/#faq" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed inset-x-0 top-0 z-50 border-b transition-colors duration-200"
      style={{
        background: scrolled ? "rgba(10,10,10,0.94)" : "rgba(10,10,10,0.55)",
        borderColor: scrolled ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.08)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:h-16 md:px-6">
        <a href="/" className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center border border-cyan bg-cyan/10">
            <span className="brut-mono text-sm font-bold text-cyan">C</span>
          </span>
          <span className="brut-display text-lg tracking-wide text-chalk md:text-xl">
            CALISTENIA<span className="text-cyan">.BIO</span>
          </span>
          <span className="brut-mono hidden border border-cyan/50 px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-cyan sm:inline-block">
            demo_gratis
          </span>
        </a>

        <div className="hidden items-center md:flex">
          {links.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="brut-mono border-l border-white/10 px-4 py-2 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-chalk/60 transition-colors last:border-r hover:bg-white/[0.06] hover:text-cyan"
            >
              {item.label}
            </a>
          ))}
        </div>

        <motion.a
          href="/evaluacion"
          whileTap={{ scale: 0.97 }}
          className="brut-btn px-4 py-2 text-[0.72rem] md:px-5"
        >
          Evaluación →
        </motion.a>
      </div>
    </nav>
  );
}
