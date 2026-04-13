import { AlertTriangle } from "lucide-react";
import ActionButton from "./ActionButton";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 grid place-items-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/35 backdrop-blur-sm"
        onClick={onCancel}
        aria-label="Close confirmation dialog"
      />

      <section className="relative z-10 w-full max-w-md rounded-[24px] border border-[#d9e0ef] bg-[#f9fbff] p-6 shadow-[0_20px_50px_rgba(31,42,68,0.24)]">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-700">
          <AlertTriangle size={18} />
        </div>

        <h3 className="mt-4 text-xl font-bold text-[#1f2a44]">{title}</h3>
        {description ? <p className="mt-2 text-sm text-[#5f6b86]">{description}</p> : null}

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <ActionButton variant="ghost" onClick={onCancel} disabled={loading}>
            {cancelText}
          </ActionButton>
          <ActionButton variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting..." : confirmText}
          </ActionButton>
        </div>
      </section>
    </div>
  );
}
