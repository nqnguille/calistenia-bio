// Voz del trainer (síntesis) y vocabulario de órdenes del usuario.
// La guía principal de toda la experiencia es hablada: a 2-3 metros de la
// pantalla no se lee texto chico ni se tocan botones.
import { logEvent } from "./evlog";

const speechState = { lastKey: "", lastAt: 0 };

export function warmVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener?.("voiceschanged", () => {}, { once: true });
}

// Devuelve una Promise que se resuelve cuando la locución TERMINA de decirse
// (con timeout de respaldo si el navegador no dispara onend). Crítico para no
// arrancar mediciones mientras el trainer todavía está explicando.
export function speak(text: string, opts: { key?: string; minGap?: number } = {}): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve();
    const synth = window.speechSynthesis;
    if (!synth) return resolve();
    const key = opts.key ?? text;
    const now = Date.now();
    if (key === speechState.lastKey && now - speechState.lastAt < (opts.minGap ?? 6000)) return resolve();
    speechState.lastKey = key;
    speechState.lastAt = now;
    synth.cancel();
    logEvent("voz", text.slice(0, 64));
    const u = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    const v =
      voices.find((x) => x.lang?.toLowerCase().startsWith("es-ar")) ||
      voices.find((x) => x.lang?.toLowerCase().startsWith("es-419")) ||
      voices.find((x) => x.lang?.toLowerCase().startsWith("es"));
    if (v) u.voice = v;
    u.lang = v?.lang || "es-AR";
    u.rate = 1.04;

    let done = false;
    const finish = () => { if (!done) { done = true; resolve(); } };
    u.onend = finish;
    u.onerror = finish;
    setTimeout(finish, Math.max(1800, text.length * 105));
    synth.speak(u);
  });
}

export function stopSpeaking() {
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
}

/* ─── Vocabularios de órdenes ── */
export const ADVANCE_WORDS = ["listo", "lista", "avanzar", "avanza", "continuar", "continua", "seguir", "empezar", "empeza", "dale", "vamos", "ya estoy", "termine", "terminé"];
export const SKIP_WORDS = ["saltar", "salta", "saltea", "saltealo", "no puedo", "siguiente ejercicio"];

export function matchesWords(text: string, words: string[]) {
  const t = text.toLowerCase();
  return words.some((w) => t.includes(w));
}

export function matchesAdvance(text: string) {
  return matchesWords(text, ADVANCE_WORDS);
}
