// Voz del trainer: clips pre-generados con voces neuronales (5 coaches) +
// fallback a la síntesis del navegador para frases dinámicas no cacheadas.
// La guía principal de toda la experiencia es hablada: a 2-3 metros de la
// pantalla no se lee texto chico ni se tocan botones.
import { logEvent } from "./evlog";

/* ─── Clips pre-generados por coach ─────── */
interface VoiceManifest {
  coaches: Record<string, { nombre: string; emoji: string; clips: Record<string, string> }>;
}

let manifest: VoiceManifest | null = null;
let manifestPromise: Promise<void> | null = null;
let currentCoach = "amiga";
let currentAudio: HTMLAudioElement | null = null;

export function loadVoiceManifest(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  manifestPromise ??= fetch("/audio/voz/manifest.json")
    .then((r) => (r.ok ? r.json() : null))
    .then((m) => {
      manifest = m;
      if (m) {
        const ids = Object.keys(m.coaches ?? {});
        logEvent("voz", `manifest: ${ids.length} coaches con clips`);
        // Si el coach elegido no tiene clips (ej. demo con una sola voz),
        // pasamos al primero disponible para que la voz premium suene.
        if (ids.length && !m.coaches[getCoach()]) setCoach(ids[0]);
      }
    })
    .catch(() => { manifest = null; });
  return manifestPromise;
}

export function availableCoaches(): Array<{ id: string; nombre: string; emoji: string }> {
  if (!manifest) return [];
  return Object.entries(manifest.coaches).map(([id, c]) => ({ id, nombre: c.nombre, emoji: c.emoji }));
}

export function setCoach(id: string) {
  currentCoach = id;
  try { localStorage.setItem("calistenia_coach", id); } catch {}
  logEvent("voz", `coach: ${id}`);
}

export function getCoach(): string {
  if (typeof window !== "undefined") {
    try { return localStorage.getItem("calistenia_coach") ?? currentCoach; } catch {}
  }
  return currentCoach;
}

function clipFor(text: string): string | null {
  const c = manifest?.coaches[getCoach()];
  return c?.clips[text.trim()] ?? null;
}

function cancelAll() {
  if (currentAudio) {
    try { currentAudio.pause(); } catch {}
    currentAudio = null;
  }
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
}

function playClip(file: string): Promise<void> {
  return new Promise((resolve) => {
    const audio = new Audio(`/audio/voz/${file}`);
    currentAudio = audio;
    let done = false;
    const finish = () => { if (!done) { done = true; if (currentAudio === audio) currentAudio = null; resolve(); } };
    audio.onended = finish;
    audio.onerror = finish;
    audio.onpause = () => { if (audio.ended === false && audio.currentTime > 0) finish(); }; // cancelado por otro speak
    setTimeout(finish, 30000);
    audio.play().catch(finish);
  });
}

/* ─── Síntesis del navegador (fallback) ─── */
export function warmVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener?.("voiceschanged", () => {}, { once: true });
}

function browserTTS(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve();
    const synth = window.speechSynthesis;
    if (!synth) return resolve();
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

/* ─── API pública ─────────────────────────── */
const speechState = { lastKey: "", lastAt: 0 };

function throttled(key: string, minGap: number): boolean {
  const now = Date.now();
  if (key === speechState.lastKey && now - speechState.lastAt < minGap) return true;
  speechState.lastKey = key;
  speechState.lastAt = now;
  return false;
}

async function sayOne(text: string): Promise<void> {
  const clip = clipFor(text);
  if (clip) return playClip(clip);
  return browserTTS(text);
}

// Devuelve una Promise que se resuelve cuando la locución TERMINA de decirse.
// Cancela cualquier locución anterior (clip o síntesis).
export function speak(text: string, opts: { key?: string; minGap?: number } = {}): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const key = opts.key ?? text;
  if (throttled(key, opts.minGap ?? 6000)) return Promise.resolve();
  cancelAll();
  logEvent("voz", text.slice(0, 64));
  return sayOne(text);
}

// Secuencia de frases (átomos): cancela lo anterior UNA vez y encadena los
// clips sin cortarse entre sí. Cada parte cae a síntesis si no tiene clip.
export async function speakSeq(parts: string[], opts: { key?: string; minGap?: number } = {}): Promise<void> {
  if (typeof window === "undefined") return;
  const joined = parts.join(" ");
  const key = opts.key ?? joined;
  if (throttled(key, opts.minGap ?? 6000)) return;
  cancelAll();
  logEvent("voz", joined.slice(0, 64));
  for (const p of parts) {
    if (!p) continue;
    await sayOne(p);
  }
}

export function stopSpeaking() {
  cancelAll();
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
