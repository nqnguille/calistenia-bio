#!/usr/bin/env python3
"""Normaliza el loudness de todos los clips de voz a un objetivo uniforme
(EBU R128 two-pass: -18 LUFS integrado, true peak -1.5 dB). ElevenLabs
entrega cada clip con energía distinta (los '¡!' salen gritados, las frases
largas más bajas) — esto los empareja sin regenerar nada (gratis).

Uso: python3 scripts/normalize-voices.py [coach]   (default: todos)
Idempotente razonable: re-normalizar un clip ya normalizado lo deja igual.
"""
import json, subprocess, sys, os, tempfile, concurrent.futures

TARGET_I = "-16"
TARGET_TP = "-1.5"
TARGET_LRA = "11"

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
vozdir = os.path.join(root, "public/audio/voz")
manifest = json.load(open(os.path.join(vozdir, "manifest.json")))
coaches = [sys.argv[1]] if len(sys.argv) > 1 else list(manifest["coaches"].keys())


def measure(path):
    r = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", path, "-af", "loudnorm=print_format=json", "-f", "null", "-"],
        capture_output=True, text=True)
    s = r.stderr
    return json.loads(s[s.rfind("{"):s.rfind("}") + 1])


def normalize(path):
    m = measure(path)
    if abs(float(m["input_i"]) - float(TARGET_I)) < 1.0:
        return "ok"  # ya está en objetivo
    af = (f"loudnorm=I={TARGET_I}:TP={TARGET_TP}:LRA={TARGET_LRA}:"
          f"measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:"
          f"offset={m['target_offset']}:linear=true")
    # Temp en el MISMO directorio que el destino: os.replace no cruza filesystems.
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False, dir=os.path.dirname(path)) as tmp:
        out = tmp.name
    r = subprocess.run(
        ["ffmpeg", "-hide_banner", "-y", "-i", path, "-af", af,
         "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "128k", out],
        capture_output=True, text=True)
    if r.returncode != 0:
        os.unlink(out)
        return f"ERROR: {r.stderr[-200:]}"
    os.replace(out, path)
    return "normalizado"


for coach in coaches:
    files = sorted({v.split("/")[1] for v in manifest["coaches"][coach]["clips"].values()})
    paths = [os.path.join(vozdir, coach, f) for f in files]
    print(f"{coach}: {len(paths)} clips → objetivo {TARGET_I} LUFS")
    done = norm = err = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:
        for res in ex.map(normalize, paths):
            done += 1
            if res == "normalizado": norm += 1
            elif res.startswith("ERROR"): err += 1; print(" ", res)
            if done % 40 == 0: print(f"  {done}/{len(paths)}…")
    print(f"  listo: {norm} normalizados, {done - norm - err} ya estaban, {err} errores")
