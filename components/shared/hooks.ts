"use client";
// Hooks compartidos entre la evaluación y la sesión de entrenamiento guiada.
import { useEffect, useRef, useState } from "react";
import { logEvent } from "@/lib/evlog";
import { matchesWords, ADVANCE_WORDS } from "@/lib/voice";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionCtor = new () => any;

// Reconocimiento de voz continuo: a distancia el usuario no puede tocar nada;
// puede decir "listo", "dale", etc. Se ignora mientras la app habla para que
// no se dé órdenes a sí misma por los parlantes.
export function useVoiceCommands(enabled: boolean, onAdvance: () => void, words: string[] = ADVANCE_WORDS) {
  const cbRef = useRef(onAdvance);
  useEffect(() => { cbRef.current = onAdvance; }, [onAdvance]);
  const wordsRef = useRef(words);
  useEffect(() => { wordsRef.current = words; }, [words]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const w = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;

    let alive = true;
    const rec = new Ctor();
    rec.lang = "es-AR";
    rec.continuous = true;
    rec.interimResults = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      if (window.speechSynthesis?.speaking) return;
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const text: string = e.results[i]?.[0]?.transcript ?? "";
        if (matchesWords(text, wordsRef.current)) {
          logEvent("mic", `orden reconocida: "${text.trim().slice(0, 40)}"`);
          cbRef.current();
          break;
        }
      }
    };
    rec.onend = () => { if (alive) { try { rec.start(); } catch {} } };
    rec.onerror = () => {};
    try { rec.start(); } catch {}
    return () => {
      alive = false;
      try { rec.onend = null; rec.stop(); } catch {}
    };
  }, [enabled]);
}

// Countdown sin efectos dentro del updater de setState: el onDone se dispara
// desde un efecto que observa remaining===0 (React ejecuta los updaters dos
// veces en dev y eso duplicaba avances).
export function useCountdown(from: number, active: boolean, onDone: () => void) {
  const [remaining, setRemaining] = useState(from);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const firedRef = useRef(false);
  const onDoneRef = useRef(onDone);
  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);

  useEffect(() => {
    firedRef.current = false;
    if (!active) { setRemaining(from); return; }
    setRemaining(from);
    intervalRef.current = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [active, from]);

  useEffect(() => {
    if (active && remaining === 0 && !firedRef.current) {
      firedRef.current = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      onDoneRef.current();
    }
  }, [remaining, active]);

  return remaining;
}
