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
}

export default function CourseGeneratingOverlay({
  open,
  topic,
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
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] bg-neutral-950"
        >
          <GradientAnimationBackground interactive className="opacity-90" />

          <div className="relative z-10 flex min-h-full items-center justify-center px-6 py-12">
            <div className="w-full max-w-md text-center">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 border border-white/15">
                <SparkleIcon size={28} weight="fill" className="text-white" />
              </div>

              <h2
                id="course-generating-title"
                className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white"
              >
                Creating your course
              </h2>

              {topic ? (
                <p className="mt-3 text-base font-medium text-white/90 line-clamp-2">
                  {topic}
                </p>
              ) : null}

              <div className="mt-8 flex flex-col items-center gap-3">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-white/80"
                      animate={{ opacity: [0.35, 1, 0.35] }}
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
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                    className="text-sm text-white/70 min-h-[1.25rem]"
                  >
                    {STEPS[stepIndex]}
                  </motion.p>
                </AnimatePresence>

                <p className="text-xs text-white/40 max-w-xs pt-1">
                  Usually 1–3 minutes. Hang tight.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
