// API de evaluaciones: POST guarda cada resultado en KV (y avisa por el hub
// de gates-analytics si NOTIFY_TOKEN está configurado); GET con ?token= lista
// las últimas para revisión (admin).
interface KVNS {
  put(key: string, value: string): Promise<void>;
  get(key: string): Promise<string | null>;
  list(opts?: { prefix?: string; limit?: number; cursor?: string }): Promise<{ keys: { name: string }[] }>;
}

interface Env {
  EVALUACIONES: KVNS;
  ADMIN_TOKEN?: string;
  NOTIFY_TOKEN?: string;
}

const NOTIFY_URL = "https://gates-analytics.nqnguille.workers.dev/api/notify";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "json-invalido" }, 400);
  }

  const email = String(body.email ?? "").trim().slice(0, 120);
  const edad = Number(body.edad) || null;
  const movementAge = Number(body.movementAge) || null;
  const scores = Array.isArray(body.scores) ? body.scores.slice(0, 3).map(Number) : [];
  const build = String(body.build ?? "").slice(0, 40);
  if (!email.includes("@") || !movementAge) return json({ ok: false, error: "faltan-datos" }, 400);

  const ts = new Date().toISOString();
  const key = `eval:${ts}:${crypto.randomUUID().slice(0, 8)}`;
  const rec = { ts, email, edad, movementAge, scores, build, ua: request.headers.get("user-agent") ?? "" };
  await env.EVALUACIONES.put(key, JSON.stringify(rec));

  if (env.NOTIFY_TOKEN) {
    const text =
      `💪 EVALUACIÓN CALISTENIA.bio\n` +
      `📧 ${email}\n` +
      `🎂 edad real ${edad ?? "?"} → edad de movimiento ${movementAge}\n` +
      `📊 pruebas: [${scores.join(", ")}]`;
    try {
      await fetch(NOTIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, token: env.NOTIFY_TOKEN, topic: "calistenia-eval" }),
      });
    } catch {
      /* el aviso nunca bloquea el guardado */
    }
  }

  return json({ ok: true });
};

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  const url = new URL(request.url);
  if (!env.ADMIN_TOKEN || url.searchParams.get("token") !== env.ADMIN_TOKEN) {
    return json({ ok: false, error: "no-autorizado" }, 401);
  }
  const list = await env.EVALUACIONES.list({ prefix: "eval:", limit: 1000 });
  const recent = list.keys.slice(-50);
  const items = await Promise.all(
    recent.map(async (k) => {
      try { return JSON.parse((await env.EVALUACIONES.get(k.name)) ?? "null"); } catch { return null; }
    })
  );
  return json({ ok: true, total: list.keys.length, items: items.filter(Boolean).reverse() });
};
