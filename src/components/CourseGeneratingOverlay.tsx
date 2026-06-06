"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GradientAnimationBackground from "@/components/GradientAnimationBackground";

interface CourseGeneratingOverlayProps {
  open: boolean;
  topic: string;
}

const PHASES = [
  "Analyzing your topic",
  "Researching references & sources",
  "Structuring custom curriculum",
  "Generating slides & voice scripts",
  "Designing tutoring check-ins",
  "Setting up your voice classroom",
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
          <GradientAnimationBackground className="opacity-50" />

          {/* Centralized flip text loader */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
            <div className="h-20 flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.h2
                  id="course-generating-title"
                  key={phaseIndex}
                  initial={{ opacity: 0, y: 15, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -15, filter: "blur(6px)" }}
                  transition={{ duration: 0.45, ease: "linear" }}
                  className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white"
                >
                  {PHASES[phaseIndex]}
                </motion.h2>
              </AnimatePresence>
            </div>

            <p className="text-white/40 text-xs tracking-widest uppercase mt-4 font-mono">
              Creating Course • Please wait
            </p>

            {/* Mesmerizing abstract orbital ring distraction */}
            <div className="relative w-44 h-44 mt-12 flex items-center justify-center overflow-visible">
              {/* Outer ring */}
              <motion.div
                className="absolute w-36 h-36 rounded-full border border-white/[0.04] flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee,0_0_20px_#22d3ee]" />
              </motion.div>

              {/* Middle ring */}
              <motion.div
                className="absolute w-24 h-24 rounded-full border border-white/[0.08] flex items-center justify-center"
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc,0_0_15px_#c084fc]" />
              </motion.div>

              {/* Inner ring */}
              <motion.div
                className="absolute w-14 h-14 rounded-full border border-white/[0.12] flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1 h-1 rounded-full bg-pink-400 shadow-[0_0_6px_#f472b6]" />
              </motion.div>

              {/* Central glowing core */}
              <motion.div
                className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]"
                animate={{
                  scale: [0.95, 1.15, 0.95],
                  opacity: [0.7, 0.9, 0.7],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
            <p className="text-white/40 tracking-wide mt-12 text-lg">
              Working on your course on{" "}
              <span className="text-white font-medium"> {topic}</span>
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
