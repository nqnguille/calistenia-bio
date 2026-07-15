import type { Metadata } from "next";
import { SesionGuiada } from "@/components/sesion/SesionGuiada";

export const metadata: Metadata = {
  title: "Tu sesión de hoy — CALISTENIA.bio",
  description: "Entrená tu sesión del Método FLORA guiado por voz y cámara: la app cuenta tus repeticiones y cronometra tus descansos.",
};

export default function SesionPage() {
  return <SesionGuiada />;
}
