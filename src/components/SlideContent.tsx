"use client";

import { useEffect, useState, useCallback } from "react";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";
import { ImageIcon } from "@phosphor-icons/react";
import type { SlideLayout } from "@/lib/courseApi";

// ─────────────────────────────────────────────────────────────
// Math text renderer — parses $...$ inline and $$...$$ block
// ─────────────────────────────────────────────────────────────
function MathText({ text, className }: { text: string; className?: string }) {
  const parts: Array<{ type: "text" | "inline" | "block"; content: string }> =
    [];
  let i = 0;
  let buf = "";

  while (i < text.length) {
    if (text[i] === "$" && text[i + 1] === "$") {
      if (buf) {
        parts.push({ type: "text", content: buf });
        buf = "";
      }
      const end = text.indexOf("$$", i + 2);
      if (end !== -1) {
        parts.push({ type: "block", content: text.slice(i + 2, end) });
        i = end + 2;
      } else {
        buf += "$$";
        i += 2;
      }
    } else if (text[i] === "$") {
      if (buf) {
        parts.push({ type: "text", content: buf });
        buf = "";
      }
      const end = text.indexOf("$", i + 1);
      if (end !== -1) {
        parts.push({ type: "inline", content: text.slice(i + 1, end) });
        i = end + 1;
      } else {
        buf += "$";
        i += 1;
      }
    } else {
      buf += text[i];
      i += 1;
    }
  }
  if (buf) parts.push({ type: "text", content: buf });

  return (
    <span className={className}>
      {parts.map((p, idx) =>
        p.type === "block" ? (
          <span key={idx} className="block my-2">
            <BlockMath math={p.content} />
          </span>
        ) : p.type === "inline" ? (
          <InlineMath key={idx} math={p.content} />
        ) : (
          <span key={idx}>{p.content}</span>
        ),
      )}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Diagram panel — fetches Wikipedia thumbnail
// ─────────────────────────────────────────────────────────────
interface WikiSummary {
  title: string;
  thumbnail?: { source: string; width: number; height: number };
  originalimage?: { source: string; width: number; height: number };
  description?: string;
}

interface DiagramPanelProps {
  diagramQuery: string;
  variant?: "dark" | "light";
  large?: boolean;
  isFullscreen?: boolean;
}

const wikiCache: Record<string, WikiSummary | "error"> = {};

export function DiagramPanel({
  diagramQuery,
  variant = "dark",
  large = false,
  isFullscreen = false,
}: DiagramPanelProps) {
  const [wiki, setWiki] = useState<WikiSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchDiagram = useCallback(async () => {
    const query = diagramQuery.trim();
    if (!query) return;

    if (wikiCache[query]) {
      if (wikiCache[query] === "error") {
        setError(true);
        setWiki(null);
      } else {
        setError(false);
        setWiki(wikiCache[query] as WikiSummary);
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);
    try {
      const encoded = encodeURIComponent(query);
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`,
        { headers: { "Api-User-Agent": "GraspAI/1.0 (education platform)" } },
      );
      if (!res.ok) throw new Error("Not found");
      const data = (await res.json()) as WikiSummary;
      wikiCache[query] = data;
      setWiki(data);
    } catch {
      wikiCache[query] = "error";
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [diagramQuery]);

  useEffect(() => {
    fetchDiagram();
  }, [fetchDiagram]);

  const maxH = isFullscreen
    ? (large ? "68vh" : "42vh")
    : (large ? "34vh" : "22vh");

  if (loading) {
    return (
      <div
        className={`rounded-2xl overflow-hidden animate-pulse w-full ${
          variant === "dark"
            ? "bg-white/10"
            : "bg-neutral-100 border border-neutral-200"
        }`}
        style={{
          height: maxH,
          maxHeight: maxH,
        }}
      />
    );
  }

  const imageUrl = wiki?.originalimage?.source || wiki?.thumbnail?.source;
  if (error || !imageUrl) return null;

  const isDark = variant === "dark";

  return (
    <div
      className={`rounded-2xl overflow-hidden flex flex-col justify-center items-center w-full ${
        isDark
          ? "bg-black/30 border border-white/10 backdrop-blur-md shadow-xl"
          : "bg-white border border-neutral-200 shadow-md"
      }`}
      style={{ height: maxH, maxHeight: maxH }}
    >
      <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={`Diagram: ${wiki.title}`}
          className="w-full h-full object-contain"
          loading="lazy"
        />
        <div
          className={`absolute bottom-0 left-0 right-0 h-10 ${
            isDark
              ? "bg-linear-to-t from-black/60 to-transparent"
              : "bg-linear-to-t from-white/80 to-transparent"
          }`}
        />
      </div>
      <div
        className={`px-3 py-2 ${isDark ? "text-white/60" : "text-neutral-400"}`}
      >
        <p className="text-[10px] font-medium flex items-center gap-1.5">
          <ImageIcon size={10} />
          <span className="truncate">{wiki.title}</span>
          <span className="opacity-50 ml-auto shrink-0">Wikipedia</span>
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Individual layout renderers
// ─────────────────────────────────────────────────────────────

/** "title" — large centered title + subtitle hook */
function TitleLayout({
  title,
  points,
  variant,
}: {
  title: string;
  points: string[];
  variant: "dark" | "light";
}) {
  const subtitle = points[0] ?? "";
  return (
    <div className="flex flex-col items-center justify-center text-center h-full py-4">
      <div
        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium ${
          variant === "dark"
            ? "bg-white text-foreground"
            : "bg-primary/10 text-primary"
        }`}
      >
        Topic
      </div>
      <h2
        className={`text-3xl md:text-5xl font-serif mb-5 mt-2 leading-tight ${
          variant === "dark" ? "text-white" : "text-neutral-900"
        }`}
      >
        <MathText text={title} />
      </h2>
      {subtitle && (
        <p
          className={`text-base md:text-xl font-medium max-w-lg leading-relaxed ${
            variant === "dark" ? "text-white/70" : "text-neutral-500"
          }`}
        >
          <MathText text={subtitle} />
        </p>
      )}
    </div>
  );
}

/** "statement" — single bold statement, centered, large */
function StatementLayout({
  points,
  variant,
}: {
  points: string[];
  variant: "dark" | "light";
}) {
  const statement = points[0] ?? "";
  return (
    <div className="flex flex-col items-center justify-center text-center h-full gap-4 py-4">
      <div
        className={`w-12 h-1 rounded-full ${variant === "dark" ? "bg-white/30" : "bg-primary/30"}`}
      />
      <blockquote
        className={`text-2xl md:text-3xl font-serif leading-snug max-w-2xl drop-shadow-md ${
          variant === "dark" ? "text-white" : "text-neutral-900"
        }`}
      >
        <MathText text={`"${statement}"`} />
      </blockquote>
      <div
        className={`w-12 h-1 rounded-full ${variant === "dark" ? "bg-white/30" : "bg-primary/30"}`}
      />
    </div>
  );
}

/** "visual" — diagram center stage, small callout pills below/beside */
function VisualLayout({
  title,
  points,
  diagramQuery,
  variant,
  isFullscreen,
}: {
  title: string;
  points: string[];
  diagramQuery?: string | null;
  variant: "dark" | "light";
  isFullscreen?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 flex-1 min-h-0 w-full">
      {diagramQuery && (
        <div className="flex-1 min-h-0">
          <DiagramPanel
            diagramQuery={diagramQuery}
            variant={variant}
            large
            isFullscreen={isFullscreen}
          />
        </div>
      )}
      {points.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {points.map((p, i) => (
            <span
              key={i}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                variant === "dark"
                  ? "bg-white text-neutral-900"
                  : "bg-primary/8 text-primary"
              }`}
            >
              <MathText text={p} />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** "two-col" — points split evenly into two columns */
function TwoColLayout({
  points,
  variant,
  pointClassName,
}: {
  points: string[];
  variant: "dark" | "light";
  pointClassName?: string;
}) {
  const mid = Math.ceil(points.length / 2);
  const left = points.slice(0, mid);
  const right = points.slice(mid);
  const isDark = variant === "dark";
  const textClass =
    pointClassName ||
    (isDark
      ? "text-sm md:text-base text-white/90 leading-relaxed"
      : "text-xs md:text-sm text-neutral-800 leading-relaxed");

  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-1 h-full">
      {/* Left column */}
      <div
        className={`flex flex-col gap-3 border-r pr-6 ${isDark ? "border-white/10" : "border-neutral-100"}`}
      >
        {left.map((p, i) => (
          <div key={i} className="flex items-start gap-3">
            <span
              className={`font-bold text-sm mt-0.5 shrink-0 ${isDark ? "text-white/50" : "text-primary/60"}`}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <MathText text={p} className={textClass} />
          </div>
        ))}
      </div>
      {/* Right column */}
      <div className="flex flex-col gap-3 pl-2">
        {right.map((p, i) => (
          <div key={i} className="flex items-start gap-3">
            <span
              className={`font-bold text-sm mt-0.5 shrink-0 ${isDark ? "text-white/50" : "text-primary/60"}`}
            >
              {String(mid + i + 1).padStart(2, "0")}
            </span>
            <MathText text={p} className={textClass} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** "bullets" — standard bullet list, optionally with a diagram beside */
function BulletsLayout({
  points,
  diagramQuery,
  variant,
  pointClassName,
  isFullscreen,
}: {
  points: string[];
  diagramQuery?: string | null;
  variant: "dark" | "light";
  pointClassName?: string;
  isFullscreen?: boolean;
}) {
  const isDark = variant === "dark";
  const textClass =
    pointClassName ||
    (isDark
      ? "text-sm md:text-base text-white/90 font-medium leading-relaxed drop-shadow-sm"
      : "text-xs md:text-sm text-white/90 font-medium leading-relaxed drop-shadow-sm");

  return (
    <div
      className={`flex gap-6 ${diagramQuery ? "flex-col lg:flex-row" : "flex-col"}`}
    >
      <div className="flex flex-col gap-3 flex-1 min-w-0">
        {points.map((p, i) => (
          <div key={i} className="flex items-start gap-3">
            <span
              className={`font-bold text-sm mt-0.5 shrink-0 ${isDark ? "text-white/60" : "text-neutral-400"}`}
            >
              •
            </span>
            <MathText text={p} className={textClass} />
          </div>
        ))}
      </div>
      {diagramQuery && (
        <div className="w-full lg:w-96 xl:w-[450px] shrink-0">
          <DiagramPanel
            diagramQuery={diagramQuery}
            variant={variant}
            isFullscreen={isFullscreen}
          />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main export — routes to correct layout renderer
// ─────────────────────────────────────────────────────────────
export interface SlideContentProps {
  title?: string;
  points: string[];
  diagramQuery?: string | null;
  layout?: SlideLayout | null;
  /** "dark" = classroom overlay / dark card; "light" = light card */
  variant?: "dark" | "light";
  /** Override class for bullet text */
  pointClassName?: string;
  isFullscreen?: boolean;
}

export default function SlideContent({
  title = "",
  points,
  diagramQuery,
  layout = "bullets",
  variant = "dark",
  pointClassName,
  isFullscreen = false,
}: SlideContentProps) {
  const l = layout ?? "bullets";

  if (l === "title") {
    return <TitleLayout title={title} points={points} variant={variant} />;
  }
  if (l === "statement") {
    return <StatementLayout points={points} variant={variant} />;
  }
  if (l === "visual") {
    return (
      <VisualLayout
        title={title}
        points={points}
        diagramQuery={diagramQuery}
        variant={variant}
        isFullscreen={isFullscreen}
      />
    );
  }
  if (l === "two-col") {
    return (
      <TwoColLayout
        points={points}
        variant={variant}
        pointClassName={pointClassName}
      />
    );
  }
  return (
    <BulletsLayout
      points={points}
      diagramQuery={diagramQuery}
      variant={variant}
      pointClassName={pointClassName}
      isFullscreen={isFullscreen}
    />
  );
}
