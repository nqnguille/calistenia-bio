// Genera los 10 clips de voz del coach para la DEMO de coaching en vivo de la
// landing. Voz El Zen (voiceName "Manuel"), la misma que habla en el producto.
// Salida: public/audio/coach-demo/<slug>.mp3 + manifest.json.
// Correr UNA vez (los existentes se saltean). Después: scripts/normalize-voices.py
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { homedir } from "os";
import path from "path";

const VOICE_ID = "L7pBVwjueW3IPcQt4Ej9"; // El Zen / Manuel
const SETTINGS = { stability: 0.7, similarity_boost: 0.8, style: 0.15 };

const CLIPS = {
  start:     "Vamos con sentadillas. Cuando estés, empezá.",
  rep:       "Bien, seguí con control.",
  depth_ok:  "Buena profundidad.",
  depth_low: "Bajá un poco más.",
  posture:   "Pecho arriba, espalda larga.",
  breathe:   "Respirá, sin apurar.",
  rhythm:    "Ese ritmo, sostenelo.",
  five:      "Van cinco. Vas bien.",
  ten:       "Diez. Cerramos la serie.",
  onemore:   "Eso. Una más.",
};

const OUT = path.join(process.cwd(), "public/audio/coach-demo");
mkdirSync(OUT, { recursive: true });
const KEY = readFileSync(path.join(homedir(), ".config/elevenlabs/key"), "utf8").trim();

async function tts(text) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ text, model_id: "eleven_multilingual_v2", voice_settings: SETTINGS }),
  });
  if (!res.ok) throw new Error(`${res.status}: ${(await res.text()).slice(0, 200)}`);
  return Buffer.from(await res.arrayBuffer());
}

const manifest = {};
let chars = 0, generated = 0;
for (const [slug, text] of Object.entries(CLIPS)) {
  const file = path.join(OUT, `${slug}.mp3`);
  manifest[slug] = { file: `${slug}.mp3`, text };
  if (existsSync(file)) { console.log(`= ${slug} (ya existe, salteo)`); continue; }
  const buf = await tts(text);
  writeFileSync(file, buf);
  chars += text.length;
  generated++;
  console.log(`✓ ${slug} (${text.length} chars) "${text}"`);
  await new Promise((r) => setTimeout(r, 400));
}
writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`\nGenerados ${generated} clips nuevos · ${chars} caracteres ≈ ${chars} créditos`);
