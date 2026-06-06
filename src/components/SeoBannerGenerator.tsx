"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  PaintBrush,
  TextAlignLeft,
  TextAlignCenter,
  Image as ImageIcon,
} from "@phosphor-icons/react";

interface BannerSettings {
  title: string;
  subtitle: string;
  tagline: string;
  theme: "mesh-dark" | "mesh-light" | "sunset-glow" | "neon-ocean" | "cyberpunk";
  alignment: "left" | "center";
  fontSizeTitle: number;
  fontSizeSubtitle: number;
  size: "og" | "twitter" | "square";
  includeOrbs: boolean;
  textColorOverride: string;
}

export default function SeoBannerGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [settings, setSettings] = useState<BannerSettings>({
    title: "Master calculus in just 15 minutes a day",
    subtitle: "High-quality personalized audio courses created dynamically for your goals.",
    tagline: "GRASP AI",
    theme: "mesh-dark",
    alignment: "left",
    fontSizeTitle: 54,
    fontSizeSubtitle: 28,
    size: "og",
    includeOrbs: true,
    textColorOverride: "",
  });

  const getDimensions = useCallback((size: "og" | "twitter" | "square") => {
    switch (size) {
      case "twitter":
        return { w: 1200, h: 600 };
      case "square":
        return { w: 1080, h: 1080 };
      case "og":
      default:
        return { w: 1200, h: 630 };
    }
  }, []);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w, h } = getDimensions(settings.size);
    canvas.width = w;
    canvas.height = h;

    // 1. Draw Background based on Theme
    ctx.save();
    if (settings.theme === "mesh-dark") {
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, w, h);

      // Deep Blue orb
      let grad1 = ctx.createRadialGradient(w * 0.2, h * 0.2, 0, w * 0.2, h * 0.2, w * 0.65);
      grad1.addColorStop(0, "rgba(30, 58, 138, 0.7)");
      grad1.addColorStop(1, "rgba(2, 6, 23, 0)");
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, w, h);

      // Deep Violet orb
      let grad2 = ctx.createRadialGradient(w * 0.8, h * 0.1, 0, w * 0.8, h * 0.1, w * 0.6);
      grad2.addColorStop(0, "rgba(91, 33, 182, 0.6)");
      grad2.addColorStop(1, "rgba(2, 6, 23, 0)");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, w, h);

      // Cyan-teal accent orb
      let grad3 = ctx.createRadialGradient(w * 0.6, h * 0.9, 0, w * 0.6, h * 0.9, w * 0.55);
      grad3.addColorStop(0, "rgba(14, 116, 144, 0.5)");
      grad3.addColorStop(1, "rgba(2, 6, 23, 0)");
      ctx.fillStyle = grad3;
      ctx.fillRect(0, 0, w, h);
    } else if (settings.theme === "mesh-light") {
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, w, h);

      // Light primary blue glow
      let l1 = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.75);
      l1.addColorStop(0, "rgba(37, 99, 235, 0.18)");
      l1.addColorStop(1, "rgba(248, 250, 252, 0)");
      ctx.fillStyle = l1;
      ctx.fillRect(0, 0, w, h);

      // Light violet glow
      let l2 = ctx.createRadialGradient(w, 0, 0, w, 0, w * 0.7);
      l2.addColorStop(0, "rgba(124, 58, 237, 0.14)");
      l2.addColorStop(1, "rgba(248, 250, 252, 0)");
      ctx.fillStyle = l2;
      ctx.fillRect(0, 0, w, h);

      // Light cyan glow
      let l3 = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.8);
      l3.addColorStop(0, "rgba(6, 182, 212, 0.12)");
      l3.addColorStop(1, "rgba(248, 250, 252, 0)");
      ctx.fillStyle = l3;
      ctx.fillRect(0, 0, w, h);
    } else if (settings.theme === "sunset-glow") {
      ctx.fillStyle = "#1e1b4b"; // deep navy base
      ctx.fillRect(0, 0, w, h);

      let grad1 = ctx.createRadialGradient(w * 0.1, h * 0.8, 0, w * 0.1, h * 0.8, w * 0.85);
      grad1.addColorStop(0, "rgba(249, 115, 22, 0.45)"); // vibrant orange
      grad1.addColorStop(1, "rgba(30, 27, 75, 0)");
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, w, h);

      let grad2 = ctx.createRadialGradient(w * 0.9, h * 0.2, 0, w * 0.9, h * 0.2, w * 0.7);
      grad2.addColorStop(0, "rgba(236, 72, 153, 0.45)"); // rose
      grad2.addColorStop(1, "rgba(30, 27, 75, 0)");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, w, h);
    } else if (settings.theme === "neon-ocean") {
      ctx.fillStyle = "#022c22"; // deep emerald/teal
      ctx.fillRect(0, 0, w, h);

      let grad1 = ctx.createRadialGradient(w * 0.8, h * 0.8, 0, w * 0.8, h * 0.8, w * 0.9);
      grad1.addColorStop(0, "rgba(6, 182, 212, 0.5)"); // cyan
      grad1.addColorStop(1, "rgba(2, 44, 34, 0)");
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, w, h);

      let grad2 = ctx.createRadialGradient(w * 0.2, h * 0.2, 0, w * 0.2, h * 0.2, w * 0.7);
      grad2.addColorStop(0, "rgba(16, 185, 129, 0.45)"); // emerald
      grad2.addColorStop(1, "rgba(2, 44, 34, 0)");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, w, h);
    } else if (settings.theme === "cyberpunk") {
      ctx.fillStyle = "#0f051d"; // deep space violet
      ctx.fillRect(0, 0, w, h);

      let grad1 = ctx.createRadialGradient(w * 0.3, h * 0.7, 0, w * 0.3, h * 0.7, w * 0.8);
      grad1.addColorStop(0, "rgba(236, 72, 153, 0.6)"); // hot pink
      grad1.addColorStop(1, "rgba(15, 5, 29, 0)");
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, w, h);

      let grad2 = ctx.createRadialGradient(w * 0.8, h * 0.3, 0, w * 0.8, h * 0.3, w * 0.75);
      grad2.addColorStop(0, "rgba(59, 130, 246, 0.55)"); // neon blue
      grad2.addColorStop(1, "rgba(15, 5, 29, 0)");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();

    const isLightTheme = settings.theme === "mesh-light";

    // 2. Draw Decorative Shapes/Orbs (Grasp Branding Details)
    if (settings.includeOrbs) {
      ctx.save();
      // Concentric circles (like the course detail background)
      ctx.strokeStyle = isLightTheme ? "rgba(37, 99, 235, 0.04)" : "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 40;
      ctx.beginPath();
      ctx.arc(w - 100, h / 2, 260, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = isLightTheme ? "rgba(37, 99, 235, 0.02)" : "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 60;
      ctx.beginPath();
      ctx.arc(w - 100, h / 2, 390, 0, Math.PI * 2);
      ctx.stroke();

      // Small glowing core dot at bottom left
      ctx.beginPath();
      let dotGrad = ctx.createRadialGradient(150, h - 150, 0, 150, h - 150, 180);
      dotGrad.addColorStop(0, isLightTheme ? "rgba(37, 99, 235, 0.15)" : "rgba(255, 255, 255, 0.1)");
      dotGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = dotGrad;
      ctx.arc(150, h - 150, 180, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3. Setup text configuration
    const isCentered = settings.alignment === "center";
    const xPos = isCentered ? w / 2 : 100;
    ctx.textAlign = isCentered ? "center" : "left";

    // Font color
    let textColor = isLightTheme ? "#0f172a" : "#ffffff";
    let subtitleColor = isLightTheme ? "#475569" : "rgba(255, 255, 255, 0.75)";
    let taglineColor = isLightTheme ? "#2563eb" : "#a78bfa";

    if (settings.textColorOverride) {
      textColor = settings.textColorOverride;
      subtitleColor = settings.textColorOverride + "bb";
      taglineColor = settings.textColorOverride;
    }

    // A. Draw Tagline
    ctx.save();
    ctx.font = 'bold 13px "Inter", sans-serif';
    ctx.fillStyle = taglineColor;
    ctx.letterSpacing = "6px";
    ctx.textBaseline = "top";
    ctx.fillText(settings.tagline.toUpperCase(), xPos, 80);
    ctx.restore();

    // B. Draw stylized double-ring Logo in corner
    ctx.save();
    const logoX = w - 120;
    const logoY = 90;
    ctx.strokeStyle = isLightTheme ? "#2563eb" : "#ffffff";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(logoX, logoY, 20, 0, Math.PI * 2);
    ctx.stroke();
    // Inner filled circle
    ctx.fillStyle = isLightTheme ? "#2563eb" : "#ffffff";
    ctx.beginPath();
    ctx.arc(logoX, logoY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // C. Draw Title
    ctx.save();
    ctx.fillStyle = textColor;
    ctx.font = `bold ${settings.fontSizeTitle}px "DM Serif Display", serif`;
    ctx.textBaseline = "top";

    const wrapWidth = w - 200;
    const titleLineHeight = settings.fontSizeTitle * 1.25;

    // Custom wrap script
    const wrapText = (text: string, maxWidth: number) => {
      const words = text.split(" ");
      const lines: string[] = [];
      let currentLine = "";

      for (let i = 0; i < words.length; i++) {
        let testLine = currentLine + words[i] + " ";
        let width = ctx.measureText(testLine).width;
        if (width > maxWidth && i > 0) {
          lines.push(currentLine.trim());
          currentLine = words[i] + " ";
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine.trim());
      return lines;
    };

    const titleLines = wrapText(settings.title, wrapWidth);
    let currentY = 150;

    titleLines.forEach((line) => {
      ctx.fillText(line, xPos, currentY);
      currentY += titleLineHeight;
    });
    ctx.restore();

    // D. Draw Subtitle
    ctx.save();
    ctx.fillStyle = subtitleColor;
    ctx.font = `${settings.fontSizeSubtitle}px "Inter", sans-serif`;
    ctx.textBaseline = "top";

    const subLineHeight = settings.fontSizeSubtitle * 1.4;
    const subLines = wrapText(settings.subtitle, wrapWidth);

    currentY += 25; // add margin between title and subtitle

    subLines.forEach((line) => {
      ctx.fillText(line, xPos, currentY);
      currentY += subLineHeight;
    });
    ctx.restore();

    // E. Draw decorative bottom info
    ctx.save();
    ctx.font = '500 13px "Inter", sans-serif';
    ctx.fillStyle = isLightTheme ? "#94a3b8" : "rgba(255, 255, 255, 0.4)";
    ctx.textBaseline = "bottom";
    ctx.fillText("GRASP.AI  •  AUDIO-FIRST LEARNING", xPos, h - 70);
    ctx.restore();
  }, [settings, getDimensions]);

  // Re-draw on configuration change
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `grasp-seo-${settings.theme}-${settings.size}.jpg`;
    link.click();
  };

  return (
    <div className="gradient-mesh-bg min-h-screen text-white flex flex-col">
      {/* Header Bar */}
      <header className="border-b border-white/10 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center justify-center h-10 w-10 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold font-serif tracking-wide">SEO Banner Generator</h1>
            <p className="text-xs text-white/50">Create OpenGraph, Twitter and social banner assets for Grasp</p>
          </div>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 active:scale-98 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-primary-600/30 transition-all cursor-pointer"
        >
          <Download size={18} />
          Download JPEG
        </button>
      </header>

      {/* Main Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Settings Controls Panel */}
        <div className="lg:col-span-4 bg-slate-900/40 border border-white/10 backdrop-blur-md rounded-2xl p-6 flex flex-col gap-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-primary-400 flex items-center gap-2">
            <PaintBrush size={16} />
            Canvas Settings
          </h2>

          {/* Size Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white/60">Banner Dimension</label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "og", label: "OG Image", desc: "1200x630" },
                  { id: "twitter", label: "Twitter", desc: "1200x600" },
                  { id: "square", label: "Square", desc: "1080x1080" },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSettings((s) => ({ ...s, size: item.id }))}
                  className={`px-3 py-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                    settings.size === item.id
                      ? "border-primary bg-primary-600/10 text-white font-medium shadow-md shadow-primary-600/10"
                      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <span className="text-xs">{item.label}</span>
                  <span className="text-[10px] opacity-50">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white/60">Background Style</label>
            <select
              value={settings.theme}
              onChange={(e) =>
                setSettings((s) => ({ ...s, theme: e.target.value as BannerSettings["theme"] }))
              }
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 transition-colors"
            >
              <option value="mesh-dark">Dark Radial Mesh (Default)</option>
              <option value="mesh-light">Light Clean Mesh</option>
              <option value="sunset-glow">Sunset Glow</option>
              <option value="neon-ocean">Ocean Neon</option>
              <option value="cyberpunk">Cyberpunk Space</option>
            </select>
          </div>

          {/* Tagline */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white/60">Tagline / Badge</label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => setSettings((s) => ({ ...s, tagline: e.target.value }))}
              placeholder="e.g. GRASP AI"
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white/60">Title Text</label>
            <input
              type="text"
              value={settings.title}
              onChange={(e) => setSettings((s) => ({ ...s, title: e.target.value }))}
              placeholder="Enter banner title"
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          {/* Subtitle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white/60">Subtitle Text</label>
            <textarea
              rows={3}
              value={settings.subtitle}
              onChange={(e) => setSettings((s) => ({ ...s, subtitle: e.target.value }))}
              placeholder="Enter banner description"
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 transition-colors resize-none"
            />
          </div>

          {/* Font Sizes */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white/60">Title Font Size</span>
                <span>{settings.fontSizeTitle}px</span>
              </div>
              <input
                type="range"
                min={24}
                max={72}
                value={settings.fontSizeTitle}
                onChange={(e) => setSettings((s) => ({ ...s, fontSizeTitle: Number(e.target.value) }))}
                className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white/60">Subtitle Font Size</span>
                <span>{settings.fontSizeSubtitle}px</span>
              </div>
              <input
                type="range"
                min={16}
                max={42}
                value={settings.fontSizeSubtitle}
                onChange={(e) => setSettings((s) => ({ ...s, fontSizeSubtitle: Number(e.target.value) }))}
                className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Text Alignment */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white/60">Text Alignment</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSettings((s) => ({ ...s, alignment: "left" }))}
                className={`py-2 rounded-xl border flex items-center justify-center gap-2 text-xs transition-all ${
                  settings.alignment === "left"
                    ? "border-primary bg-primary-600/10 text-white font-medium"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/8 hover:text-white"
                }`}
              >
                <TextAlignLeft size={16} />
                Left Align
              </button>
              <button
                onClick={() => setSettings((s) => ({ ...s, alignment: "center" }))}
                className={`py-2 rounded-xl border flex items-center justify-center gap-2 text-xs transition-all ${
                  settings.alignment === "center"
                    ? "border-primary bg-primary-600/10 text-white font-medium"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/8 hover:text-white"
                }`}
              >
                <TextAlignCenter size={16} />
                Center Align
              </button>
            </div>
          </div>

          {/* Toggle Decorative Orbs */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
            <span className="text-xs font-semibold text-white/60">Include Accent Circles</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.includeOrbs}
                onChange={(e) => setSettings((s) => ({ ...s, includeOrbs: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-850 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>

        {/* Right Canvas Preview Area */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs text-white/50 uppercase tracking-widest">
            <ImageIcon size={14} />
            Live Preview
          </div>

          {/* Canvas Wrapper */}
          <div className="bg-slate-950/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 flex items-center justify-center overflow-hidden shadow-2xl relative">
            <div className="w-full max-w-3xl flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="max-w-full rounded-xl border border-white/10 shadow-2xl bg-black/40 aspect-[1200/630]"
                style={{
                  // Keep a nice scaled down size for the preview but draw in high res
                  width: "100%",
                  maxHeight: "420px",
                  objectFit: "contain",
                }}
              />
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-xs text-white/60 leading-relaxed">
            <p className="font-semibold text-white/80 mb-1">💡 SEO Pro-Tips:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Use **OG Image (1200x630)** for general OpenGraph/Facebook metadata image.</li>
              <li>Write clean, punchy headings (e.g. course topic name) that hook search engine users.</li>
              <li>Keep subtitles under 2 sentences to ensure optimal typography scale and legibility.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
