"use client";

import { ReactNode } from "react";
import { Save } from "lucide-react";

interface AdminFormFooterProps {
  saving?: boolean;
  isEditMode?: boolean;
  createLabel?: string;
  updateLabel?: string;
  description?: string;
  children?: ReactNode;
}

export function AdminFormFooter({
  saving = false,
  isEditMode = false,
  createLabel = "Create",
  updateLabel = "Save Changes",
  description,
  children,
}: AdminFormFooterProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#030608]/90 backdrop-blur-xl lg:left-64">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <div className="hidden sm:block">
          <p className="text-sm text-white/45">
            {description ??
              (isEditMode
                ? "Save your changes."
                : "Create a new record.")}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {children}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#C6FF32] px-6 text-sm font-semibold text-[#030608] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />

            {saving
              ? "Saving..."
              : isEditMode
                ? updateLabel
                : createLabel}
          </button>
        </div>
      </div>
    </div>
  );
}