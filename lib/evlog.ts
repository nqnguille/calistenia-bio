// Monitor de eventos compartido: registro liviano de todo lo que pasa en el
// front (errores JS, fases, voz, detección). Persistido en
// localStorage("calistenia_evlog") para poder reportar sin capturas; visible
// en pantalla en desarrollo vía <EventMonitor/>.
export const IS_DEV = process.env.NODE_ENV !== "production";

export type EvEntry = { t: number; tag: string; msg: string };

const EVLOG: EvEntry[] = [];
let subscribers: Array<() => void> = [];

export function logEvent(tag: string, msg: string) {
  EVLOG.push({ t: Date.now(), tag, msg });
  if (EVLOG.length > 300) EVLOG.splice(0, EVLOG.length - 300);
  try { localStorage.setItem("calistenia_evlog", JSON.stringify(EVLOG.slice(-120))); } catch {}
  // eslint-disable-next-line no-console
  if (IS_DEV) console.log(`[ev:${tag}]`, msg);
  subscribers.forEach((f) => f());
}

export function subscribeEvlog(fn: () => void): () => void {
  subscribers.push(fn);
  return () => { subscribers = subscribers.filter((x) => x !== fn); };
}

export function getEvlog(): EvEntry[] {
  return EVLOG;
}
