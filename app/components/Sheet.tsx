"use client";

import { type ReactNode, useEffect } from "react";

interface SheetProps {
  label: string;
  onClose: () => void;
  role?: "dialog" | "alertdialog";
  children: ReactNode;
}

export default function Sheet({
  label,
  onClose,
  role = "dialog",
  children,
}: SheetProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: role is always dialog or alertdialog, both support aria-modal */}
      <div
        role={role}
        aria-modal="true"
        aria-label={label}
        className="relative w-full max-w-md rounded-t-3xl bg-bg px-5 pt-3 pb-[max(2rem,env(safe-area-inset-bottom))]"
      >
        <div
          aria-hidden="true"
          className="mx-auto mb-4 h-1 w-9 rounded-full bg-line"
        />
        {children}
      </div>
    </div>
  );
}
