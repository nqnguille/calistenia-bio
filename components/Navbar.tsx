"use client";
import { motion, useScroll, useTransform } from "framer-motion";

const links = [
  { label: "Método", href: "/metodo/" },
  { label: "Cultura", href: "/cultura/" },
  { label: "Producto", href: "/#producto" },
  { label: "Ciencia", href: "/#ciencia" },
  { label: "Coaches", href: "/#coaches" },
  { label: "FAQ", href: "/#faq" },
];

export function Navbar() {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 80], ["rgba(8,11,15,0.18)", "rgba(248,246,242,0.88)"]);
  const border = useTransform(scrollY, [0, 80], ["rgba(255,255,255,0.08)", "rgba(222,217,206,0.92)"]);
  const color = useTransform(scrollY, [0, 80], ["#F8F6F2", "#151716"]);
  const muted = useTransform(scrollY, [0, 80], ["rgba(248,246,242,0.62)", "rgba(52,58,54,0.76)"]);
  const ctaBg = useTransform(scrollY, [0, 80], ["rgba(248,246,242,0.96)", "rgba(21,23,22,0.96)"]);
  const ctaColor = useTransform(scrollY, [0, 80], ["#151716", "#F8F6F2"]);

  return (
    <motion.nav
      style={{ backgroundColor: bg, borderColor: border, backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)" }}
      className="fixed left-1/2 top-3 z-50 w-[calc(100%-24px)] max-w-6xl -translate-x-1/2 rounded-full border"
    >
      <div className="flex h-14 items-center justify-between px-4 md:h-16 md:px-5">
        <motion.a href="#" style={{ color }} className="flex items-center gap-3 font-black tracking-[-0.04em]">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-current/15 bg-current/[0.04]">
            <span className="h-2.5 w-2.5 rounded-full bg-sage" />
            <span className="absolute inset-1 rounded-full border border-sage/30" />
          </span>
          <span className="text-lg md:text-xl">CALISTENIA<span className="text-sage">.bio</span></span>
        </motion.a>

        <div className="hidden items-center gap-1 rounded-full border border-current/10 bg-white/[0.035] p-1 md:flex">
          {links.map((item) => (
            <motion.a
              key={item.href}
              href={item.href}
              style={{ color: muted }}
              className="rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/10"
            >
              {item.label}
            </motion.a>
          ))}
        </div>

        <motion.a
          href="/evaluacion"
          whileHover={{ scale: 1.035 }}
          whileTap={{ scale: 0.98 }}
          style={{ backgroundColor: ctaBg, color: ctaColor }}
          className="rounded-full px-4 py-2.5 text-sm font-black shadow-[0_12px_38px_rgba(0,0,0,0.14)] md:px-5"
        >
          Evaluación gratis →
        </motion.a>
      </div>
    </motion.nav>
  );
}
