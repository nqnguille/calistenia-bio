import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CALISTENIA.bio — Descubrí la edad real de tu movimiento",
  description:
    "La primera evaluación física con IA usando solo tu webcam. Descubrí tu Edad de Movimiento y comenzá a rejuvenecer tu cuerpo semana a semana.",
  keywords: "edad de movimiento, evaluación física IA, salud longevidad, healthtech, calistenia",
  openGraph: {
    title: "CALISTENIA.bio",
    description: "Descubrí la edad real de tu movimiento.",
    siteName: "CALISTENIA.bio",
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} scroll-smooth`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
