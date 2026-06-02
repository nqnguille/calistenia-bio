"use client";
import { motion, useScroll, useTransform } from "framer-motion";

export function Navbar() {
  const { scrollY } = useScroll();
  const shadow = useTransform(scrollY, [0, 60], ["0 0 0 rgba(0,0,0,0)", "0 1px 0 #E0DDD6"]);

  return (
    <motion.nav
      style={{ boxShadow: shadow, backgroundColor: "rgba(248,246,242,0.92)", backdropFilter: "blur(16px)" }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" style={{ color: "#1B1B1B" }} className="font-black text-xl tracking-tight">
          CALISTENIA<span style={{ color: "#6B7B68" }}>.bio</span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          {["Producto","Ciencia","Coaches","FAQ"].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`}
              style={{ color: "#3A3A3A", fontSize: "0.875rem", fontWeight: 500 }}
              className="hover:opacity-60 transition-opacity"
            >{item}</a>
          ))}
        </div>
        <motion.a href="/evaluacion"
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          style={{ background: "#1B1B1B", color: "#F8F6F2", fontSize: "0.875rem", fontWeight: 600 }}
          className="px-5 py-2.5 rounded-full cursor-pointer"
        >
          Evaluación gratis →
        </motion.a>
      </div>
    </motion.nav>
  );
}
