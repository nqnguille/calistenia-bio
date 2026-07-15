import type { Metadata } from "next";
import { ResultadoView } from "@/components/resultado/ResultadoView";

export const metadata: Metadata = {
  title: "Tu resultado — CALISTENIA.bio",
  description: "Consultá tu Edad de Movimiento y tu plan del Método FLORA.",
};

export default function ResultadoPage() {
  return <ResultadoView />;
}
