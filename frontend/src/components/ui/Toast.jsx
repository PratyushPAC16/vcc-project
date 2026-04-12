import { AlertCircle, CheckCircle2, Info } from "lucide-react";

const TOAST_STYLES = {
  success: {
    icon: CheckCircle2,
    classes: "border-emerald-200 bg-emerald-50 text-emerald-900",
  },
  error: {
    icon: AlertCircle,
    classes: "border-rose-200 bg-rose-50 text-rose-900",
  },
  info: {
    icon: Info,
    classes: "border-blue-200 bg-blue-50 text-blue-900",
  },
};

export default function Toast({ toast }) {
  if (!toast?.show || !toast?.message) {
    return null;
  }

  const { icon: Icon, classes } = TOAST_STYLES[toast.tone] || TOAST_STYLES.info;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 w-[min(92vw,380px)] animate-rise">
      <div className={`rounded-xl border px-4 py-3 shadow-[0_14px_28px_rgba(31,42,68,0.2)] ${classes}`} role="status" aria-live="polite">
        <p className="inline-flex items-start gap-2 text-sm font-semibold leading-6">
          <Icon size={18} className="mt-0.5 shrink-0" />
          <span>{toast.message}</span>
        </p>
      </div>
    </div>
  );
}
