"use client";
import { motion, useScroll, useTransform } from "framer-motion";

export function Navbar() {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 80], ["rgba(248,246,242,0)", "rgba(248,246,242,0.95)"]);
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1]);

  return (
    <motion.nav
      style={{ backgroundColor: bg }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
    >
      <motion.div
        style={{ opacity: borderOpacity }}
        className="absolute bottom-0 left-0 right-0 h-px bg-border"
      />
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="font-semibold text-ink tracking-tight text-lg">
          CALISTENIA<span className="text-sage">.bio</span>
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm text-ink2">
          <a href="#product" className="hover:text-ink transition-colors">Producto</a>
          <a href="#science" className="hover:text-ink transition-colors">Ciencia</a>
          <a href="#coaches" className="hover:text-ink transition-colors">Coaches</a>
          <a href="#faq" className="hover:text-ink transition-colors">FAQ</a>
        </div>

        <motion.a
          href="#hero-cta"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-ink text-cream text-sm font-medium px-5 py-2.5 rounded-full hover:bg-ink2 transition-colors"
        >
          Hacer evaluación
        </motion.a>
      </div>
    </motion.nav>
  );
}
