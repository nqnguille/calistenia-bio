"use client";
// Botón "Continuar con Google" (Sign In With Google, flujo de ID token).
// Vincula la evaluación/progreso actual (evalId) a la cuenta del usuario.
// Si el Client ID todavía no está configurado, no renderiza nada.
import { useEffect, useRef, useState } from "react";
import { GOOGLE_CLIENT_ID, type AuthUser } from "@/lib/authConfig";
import { logEvent } from "@/lib/evlog";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any;
  }
}

let gsiLoaded: Promise<void> | null = null;
function loadGsi(): Promise<void> {
  gsiLoaded ??= new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("no se pudo cargar Google Sign-In"));
    document.head.appendChild(s);
  });
  return gsiLoaded;
}

export function GoogleLogin({ evalId, onLogin }: {
  evalId: string | null;
  onLogin: (user: AuthUser, currentEvalId: string | null) => void;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const evalIdRef = useRef(evalId);
  useEffect(() => { evalIdRef.current = evalId; }, [evalId]);
  const onLoginRef = useRef(onLogin);
  useEffect(() => { onLoginRef.current = onLogin; }, [onLogin]);

  useEffect(() => {
    if (GOOGLE_CLIENT_ID.startsWith("PENDIENTE")) return;
    let alive = true;
    loadGsi()
      .then(() => {
        if (!alive || !divRef.current) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          callback: async (resp: any) => {
            try {
              const r = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential: resp.credential, evalId: evalIdRef.current ?? undefined }),
              });
              const data = await r.json();
              if (data.ok) {
                logEvent("auth", `login ok: ${data.user?.email}`);
                onLoginRef.current(data.user, data.currentEvalId ?? null);
              } else {
                setError("No pudimos iniciar sesión. Probá de nuevo.");
                logEvent("error", `auth: ${data.error}`);
              }
            } catch (err) {
              setError("No pudimos iniciar sesión. Probá de nuevo.");
              logEvent("error", `auth: ${err instanceof Error ? err.message : String(err)}`);
            }
          },
        });
        window.google.accounts.id.renderButton(divRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          locale: "es",
        });
      })
      .catch(() => setError("No se pudo cargar Google Sign-In."));
    return () => { alive = false; };
  }, []);

  if (GOOGLE_CLIENT_ID.startsWith("PENDIENTE")) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div ref={divRef} />
      {error && <p style={{ color: "#FF5A5A", fontSize: "0.8rem", fontFamily: "var(--font-mono-b)" }}>{error}</p>}
    </div>
  );
}
