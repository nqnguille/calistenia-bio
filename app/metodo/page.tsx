import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MetodoFlora } from "@/components/metodo/MetodoFlora";

export const metadata: Metadata = {
  title: "Método FLORA — CALISTENIA.bio",
  description:
    "El sistema detrás de CalistenIA: entrenamiento con tu propio peso y alimentación consciente, organizados en cinco pilares. Fuerza, Longevidad, Orden, Recuperación y Alimentación.",
  keywords:
    "método flora, calistenia en casa, entrenamiento peso corporal, alimentación consciente, hábitos, longevidad",
  openGraph: {
    title: "Método FLORA — Cultivá tu cuerpo",
    description:
      "Cinco pilares para entrenar con tu propio peso y comer consciente. Sin fórmulas mágicas.",
    siteName: "CALISTENIA.bio",
    locale: "es_AR",
    type: "website",
  },
};

export default function MetodoPage() {
  return (
    <>
      <Navbar />
      <main>
        <MetodoFlora />
      </main>
      <Footer />
    </>
  );
}
