import type { Metadata, Viewport } from "next";
import { Inter, Anton, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

// Sistema brutalista: Anton para titulares condensados XXL,
// JetBrains Mono para etiquetas, datos y códigos de sección.
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono-brut",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CALISTENIA.bio — Descubrí la edad real de tu movimiento",
  description:
    "La primera evaluación física con IA usando solo tu webcam. Descubrí tu Edad de Movimiento y comenzá a rejuvenecer tu cuerpo semana a semana.",
  keywords: "edad de movimiento, evaluación física IA, salud longevidad, healthtech, calistenia",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CALISTENIA.bio",
  },
  openGraph: {
    title: "CALISTENIA.bio",
    description: "Descubrí la edad real de tu movimiento.",
    siteName: "CALISTENIA.bio",
    locale: "es_AR",
    type: "website",
  },
};

// App mobile-first: fullscreen vertical, sin zoom accidental durante el
// entrenamiento, y contenido extendido hasta los bordes (notch incluido).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#080B0F",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${anton.variable} ${jetbrains.variable} scroll-smooth`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
