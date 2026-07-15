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
  RESEND_API_KEY?: string;
}

const NOTIFY_URL = "https://gates-analytics.nqnguille.workers.dev/api/notify";
const KEY_PREFIX = "eval:";
// Remitente compartido de Resend: entrega a cualquier destinatario sin
// verificar un dominio propio. Cuando calistenia.bio tenga DNS en Cloudflare,
// cambiar por un remitente con ese dominio verificado en Resend.
const FROM_ADDRESS = "CALISTENIA.bio <onboarding@resend.dev>";

interface StoredRecord {
  chronoAge: number | null;
  maResult: { age: number | null; ci: number | null } | null;
  plan: { nivel: string; dias: number; foco: string; sesiones: { dia: string; titulo: string; ejercicios: { n: string; series: string }[] }[] } | null;
}

function planEmailHtml(rec: StoredRecord, link: string) {
  const age = rec.maResult?.age;
  const ci = rec.maResult?.ci;
  const headline = age != null
    ? `<p style="font-size:15px;color:#343A36;line-height:1.6;margin:0 0 22px">Tu Edad de Movimiento es <strong>${age} años</strong> (margen ± ${ci}), comparada con tu edad real de ${rec.chronoAge ?? "?"}.</p>`
    : `<p style="font-size:15px;color:#343A36;line-height:1.6;margin:0 0 22px">No juntamos datos suficientes para calcular una edad esta vez — mirá el detalle en el link.</p>`;

  const sesionesHtml = (rec.plan?.sesiones ?? []).map((s) => `
    <div style="margin:0 0 16px;padding:14px 16px;background:#F1EEE8;border-radius:12px">
      <p style="margin:0 0 8px;font-weight:700;color:#151716;font-size:14px">${s.dia} — ${s.titulo}</p>
      ${s.ejercicios.map((e) => `<p style="margin:2px 0;font-size:13px;color:#343A36;display:flex;justify-content:space-between"><span>${e.n}</span><strong style="margin-left:12px;white-space:nowrap">${e.series}</strong></p>`).join("")}
    </div>`).join("");

  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F8F6F2;font-family:Helvetica,Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px">
    <p style="font-weight:900;font-size:18px;color:#151716;margin:0 0 28px">CALISTENIA<span style="color:#7A8F74">.bio</span></p>
    <h1 style="font-size:22px;color:#151716;margin:0 0 16px">Tu resultado y tu plan del Método FLORA</h1>
    ${headline}
    ${rec.plan ? `<p style="font-size:13px;color:#7A8F74;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px">Bloque 1 · Nivel ${rec.plan.nivel} · ${rec.plan.dias} días/semana · Foco: ${rec.plan.foco}</p>${sesionesHtml}` : ""}
    <a href="${link.replace("/resultado/", "/sesion/")}" style="display:inline-block;margin-top:12px;background:#7A8F74;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 28px;border-radius:999px">Empezar mi primera sesión →</a>
    <p style="margin:14px 0 0"><a href="${link}" style="color:#7A8F74;font-size:13px;font-weight:700;text-decoration:none">Ver mi resultado completo →</a></p>
    <p style="font-size:12px;color:#8E9188;margin-top:32px;line-height:1.6">Es una estimación de bienestar según normas científicas publicadas, no un diagnóstico médico.</p>
  </div>
</body></html>`;
}

async function sendPlanEmail(env: Env, to: string, rec: StoredRecord, link: string) {
  if (!env.RESEND_API_KEY) return { sent: false, reason: "sin-api-key" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [to],
        subject: "Tu Edad de Movimiento y tu plan del Método FLORA",
        html: planEmailHtml(rec, link),
      }),
    });
    if (!res.ok) return { sent: false, reason: `resend-${res.status}` };
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: err instanceof Error ? err.message : String(err) };
  }
}

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
    progress: (body.progress as unknown) ?? existing?.progress ?? { sessions: [] },
    build: String(body.build ?? existing?.build ?? "").slice(0, 40),
    ua: request.headers.get("user-agent") ?? existing?.ua ?? "",
  };

  await env.EVALUACIONES.put(key, JSON.stringify(rec));

  // Avisa y manda el email UNA sola vez, cuando el registro llega con email
  // por primera vez (no en el autoguardado silencioso sin email que ocurre
  // apenas se calcula el resultado).
  let emailResult: { sent: boolean; reason?: string } | null = null;
  if (email && !existing?.email) {
    const link = `${new URL(request.url).origin}/resultado/?id=${encodeURIComponent(key)}`;
    emailResult = await sendPlanEmail(env, email, rec as StoredRecord, link);

    if (env.NOTIFY_TOKEN) {
      const age = (rec.maResult as { age?: number } | null)?.age;
      const text =
        `💪 EVALUACIÓN CALISTENIA.bio\n` +
        `📧 ${email}\n` +
        `🎂 edad real ${rec.chronoAge ?? "?"} → edad de movimiento ${age ?? "?"}\n` +
        `📨 email: ${emailResult.sent ? "enviado" : `falló (${emailResult.reason})`}`;
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
  }

  return json({ ok: true, id: key, emailSent: emailResult?.sent ?? false });
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
