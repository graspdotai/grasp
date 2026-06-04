"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GradientAnimationBackground from "@/components/GradientAnimationBackground";

interface CourseGeneratingOverlayProps {
  open: boolean;
  topic: string;
}

const PHASES = [
  "Analyzing your topic...",
  "Researching references & sources...",
  "Structuring custom curriculum...",
  "Generating slides & voice scripts...",
  "Designing tutoring check-ins...",
  "Setting up your voice classroom..."
];

export default function CourseGeneratingOverlay({
  open,
  topic,
}: CourseGeneratingOverlayProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % PHASES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="course-generating-title"
          aria-busy="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] bg-neutral-950 flex items-center justify-center select-none"
        >
          {/* Fluid motion gradient background */}
          <GradientAnimationBackground interactive className="opacity-90" />

          {/* Centralized flip text loader */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
            <div className="h-20 flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.h2
                  id="course-generating-title"
                  key={phaseIndex}
                  initial={{ opacity: 0, y: 25, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, y: -25, rotateX: 90 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white"
                >
                  {PHASES[phaseIndex]}
                </motion.h2>
              </AnimatePresence>
            </div>
            <p className="text-white/40 text-xs tracking-widest uppercase mt-6 font-mono">
              Creating Course • Please wait
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
