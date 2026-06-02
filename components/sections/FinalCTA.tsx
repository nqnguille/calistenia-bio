"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function FinalCTA() {
  return (
    <section className="relative bg-dark min-h-screen flex flex-col items-center justify-center px-6 py-32 overflow-hidden">
      {/* Ambient gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-sage/8 blur-[160px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-petrol/40 blur-[120px]" />
      </div>

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <div className="relative max-w-3xl mx-auto text-center flex flex-col items-center gap-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 text-xs font-medium text-sage tracking-widest uppercase"
        >
          <span className="w-6 h-px bg-sage" />
          CALISTENIA.bio
          <span className="w-6 h-px bg-sage" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-semibold text-cream leading-[1.02] tracking-tight">
            Tu cuerpo envejece<br />todos los días.
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="text-2xl md:text-3xl font-medium text-cream/50 leading-tight"
        >
          ¿Estás haciendo algo para rejuvenecerlo?
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Button size="lg" className="bg-cream text-ink hover:bg-cream2 px-10 py-5 text-lg">
            Descubrir mi Edad de Movimiento →
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-8 text-sm text-cream/30"
        >
          {["Evaluación gratuita", "Sin tarjeta requerida", "5 minutos"].map((t, i) => (
            <span key={t} className="flex items-center gap-2">
              {i > 0 && <span className="w-1 h-1 rounded-full bg-cream/20" />}
              {t}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
