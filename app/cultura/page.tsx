import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CulturaCalistenia } from "@/components/cultura/CulturaCalistenia";

export const metadata: Metadata = {
  title: "La cultura de la calistenia — CALISTENIA.bio",
  description:
    "De los parques de Nueva York al street workout en Argentina: la historia, los códigos y la escena real de la calistenia, con fuentes citadas.",
  keywords:
    "cultura calistenia, street workout, historia calistenia, street workout argentina, Wingate Park, Bartendaz, WSWCF, calistenia Neuquén",
  openGraph: {
    title: "La cultura de la calistenia",
    description: "De los parques de Nueva York a las barras de Neuquén: historia real, con fuentes.",
    siteName: "CALISTENIA.bio",
    locale: "es_AR",
    type: "website",
  },
};

export default function CulturaPage() {
  return (
    <>
      <Navbar />
      <main>
        <CulturaCalistenia />
      </main>
      <Footer />
    </>
  );
}
