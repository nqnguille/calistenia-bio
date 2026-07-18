"use client";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

export function Button({ children, variant = "primary", size = "md", className = "", onClick }: ButtonProps) {
  const base = "cursor-pointer select-none";

  const variants = {
    primary: "brut-btn",
    ghost:   "brut-btn-ghost",
    outline: "brut-btn-ghost",
  };

  const sizes = {
    sm: "px-5 py-2.5 text-xs",
    md: "px-7 py-3.5 text-sm",
    lg: "px-9 py-5 text-base",
  };

  return (
    <button
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
