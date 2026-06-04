"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SparkleIcon } from "@phosphor-icons/react";
import GradientAnimationBackground from "@/components/GradientAnimationBackground";

const STEPS = [
  "Searching trusted sources with Exa…",
  "Building your syllabus and modules…",
  "Writing slide content grounded in research…",
  "Preparing voice-ready lesson scripts…",
  "Almost ready — opening your classroom…",
];

interface CourseGeneratingOverlayProps {
  open: boolean;
  topic: string;
  goal: string;
}

export default function CourseGeneratingOverlay({
  open,
  topic,
  goal,
}: CourseGeneratingOverlayProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!open) {
      setStepIndex(0);
      return;
    }

    document.body.style.overflow = "hidden";
    const interval = window.setInterval(() => {
      setStepIndex((i) => (i + 1) % STEPS.length);
    }, 3200);

    return () => {
      document.body.style.overflow = "";
      window.clearInterval(interval);
    };
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
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          <GradientAnimationBackground interactive />

          <div className="relative z-10 w-full max-w-lg px-6 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20"
            >
              <SparkleIcon size={32} weight="fill" className="text-white" />
            </motion.div>

            <motion.h2
              id="course-generating-title"
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white"
            >
              Creating your course
            </motion.h2>

            {topic && (
              <motion.p
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.22 }}
                className="mt-3 text-lg font-medium text-white/90"
              >
                {topic}
              </motion.p>
            )}

            {goal && (
              <motion.p
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.28 }}
                className="mt-2 text-sm text-white/60 line-clamp-2"
              >
                {goal}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mt-10 flex flex-col items-center gap-4"
            >
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-2 w-2 rounded-full bg-white"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.1, 0.85] }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={stepIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                  className="text-sm font-medium text-white/75 min-h-[1.25rem]"
                >
                  {STEPS[stepIndex]}
                </motion.p>
              </AnimatePresence>

              <p className="text-xs text-white/45 max-w-sm">
                This usually takes 1–3 minutes. We&apos;re grounding every module in
                real sources, then shaping lessons for voice.
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
