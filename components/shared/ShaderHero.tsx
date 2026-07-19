"use client";
// Hero WebGL: procesa un video o una imagen de fondo en tiempo real con un
// shader de escáner biomecánico — duotono negro/cian, aberración cromática,
// scanlines, barrido, partículas y un anillo de escáner que sigue al cursor.
// Fallback robusto: si no hay WebGL o el usuario pide menos movimiento,
// muestra la versión duotono estática (fallbackSrc) sin canvas.
import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  /** Video de fondo (mp4). Si se pasa, tiene prioridad sobre imageSrc. */
  videoSrc?: string;
  /** Fuente WebM opcional (mejor compresión). */
  videoWebm?: string;
  /** Imagen de fondo original (sin tratar) para el modo estático con shader. */
  imageSrc?: string;
  /** Imagen ya tratada a duotono, para el fallback sin WebGL. */
  fallbackSrc: string;
  /** Poster del video mientras carga. */
  poster?: string;
  /** Altura mínima del hero (ej. "100svh", "72vh"). */
  minH?: string;
  /** Oscurecido extra sobre el fondo para legibilidad del texto (0..1). */
  darken?: number;
  children?: ReactNode;
  className?: string;
};

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2  uRes;
uniform vec2  uTex;
uniform float uTime;
uniform vec2  uMouse;
uniform float uHover;
uniform sampler2D uSampler;

float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }

// Encaje "cover": llena la pantalla recortando el sobrante.
vec2 coverUV(vec2 uv){
  float rA = uRes.x / uRes.y;
  float tA = uTex.x / uTex.y;
  vec2 s = rA > tA ? vec2(1.0, tA / rA) : vec2(rA / tA, 1.0);
  return (uv - 0.5) * s + 0.5;
}

float lum(vec2 uv){
  vec2 c = coverUV(uv);
  if (c.x < 0.0 || c.x > 1.0 || c.y < 0.0 || c.y > 1.0) return 0.0;
  vec3 col = texture2D(uSampler, vec2(c.x, 1.0 - c.y)).rgb;
  return dot(col, vec3(0.299, 0.587, 0.114));
}

// Rampa duotono: negro -> teal profundo -> cian -> casi blanco.
vec3 duotone(float l){
  vec3 lo  = vec3(0.012, 0.045, 0.058);
  vec3 mid = vec3(0.0,   0.52,  0.64);
  vec3 hi  = vec3(0.62,  0.97,  1.0);
  vec3 c = mix(lo, mid, smoothstep(0.0, 0.55, l));
  c = mix(c, hi, smoothstep(0.55, 1.0, l));
  return c;
}

// Capa de partículas biomecánicas a la deriva (ascendente).
float particles(vec2 uv){
  vec2 g = uv * vec2(uRes.x / uRes.y, 1.0) * 15.0;
  vec2 id = floor(g);
  vec2 f = fract(g);
  float h = hash(id);
  if (h < 0.62) return 0.0;
  vec2 p = vec2(
    0.5 + 0.35 * sin(uTime * (0.4 + h) + h * 30.0),
    fract(hash(id + 7.1) - uTime * 0.12 * (0.5 + h))
  );
  float d = length(f - p);
  return smoothstep(0.09, 0.0, d) * (0.4 + 0.6 * h);
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;

  // Aberración cromática: crece hacia los bordes y cerca del cursor.
  vec2 dir = uv - 0.5;
  float edge = dot(dir, dir);
  float ca = (0.0022 + uHover * 0.006) * (0.5 + edge * 4.0);

  float lr = lum(uv + dir * ca);
  float lg = lum(uv);
  float lb = lum(uv - dir * ca);

  vec3 col;
  col.r = duotone(lr).r;
  col.g = duotone(lg).g;
  col.b = duotone(lb).b;

  // Scanlines finas.
  float scan = 0.90 + 0.10 * sin(gl_FragCoord.y * 1.4 - uTime * 9.0);
  col *= scan;

  // Barrido brillante que recorre en vertical.
  float sweep = fract(uTime * 0.11);
  float ds = abs(uv.y - sweep);
  col += vec3(0.0, 0.55, 0.68) * smoothstep(0.05, 0.0, ds) * 0.45;

  // Partículas cian.
  col += vec3(0.0, 0.78, 0.95) * particles(uv) * 0.5;

  // Grilla técnica tenue.
  vec2 grid = abs(fract(uv * vec2(uRes.x / uRes.y, 1.0) * 22.0) - 0.5);
  float gl = smoothstep(0.48, 0.5, max(grid.x, grid.y));
  col += vec3(0.0, 0.5, 0.6) * gl * 0.05;

  // Anillo de escáner que sigue al cursor.
  float ring = abs(length((uv - uMouse) * vec2(uRes.x / uRes.y, 1.0)) - 0.13);
  col += vec3(0.0, 0.85, 1.0) * smoothstep(0.012, 0.0, ring) * uHover * 0.7;

  // Viñeta.
  col *= smoothstep(1.25, 0.35, length(dir));

  // Grano.
  col += (hash(uv * uRes + uTime) - 0.5) * 0.05;

  gl_FragColor = vec4(col, 1.0);
}
`;

function makeShader(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn("shader:", gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export function ShaderHero({
  videoSrc,
  videoWebm,
  imageSrc,
  fallbackSrc,
  poster,
  minH = "100svh",
  darken = 0.35,
  children,
  className = "",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [webglOff, setWebglOff] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setWebglOff(true); return; }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = (canvas.getContext("webgl", { antialias: false, alpha: false }) ||
      canvas.getContext("experimental-webgl", { antialias: false, alpha: false })) as WebGLRenderingContext | null;
    if (!gl) { setWebglOff(true); return; }

    const vs = makeShader(gl, gl.VERTEX_SHADER, VERT);
    const fs = makeShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { setWebglOff(true); return; }
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { setWebglOff(true); return; }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTex = gl.getUniformLocation(prog, "uTex");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");
    const uHover = gl.getUniformLocation(prog, "uHover");

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([8, 12, 14, 255]));
    gl.uniform2f(uTex, 16, 9);

    let texW = 16, texH = 9;
    const video = videoRef.current;
    let img: HTMLImageElement | null = null;
    let videoReady = false;

    if (video) {
      video.play().catch(() => {});
      const onData = () => {
        texW = video.videoWidth || 1280;
        texH = video.videoHeight || 720;
        videoReady = true;
      };
      video.addEventListener("loadeddata", onData);
      if (video.readyState >= 2) onData();
    } else if (imageSrc) {
      img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        texW = img!.naturalWidth;
        texH = img!.naturalHeight;
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img!);
        videoReady = true;
      };
      img.src = imageSrc;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    const resize = () => {
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const mouse = { x: 0.5, y: 0.5, hover: 0, target: 0 };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width;
      mouse.y = 1 - (e.clientY - r.top) / r.height;
      mouse.target = 1;
    };
    const onLeave = () => { mouse.target = 0; };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    const start = performance.now();
    let raf = 0;
    let running = true;
    const render = () => {
      if (!running) return;
      resize();
      if (video && videoReady && video.readyState >= 2 && !video.paused) {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
        try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video); } catch { /* frame no listo */ }
      }
      mouse.hover += (mouse.target - mouse.hover) * 0.08;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uTex, texW, texH);
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uHover, mouse.hover);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(render);
    };
    render();

    // Pausa cuando el hero sale de viewport (ahorro de batería).
    const io = new IntersectionObserver(([e]) => {
      running = e.isIntersecting;
      if (running) { video?.play().catch(() => {}); render(); }
      else { cancelAnimationFrame(raf); video?.pause(); }
    }, { threshold: 0.01 });
    io.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      gl.deleteTexture(tex);
      gl.deleteProgram(prog);
    };
  }, [videoSrc, videoWebm, imageSrc]);

  return (
    <div className={`relative w-full overflow-hidden bg-void ${className}`} style={{ minHeight: minH }}>
      {/* Fallback estático duotono (visible si WebGL está apagado) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${fallbackSrc})`, opacity: webglOff ? 1 : 0 }}
        aria-hidden
      />

      {!webglOff && videoSrc && (
        <video
          ref={videoRef}
          className="pointer-events-none absolute h-px w-px opacity-0"
          poster={poster}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          aria-hidden
        >
          {videoWebm && <source src={videoWebm} type="video/webm" />}
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {!webglOff && (
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
      )}

      {/* Oscurecido para legibilidad */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `linear-gradient(180deg, rgba(10,10,10,${darken * 0.7}) 0%, rgba(10,10,10,${darken * 0.4}) 45%, rgba(10,10,10,${Math.min(darken + 0.35, 0.95)}) 100%)` }}
        aria-hidden
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
