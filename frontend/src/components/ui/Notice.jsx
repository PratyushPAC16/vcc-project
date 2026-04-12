export default function Notice({ message, tone = "error" }) {
  if (!message) return null;

  const tones = {
    error: "border-rose-200 bg-rose-50 text-rose-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  };

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${tones[tone]}`}>
      {message}
    </div>
  );
}
