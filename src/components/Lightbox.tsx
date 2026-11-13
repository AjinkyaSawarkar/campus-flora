import { useEffect, useRef, type ReactNode } from "react";

interface Props { open: boolean; onClose: () => void; label: string; children: ReactNode }

/** Modal built on the native <dialog>: focus trap, Esc-to-close and aria-modal come for free. */
export default function Lightbox({ open, onClose, label, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      className="m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-black/85"
    >
      <div
        className="relative flex h-full w-full items-center justify-center p-4 sm:p-8"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-forest hover:bg-white"
        >
          Close ✕
        </button>
        {open && children}
      </div>
    </dialog>
  );
}
