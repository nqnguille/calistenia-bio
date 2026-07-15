// API de evaluaciones: POST guarda el resultado completo en KV apenas se
// calcula (sin depender de que el usuario complete el email) y devuelve un
// `id` para un link permanente de consulta. Un segundo POST con ese mismo
// `id` actualiza el registro (por ejemplo, para sumar el email más tarde).
// GET ?id= devuelve un registro puntual (link no listado); GET ?token=
// (admin) lista los últimos 50.
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
const KEY_PREFIX = "eval:";

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

  const suppliedId = typeof body.id === "string" && body.id.startsWith(KEY_PREFIX) ? body.id : null;
  const key = suppliedId ?? `${KEY_PREFIX}${crypto.randomUUID()}`;

  const existingRaw = suppliedId ? await env.EVALUACIONES.get(key) : null;
  const existing = existingRaw ? JSON.parse(existingRaw) : null;

  const email = String(body.email ?? existing?.email ?? "").trim().slice(0, 120);
  const rec = {
    ts: existing?.ts ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    email,
    chronoAge: Number(body.chronoAge ?? existing?.chronoAge) || null,
    sex: (body.sex ?? existing?.sex) === "F" ? "F" : "M",
    results: (body.results as unknown) ?? existing?.results ?? {},
    maResult: (body.maResult as unknown) ?? existing?.maResult ?? null,
    plan: (body.plan as unknown) ?? existing?.plan ?? null,
    build: String(body.build ?? existing?.build ?? "").slice(0, 40),
    ua: request.headers.get("user-agent") ?? existing?.ua ?? "",
  };

  await env.EVALUACIONES.put(key, JSON.stringify(rec));

  // Avisa una sola vez, cuando el registro llega con email (no en el
  // autoguardado silencioso que ocurre apenas se calcula el resultado).
  if (env.NOTIFY_TOKEN && email && !existing?.email) {
    const age = (rec.maResult as { age?: number } | null)?.age;
    const text =
      `💪 EVALUACIÓN CALISTENIA.bio\n` +
      `📧 ${email}\n` +
      `🎂 edad real ${rec.chronoAge ?? "?"} → edad de movimiento ${age ?? "?"}`;
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

  return json({ ok: true, id: key });
};

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (id) {
    if (!id.startsWith(KEY_PREFIX)) return json({ ok: false, error: "id-invalido" }, 400);
    const raw = await env.EVALUACIONES.get(id);
    if (!raw) return json({ ok: false, error: "no-encontrado" }, 404);
    return json({ ok: true, item: JSON.parse(raw) });
  }

  if (!env.ADMIN_TOKEN || url.searchParams.get("token") !== env.ADMIN_TOKEN) {
    return json({ ok: false, error: "no-autorizado" }, 401);
  }
  const list = await env.EVALUACIONES.list({ prefix: KEY_PREFIX, limit: 1000 });
  const recent = list.keys.slice(-50);
  const items = await Promise.all(
    recent.map(async (k) => {
      try { return JSON.parse((await env.EVALUACIONES.get(k.name)) ?? "null"); } catch { return null; }
    })
  );
  return json({ ok: true, total: list.keys.length, items: items.filter(Boolean).reverse() });
};
