#!/usr/bin/env node
// Genera los clips de voz de los 5 coaches con ElevenLabs, UNA sola vez.
// Lee lib/voice-script.json (fuente única del guion), sintetiza cada línea
// por coach y escribe public/audio/voz/<coach>/<hash>.mp3 + manifest.json.
//
// Uso:
//   node scripts/generate-voices.mjs --dry-run          → cuenta créditos, no genera
//   node scripts/generate-voices.mjs                    → genera todo (salta lo ya existente)
//   node scripts/generate-voices.mjs --coach amiga      → genera solo un coach
//
// La key se lee de ~/.config/elevenlabs/key (nunca del repo).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { homedir } from "node:os";
import path from "node:path";

const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
const SCRIPT = JSON.parse(readFileSync(path.join(ROOT, "lib/voice-script.json"), "utf8"));
const OUT = path.join(ROOT, "public/audio/voz");
const DRY = process.argv.includes("--dry-run");
const onlyCoach = process.argv.includes("--coach") ? process.argv[process.argv.indexOf("--coach") + 1] : null;

const NUM_WORDS = ["", "uno","dos","tres","cuatro","cinco","seis","siete","ocho","nueve","diez","once","doce","trece","catorce","quince","dieciséis","diecisiete","dieciocho","diecinueve","veinte","veintiuno","veintidós","veintitrés","veinticuatro","veinticinco","veintiséis","veintisiete","veintiocho","veintinueve","treinta","treinta y uno","treinta y dos","treinta y tres","treinta y cuatro","treinta y cinco","treinta y seis","treinta y siete","treinta y ocho","treinta y nueve","cuarenta","cuarenta y uno","cuarenta y dos","cuarenta y tres","cuarenta y cuatro","cuarenta y cinco","cuarenta y seis","cuarenta y siete","cuarenta y ocho","cuarenta y nueve","cincuenta","cincuenta y uno","cincuenta y dos","cincuenta y tres","cincuenta y cuatro","cincuenta y cinco","cincuenta y seis","cincuenta y siete","cincuenta y ocho","cincuenta y nueve","sesenta"];

// La evaluación (experiencia de una sola vez) habla solo con la voz insignia;
// las sesiones diarias tienen los 5 coaches. Esto hace entrar todo en un
// plan Starter (30k créditos).
const EVAL_COACH = process.env.EVAL_COACH || "cientifica";

// Expande el catálogo a la lista final {key, tts}.
function expandAtoms(includeEval) {
  const lines = [];
  const a = SCRIPT.atoms;
  const [lo, hi] = a.numeros.range;
  for (let n = lo; n <= hi; n++) {
    lines.push({ key: String(n), tts: `${a.numeros.ttsPrefix}${NUM_WORDS[n]}${a.numeros.ttsSuffix}` });
  }
  const groups = ["countdown", "sesion", "series", "rangos", "instrucciones"];
  if (includeEval) groups.push("evaluacion");
  for (const grp of groups) {
    for (const item of a[grp]) lines.push({ key: item.key, tts: item.tts ?? item.key });
  }
  const ej = a.ejercicioNum;
  for (let i = 1; i <= ej.maxEjercicios; i++) {
    for (let n = Math.max(i, 2); n <= ej.maxEjercicios; n++) {
      const key = ej.template.replace("{i}", String(i)).replace("{n}", String(n));
      const tts = ej.template.replace("{i}", ej.numeros[i - 1]).replace("{n}", ej.numeros[n - 1]);
      lines.push({ key, tts });
    }
  }
  return lines;
}

function hash(key) {
  return createHash("sha1").update(key).digest("hex").slice(0, 12);
}

const coaches = SCRIPT.coaches.filter((c) => !onlyCoach || c.id === onlyCoach);
let grandTotal = 0;
for (const c of coaches) {
  const ls = expandAtoms(c.id === EVAL_COACH);
  const chars = ls.reduce((s, l) => s + l.tts.length, 0);
  grandTotal += chars;
  console.log(`${c.id}: ${ls.length} clips · ${chars.toLocaleString()} caracteres${c.id === EVAL_COACH ? " (incluye evaluación)" : ""}`);
}
console.log(`TOTAL: ${grandTotal.toLocaleString()} créditos`);

if (DRY) process.exit(0);

const KEY = readFileSync(path.join(homedir(), ".config/elevenlabs/key"), "utf8").trim();

async function tts(voiceId, text, settings) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ text, model_id: "eleven_multilingual_v2", voice_settings: settings }),
  });
  if (!res.ok) throw new Error(`${res.status}: ${(await res.text()).slice(0, 200)}`);
  return Buffer.from(await res.arrayBuffer());
}

const manifest = existsSync(path.join(OUT, "manifest.json"))
  ? JSON.parse(readFileSync(path.join(OUT, "manifest.json"), "utf8"))
  : { coaches: {} };

let generated = 0, skipped = 0, failed = 0;
for (const coach of coaches) {
  const lines = expandAtoms(coach.id === EVAL_COACH);
  const dir = path.join(OUT, coach.id);
  mkdirSync(dir, { recursive: true });
  manifest.coaches[coach.id] ??= { nombre: coach.nombre, emoji: coach.emoji, clips: {} };
  for (const line of lines) {
    const h = hash(line.key);
    const file = path.join(dir, `${h}.mp3`);
    if (existsSync(file)) { manifest.coaches[coach.id].clips[line.key] = `${coach.id}/${h}.mp3`; skipped++; continue; }
    try {
      const audio = await tts(coach.voiceId, line.tts, coach.settings);
      writeFileSync(file, audio);
      manifest.coaches[coach.id].clips[line.key] = `${coach.id}/${h}.mp3`;
      generated++;
      if (generated % 20 === 0) console.log(`  ${coach.id}: ${generated} clips…`);
      await new Promise((r) => setTimeout(r, 250)); // rate limit amable
    } catch (err) {
      failed++;
      console.error(`  FALLÓ [${coach.id}] "${line.key.slice(0, 40)}": ${err.message}`);
      if (failed > 5) { console.error("Demasiados fallos — corto acá."); process.exit(1); }
    }
  }
  writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 1));
  console.log(`✓ ${coach.id} completo`);
}
console.log(`Listo: ${generated} generados, ${skipped} ya existían, ${failed} fallidos.`);
