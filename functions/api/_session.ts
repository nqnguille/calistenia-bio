// Cookie de sesión firmada con HMAC-SHA256 (sin estado en servidor).
// Adaptado del patrón probado de Flora: mismas defensas de dominio dual
// (apex + www sirven el sitio sin redirect entre sí) y de cookies duplicadas.
const COOKIE_NAME = "cb_session";
const TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 días

export interface SessionPayload {
  sub: string; // ID estable de la cuenta de Google
  email: string;
  name?: string;
  expires: number;
}

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function b64urlEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str: string): string {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(escape(atob(b64)));
}

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return toHex(sig);
}

// calistenia.bio y www.calistenia.bio sirven el mismo sitio; sin Domain la
// cookie queda host-only y la sesión "desaparece" al cambiar de host. En
// *.pages.dev / localhost el browser rechaza Domain ajeno → condicional.
function domainAttr(hostname: string): string {
  return hostname === "calistenia.bio" || hostname.endsWith(".calistenia.bio")
    ? "; Domain=calistenia.bio"
    : "";
}

export async function createSessionCookie(payload: Omit<SessionPayload, "expires">, secret: string, hostname: string): Promise<string> {
  const expires = Date.now() + TTL_MS;
  const payloadB64 = b64urlEncode(JSON.stringify({ ...payload, expires }));
  const sig = await hmac(secret, payloadB64);
  return `${COOKIE_NAME}=${payloadB64}.${sig}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${TTL_MS / 1000}${domainAttr(hostname)}`;
}

export function clearSessionCookie(hostname: string): string[] {
  const base = `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
  const withDomain = domainAttr(hostname);
  return withDomain ? [base, `${base}${withDomain}`] : [base];
}

export async function readSession(cookieHeader: string | null, secret: string): Promise<SessionPayload | null> {
  if (!cookieHeader) return null;
  // Pueden convivir una cookie host-only vieja y una con Domain: probar todas.
  const matches = [...cookieHeader.matchAll(new RegExp(`${COOKIE_NAME}=([^;]+)`, "g"))];
  for (const match of matches) {
    const parts = match[1].split(".");
    if (parts.length !== 2) continue;
    const [payloadB64, sig] = parts;
    const expected = await hmac(secret, payloadB64);
    if (expected !== sig) continue;
    let payload: SessionPayload;
    try {
      payload = JSON.parse(b64urlDecode(payloadB64));
    } catch {
      continue;
    }
    if (Date.now() > payload.expires) continue;
    return payload;
  }
  return null;
}
