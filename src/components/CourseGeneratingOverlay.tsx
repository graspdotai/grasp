"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SparkleIcon } from "@phosphor-icons/react";
import GradientAnimationBackground from "@/components/GradientAnimationBackground";

interface CourseGeneratingOverlayProps {
  open: boolean;
  topic: string;
}

export default function CourseGeneratingOverlay({
  open,
  topic,
}: CourseGeneratingOverlayProps) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
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

              <div className="mt-8 flex justify-center">
                <div
                  className="h-9 w-9 rounded-full border-2 border-white/30 border-t-white animate-spin"
                  aria-hidden
                />
              </div>

              <p className="mt-6 text-sm text-white/50">This may take a minute or two.</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
