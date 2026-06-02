"use client";
import { motion } from "framer-motion";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

export function Button({ children, variant = "primary", size = "md", className = "", onClick }: ButtonProps) {
  const base = "inline-flex items-center justify-center font-medium tracking-tight transition-all cursor-pointer select-none rounded-full";

  const variants = {
    primary: "bg-ink text-cream hover:bg-ink2",
    ghost:   "bg-transparent text-ink border border-border hover:bg-cream2",
    outline: "bg-transparent text-cream border border-white/20 hover:bg-white/10",
  };

  const sizes = {
    sm: "px-5 py-2.5 text-sm gap-2",
    md: "px-7 py-3.5 text-base gap-2.5",
    lg: "px-9 py-4.5 text-lg gap-3",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </motion.button>
  );
}
