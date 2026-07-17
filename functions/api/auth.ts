// Auth con Google (Sign In With Google, flujo de ID token):
// POST {credential, evalId?} → verifica el token, crea/actualiza la cuenta
//   (KV `user:<sub>`), vincula la evaluación actual y setea la cookie firmada.
// GET → devuelve la sesión activa + currentEvalId (para retomar el progreso
//   desde cualquier dispositivo sin el link mágico).
// DELETE → logout.
import { verifyGoogleIdToken } from "./_google";
import { createSessionCookie, clearSessionCookie, readSession } from "./_session";

interface KVNS {
  put(key: string, value: string): Promise<void>;
  get(key: string): Promise<string | null>;
}

interface Env {
  EVALUACIONES: KVNS;
  GOOGLE_CLIENT_ID?: string;
  SESSION_SECRET?: string;
}

interface UserRecord {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  createdAt: string;
  evalIds: string[];
  currentEvalId: string | null;
}

function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.GOOGLE_CLIENT_ID || env.GOOGLE_CLIENT_ID.startsWith("PENDIENTE") || !env.SESSION_SECRET) {
    return json({ ok: false, error: "login-no-configurado" }, 503);
  }

  let credential: string | undefined;
  let evalId: string | undefined;
  try {
    const body = await request.json();
    credential = body?.credential;
    evalId = typeof body?.evalId === "string" ? body.evalId : undefined;
  } catch {
    return json({ ok: false, error: "body-invalido" }, 400);
  }
  if (!credential) return json({ ok: false, error: "falta-credential" }, 400);

  let payload;
  try {
    payload = await verifyGoogleIdToken(credential, env.GOOGLE_CLIENT_ID);
  } catch (err) {
    return json({ ok: false, error: `token-invalido: ${err instanceof Error ? err.message : err}` }, 401);
  }
  const sub = payload.sub;
  if (!sub) return json({ ok: false, error: "token-sin-sub" }, 401);

  const key = `user:${sub}`;
  const existing = await env.EVALUACIONES.get(key);
  const user: UserRecord = existing
    ? JSON.parse(existing)
    : { sub, email: payload.email.toLowerCase(), name: payload.name, picture: payload.picture, createdAt: new Date().toISOString(), evalIds: [], currentEvalId: null };

  user.email = payload.email.toLowerCase();
  if (payload.name) user.name = payload.name;
  if (payload.picture) user.picture = payload.picture;

  // Vincular la evaluación/progreso actual a la cuenta.
  if (evalId && evalId.startsWith("eval:")) {
    const evalRaw = await env.EVALUACIONES.get(evalId);
    if (evalRaw) {
      if (!user.evalIds.includes(evalId)) user.evalIds.push(evalId);
      user.currentEvalId = evalId;
      const rec = JSON.parse(evalRaw);
      if (!rec.userSub) {
        rec.userSub = sub;
        if (!rec.email) rec.email = user.email;
        await env.EVALUACIONES.put(evalId, JSON.stringify(rec));
      }
    }
  }

  await env.EVALUACIONES.put(key, JSON.stringify(user));

  const hostname = new URL(request.url).hostname;
  const cookie = await createSessionCookie({ sub, email: user.email, name: user.name }, env.SESSION_SECRET, hostname);
  return json(
    { ok: true, user: { email: user.email, name: user.name, picture: user.picture }, currentEvalId: user.currentEvalId },
    200,
    { "Set-Cookie": cookie }
  );
};

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.SESSION_SECRET) return json({ ok: false, error: "login-no-configurado" }, 503);
  const session = await readSession(request.headers.get("Cookie"), env.SESSION_SECRET);
  if (!session) return json({ ok: false });
  const raw = await env.EVALUACIONES.get(`user:${session.sub}`);
  if (!raw) return json({ ok: false });
  const user: UserRecord = JSON.parse(raw);
  return json({ ok: true, user: { email: user.email, name: user.name, picture: user.picture }, currentEvalId: user.currentEvalId });
};

export const onRequestDelete = async ({ request, env }: { request: Request; env: Env }) => {
  const hostname = new URL(request.url).hostname;
  const cookies = clearSessionCookie(hostname);
  const headers = new Headers({ "Content-Type": "application/json" });
  for (const c of cookies) headers.append("Set-Cookie", c);
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};
