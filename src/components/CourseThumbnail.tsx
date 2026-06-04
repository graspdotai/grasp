"use client";

import { useEffect, useRef } from "react";

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const PALETTES = [
  ["#1e3a5f", "#2563eb", "#60a5fa", "#93c5fd"],
  ["#1a1a2e", "#7c3aed", "#a78bfa", "#c4b5fd"],
  ["#0d2818", "#059669", "#34d399", "#6ee7b7"],
  ["#2d1b00", "#d97706", "#fbbf24", "#fde68a"],
  ["#1e1b2e", "#db2777", "#f472b6", "#fbcfe8"],
];

const PATTERNS = ["mesh", "waves", "grid", "radial"] as const;
type Pattern = (typeof PATTERNS)[number];

function getConfig(title: string) {
  const h = hash(title);
  const r = rng(h);
  return {
    pattern: PATTERNS[h % PATTERNS.length] as Pattern,
    palette: PALETTES[Math.floor(r() * PALETTES.length)],
    seed: h,
  };
}

function drawMesh(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  palette: string[],
  seed: number,
) {
  const r = rng(seed);
  const pts = Array.from({ length: 36 }, () => ({
    x: r() * w,
    y: r() * h,
    vx: (r() - 0.5) * 0.35,
    vy: (r() - 0.5) * 0.35,
  }));
  let raf: number;
  function tick() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = palette[0];
    ctx.fillRect(0, 0, w, h);
    pts.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    });
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x,
          dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 110) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle =
            palette[1] +
            Math.floor((1 - d / 110) * 80)
              .toString(16)
              .padStart(2, "0");
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    pts.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = palette[2];
      ctx.fill();
    });
    raf = requestAnimationFrame(tick);
  }
  tick();
  return () => cancelAnimationFrame(raf);
}

function drawWaves(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  palette: string[],
  seed: number,
) {
  const r = rng(seed);
  const freqs = [0.015 + r() * 0.012, 0.022 + r() * 0.01, 0.03 + r() * 0.008];
  const amps = [25 + r() * 15, 18 + r() * 12, 12 + r() * 8];
  let t = 0,
    raf: number;
  function tick() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = palette[0];
    ctx.fillRect(0, 0, w, h);
    [0, 1, 2].forEach((i) => {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const y =
          h / 2 +
          Math.sin(x * freqs[i] + t * (0.01 + i * 0.004)) * amps[i] +
          Math.sin(x * freqs[i] * 1.6 + t * 0.005) * amps[i] * 0.35;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = palette[1 + i] + "99";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
    t++;
    raf = requestAnimationFrame(tick);
  }
  tick();
  return () => cancelAnimationFrame(raf);
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  palette: string[],
  seed: number,
) {
  const r = rng(seed);
  const step = 24 + Math.floor(r() * 12);
  const warpA = 8 + r() * 10,
    warpB = 4 + r() * 6;
  let t = 0,
    raf: number;
  function tick() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = palette[0];
    ctx.fillRect(0, 0, w, h);
    for (let x = 0; x <= w; x += step) {
      ctx.beginPath();
      for (let y = 0; y <= h; y += 3) {
        const wx =
          x +
          Math.sin(y * 0.04 + t * 0.013) * warpA +
          Math.sin(y * 0.02 + t * 0.007) * warpB;
        y === 0 ? ctx.moveTo(wx, y) : ctx.lineTo(wx, y);
      }
      ctx.strokeStyle = palette[2] + "44";
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += step) {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const wy =
          y +
          Math.sin(x * 0.04 + t * 0.011) * warpA +
          Math.sin(x * 0.025 + t * 0.008) * warpB;
        x === 0 ? ctx.moveTo(x, wy) : ctx.lineTo(x, wy);
      }
      ctx.strokeStyle = palette[2] + "44";
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
    t++;
    raf = requestAnimationFrame(tick);
  }
  tick();
  return () => cancelAnimationFrame(raf);
}

function drawRadial(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  palette: string[],
  seed: number,
) {
  const r = rng(seed);
  const cx = w * (0.35 + r() * 0.3),
    cy = h * (0.3 + r() * 0.4);
  const rings = 4 + Math.floor(r() * 3);
  let t = 0,
    raf: number;
  function tick() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = palette[0];
    ctx.fillRect(0, 0, w, h);
    for (let ri = 0; ri < rings; ri++) {
      const spokes = 28;
      const baseR = 18 + ri * 28 + Math.sin(t * 0.01 + ri) * 7;
      for (let i = 0; i < spokes; i++) {
        const a =
          (i / spokes) * Math.PI * 2 + t * 0.005 * (ri % 2 === 0 ? 1 : -1);
        const r2 = baseR + 16 + Math.sin(t * 0.02 + i) * 5;
        const alpha =
          (0.07 + (ri / rings) * 0.18) *
          (0.5 + Math.sin(t * 0.015 + i * 0.4) * 0.5);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * baseR, cy + Math.sin(a) * baseR);
        ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
        ctx.strokeStyle =
          palette[2] +
          Math.floor(alpha * 255)
            .toString(16)
            .padStart(2, "0");
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = palette[3];
    ctx.fill();
    t++;
    raf = requestAnimationFrame(tick);
  }
  tick();
  return () => cancelAnimationFrame(raf);
}

const drawFns = {
  mesh: drawMesh,
  waves: drawWaves,
  grid: drawGrid,
  radial: drawRadial,
};

interface CourseThumbnailProps {
  title: string;
  progress?: number; // 0–100
  hideContent?: boolean;
}

export default function CourseThumbnail({
  title,
  progress = 0,
  hideContent = false,
}: CourseThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const w = container.offsetWidth;
    const h = container.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const { pattern, palette, seed } = getConfig(title);
    const cleanup = drawFns[pattern](ctx, w, h, palette, seed);
    return cleanup;
  }, [title]);

  const { palette } = getConfig(title);

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl w-full aspect-video overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Progress pill */}
      {!hideContent && (
        <div className="absolute top-3 left-3 z-20">
          {progress === 0 ? (
            <span className="text-[10px] font-semibold tracking-wide text-white/50 bg-white/10 rounded-full px-2.5 py-1">
              Not started
            </span>
          ) : (
            <span
              className="text-[10px] rounded-full px-2.5 py-1"
              style={{
                color: palette[3],
                background: palette[1] + "44",
              }}
            >
              {progress}% complete
            </span>
          )}
        </div>
      )}

      {/* Course title */}
      {!hideContent && (
        <p className="absolute bottom-4 left-4 z-20 font-serif text-white/80 backdrop-blur-xl text-2xl leading-tight m-0 drop-shadow-md max-w-[75%]">
          {title}
        </p>
      )}

      {/* Progress bar */}
      {!hideContent && progress > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.75 bg-white/10 z-20">
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${progress}%`, background: palette[2] }}
          />
        </div>
      )}
    </div>
  );
}
