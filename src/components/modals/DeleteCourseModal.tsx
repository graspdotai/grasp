"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WarningIcon, CheckCircleIcon, CircleNotchIcon } from "@phosphor-icons/react";
import Modal from "@/components/modals/Modal";

type Step = "confirm" | "type" | "done";

interface DeleteCourseModalProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
  courseTitle: string;
}

const stepVariants = {
  enter: (dir: number) => ({ x: dir * 32, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -32, opacity: 0 }),
};

const stepTransition = { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const };

export default function DeleteCourseModal({
  open,
  onClose,
  onDelete,
  courseTitle,
}: DeleteCourseModalProps) {
  const [step, setStep] = useState<Step>("confirm");
  const [dir, setDir] = useState(1);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function advance(next: Step) {
    setDir(1);
    setStep(next);
  }

  function back() {
    setDir(-1);
    setError(null);
    setInput("");
    setStep("confirm");
  }

  function handleClose() {
    if (isDeleting) return;
    onClose();
    setTimeout(() => {
      setStep("confirm");
      setInput("");
      setError(null);
      setDir(1);
    }, 250);
  }

  async function handleDelete() {
    if (input !== "DELETE") {
      setError("Type DELETE exactly to confirm.");
      return;
    }
    setError(null);
    setIsDeleting(true);
    try {
      await onDelete();
      advance("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete course.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={step === "done" ? undefined! : handleClose}
      disableBackdropClose={isDeleting || step === "done"}
      maxWidth="max-w-xs"
    >
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          {step === "confirm" && (
            <motion.div
              key="confirm"
              custom={dir}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={stepTransition}
              className="flex flex-col items-center gap-4 pb-2 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-danger-50">
                <WarningIcon size={32} weight="fill" className="text-danger-500" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold text-neutral-900">Delete this course?</h2>
                <p className="text-sm text-neutral-500">
                  <span className="font-medium text-neutral-700">"{courseTitle}"</span> and all its
                  modules will be permanently removed.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 pt-1">
                <button
                  onClick={() => advance("type")}
                  className="w-full rounded-xl bg-danger-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-danger-700"
                >
                  Continue
                </button>
                <button
                  onClick={handleClose}
                  className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {step === "type" && (
            <motion.div
              key="type"
              custom={dir}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={stepTransition}
              className="flex flex-col gap-4 pb-2"
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold text-neutral-900">Confirm deletion</h2>
                <p className="text-sm text-neutral-500">
                  Type <span className="font-mono font-semibold text-neutral-700">DELETE</span> to continue.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="relative flex flex-col">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => { setInput(e.target.value); setError(null); }}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    autoComplete="off"
                    placeholder="Type DELETE"
                    className="w-full bg-transparent py-2.5 font-mono text-sm text-neutral-900 placeholder-neutral-300 focus:outline-none"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-neutral-200" />
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-danger-500"
                    animate={{ scaleX: inputFocused ? 1 : 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    style={{ originX: 0 }}
                  />
                </div>
                {error && <p className="text-xs text-danger-600">{error}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleDelete}
                  disabled={input !== "DELETE" || isDeleting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-danger-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-danger-700 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <CircleNotchIcon size={15} className="animate-spin" />
                      Deleting…
                    </>
                  ) : (
                    "Delete course"
                  )}
                </button>
                <button
                  onClick={back}
                  disabled={isDeleting}
                  className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
                >
                  Go back
                </button>
              </div>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div
              key="done"
              custom={dir}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={stepTransition}
              className="flex flex-col items-center gap-4 py-6 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-50">
                <CheckCircleIcon size={32} weight="fill" className="text-success-500" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold text-neutral-900">Course deleted</h2>
                <p className="text-sm text-neutral-500">Redirecting you now.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
