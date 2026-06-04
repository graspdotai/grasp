"use client";

import { useEffect, useRef, useState } from "react";

interface GradientAnimationBackgroundProps {
  interactive?: boolean;
  className?: string;
}

export default function GradientAnimationBackground({
  interactive = true,
  className = "",
}: GradientAnimationBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pointer, setPointer] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (!interactive) return;

    function handleMove(e: MouseEvent) {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setPointer({ x, y });
    }

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [interactive]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden gradient-mesh-bg ${className}`}
      aria-hidden
    >
      <div className="gradient-orb gradient-orb-a" />
      <div className="gradient-orb gradient-orb-b" />
      <div className="gradient-orb gradient-orb-c" />
      <div className="gradient-orb gradient-orb-d" />

      {interactive && (
        <div
          className="gradient-cursor-glow absolute h-[min(70vw,520px)] w-[min(70vw,520px)] rounded-full opacity-60 blur-3xl transition-[left,top] duration-300 ease-out"
          style={{
            left: `${pointer.x}%`,
            top: `${pointer.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      )}

      <div className="absolute inset-0 bg-neutral-950/25 backdrop-blur-[1px]" />
    </div>
  );
}
