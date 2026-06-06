"use client";

import { SignOutIcon } from "@phosphor-icons/react";
import Modal from "@/components/modals/Modal";

interface SignOutModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export default function SignOutModal({
  open,
  onClose,
  onConfirm,
  isLoading,
}: SignOutModalProps) {
  return (
    <Modal open={open} onClose={isLoading ? undefined! : onClose} disableBackdropClose={isLoading} maxWidth="max-w-xs">
      <div className="flex flex-col items-center gap-4 pb-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
          <SignOutIcon size={28} weight="bold" className="text-neutral-500" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-neutral-900">Sign out?</h2>
          <p className="text-sm text-neutral-500">You'll need to sign back in to access your courses.</p>
        </div>
        <div className="flex w-full flex-col gap-2 pt-1">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50"
          >
            {isLoading ? "Signing out…" : "Sign out"}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
