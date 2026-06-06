"use client";

import { CheckCircleIcon } from "@phosphor-icons/react";
import Modal from "@/components/modals/Modal";

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
}

export default function SuccessModal({
  open,
  onClose,
  title,
  description,
}: SuccessModalProps) {
  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-xs">
      <div className="flex flex-col items-center gap-4 pb-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-50">
          <CheckCircleIcon
            size={32}
            weight="fill"
            className="text-success-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
          {description && (
            <p className="text-sm text-neutral-500">{description}</p>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-1 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
        >
          Done
        </button>
      </div>
    </Modal>
  );
}
