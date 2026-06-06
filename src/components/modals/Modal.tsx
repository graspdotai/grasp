"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { XIcon } from "@phosphor-icons/react";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  disableBackdropClose?: boolean;
  maxWidth?: string;
}

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  disableBackdropClose = false,
  maxWidth = "max-w-md",
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!mounted) return null;

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!disableBackdropClose && e.target === overlayRef.current) onClose();
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Panel */}
          <motion.div
            className={`relative w-full ${maxWidth} rounded-2xl bg-white shadow-xl ring-1 ring-neutral-200`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
            aria-describedby={description ? "modal-description" : undefined}
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
          >
            {(title || onClose) && (
              <div className="flex items-start justify-between gap-4 px-6 pt-6">
                <div className="flex flex-col gap-1">
                  {title && (
                    <h2 id="modal-title" className="text-lg font-semibold text-neutral-900">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p id="modal-description" className="text-sm text-neutral-500">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="mt-0.5 shrink-0 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                  aria-label="Close modal"
                >
                  <XIcon size={18} />
                </button>
              </div>
            )}

            {children && <div className="px-6 pb-6">{children}</div>}

            {footer && (
              <div className="flex items-center justify-end gap-3 border-t border-neutral-100 px-6 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
