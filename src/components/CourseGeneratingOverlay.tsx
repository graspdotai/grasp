"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Spinner from "@/components/Spinner";

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
  "Setting up your classroom",
] as const;

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
          className="fixed inset-0 z-[200] mesh-gradient-light flex items-center justify-center select-none"
        >
          {/* Subtle grid pattern for premium texture */}
          <div
            className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none select-none"
            aria-hidden="true"
          />

          {/* Centralized text and spinner loader */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
            <div className="flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.h2
                  id="course-generating-title"
                  key={phaseIndex}
                  initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                  transition={{ duration: 0.4, ease: "linear" }}
                  className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 py-6"
                >
                  {PHASES[phaseIndex]}
                </motion.h2>
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2">
              <div>
                <Spinner className="text-neutral-700" size={16} />
              </div>

              <p className="text-neutral-500 text-sm sm:text-lg">
                Working on your course on{" "}
                <span className="text-neutral-900 font-semibold"> {topic}</span>
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
