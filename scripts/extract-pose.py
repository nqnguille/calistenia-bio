#!/usr/bin/env python3
# Pre-calcula los landmarks de pose de un video, cuadro a cuadro, con el modelo
# pesado de MediaPipe (offline, máxima calidad) → JSON que el ZoomReader
# reproduce sincronizado al video, sin inferencia en vivo (cero lag / cero CPU).
#
# Requiere (en un venv, por PEP 668):
#   python3 -m venv venv && venv/bin/pip install mediapipe opencv-python-headless
#   apt install libgles2 libegl1 libgl1-mesa-dri   # runtime GL para MediaPipe
#   modelo: pose_landmarker_heavy.task de
#   https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task
#
# Uso: python extract-pose.py <video.mp4> <modelo.task> <salida.json>
import sys, json, os, cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

video_path, model_path, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
opts = vision.PoseLandmarkerOptions(
    base_options=python.BaseOptions(model_asset_path=model_path),
    running_mode=vision.RunningMode.VIDEO,
    min_pose_detection_confidence=0.4, min_tracking_confidence=0.4, num_poses=1,
)
landmarker = vision.PoseLandmarker.create_from_options(opts)

cap = cv2.VideoCapture(video_path)
fps = cap.get(cv2.CAP_PROP_FPS)
frames, det, i = [], 0, 0
while True:
    ok, img = cap.read()
    if not ok:
        break
    mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    res = landmarker.detect_for_video(mp_img, int(i * 1000.0 / fps))
    if res.pose_landmarks:
        det += 1
        frames.append([[round(l.x, 4), round(l.y, 4), round(l.z, 3), round(l.visibility, 3)]
                       for l in res.pose_landmarks[0]])
    else:
        frames.append(None)
    i += 1
cap.release()
landmarker.close()
json.dump({"fps": round(fps, 3), "count": len(frames), "frames": frames},
          open(out_path, "w"), separators=(",", ":"))
print(f"fps={fps} frames={len(frames)} detectados={det} · {os.path.getsize(out_path)//1024} KB")
