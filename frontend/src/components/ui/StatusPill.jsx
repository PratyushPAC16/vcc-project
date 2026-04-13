export default function StatusPill({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-[#e8edf6] text-[#4c5d84]",
    success: "bg-[#dbe8ff] text-[#324d85]",
    warm: "bg-[#f3eadb] text-[#8b6841]",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold tracking-[0.02em] ${tones[tone]}`}>
      {children}
    </span>
  );
}
