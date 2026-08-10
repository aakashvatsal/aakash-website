"use client";

import { AlertTriangle, X } from "lucide-react";

type AdminConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function AdminConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  onConfirm,
  onClose,
}: AdminConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] grid place-items-center bg-black/80 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#070b0d] p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
              destructive
                ? "bg-red-400/10 text-red-300"
                : "bg-[#C6FF32]/10 text-[#C6FF32]"
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>

          <button
            type="button"
            aria-label="Close confirmation"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl text-white/35 hover:bg-white/[0.05] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h2
          id="confirm-dialog-title"
          className="mt-6 text-2xl font-black tracking-[-0.04em]"
        >
          {title}
        </h2>

        <p className="mt-3 text-sm leading-6 text-white/45">
          {description}
        </p>

        <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="min-h-12 rounded-[16px] border border-white/10 text-sm font-bold text-white/60"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`min-h-12 rounded-[16px] text-sm font-black ${
              destructive
                ? "bg-red-400 text-[#030608]"
                : "bg-[#C6FF32] text-[#030608]"
            }`}
          >
            {loading ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}