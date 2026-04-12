export default function ActionButton({
  variant = "primary",
  type = "button",
  className = "",
  ...props
}) {
  const baseClasses =
    "rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500 disabled:cursor-not-allowed disabled:opacity-60";
  const variants = {
    primary:
      "bg-[#2f3f69] text-[#eef2ff] ring-1 ring-[#253457] hover:bg-[#384a78]",
    ghost: "bg-[#e8edf8] text-[#273455] ring-1 ring-[#cdd7eb] hover:bg-[#dde5f4]",
    subtle: "bg-[#dbe4f4] text-[#223152] ring-1 ring-[#bccae4] hover:bg-[#d1dcf1]",
    danger: "bg-[#f0d9dd] text-[#662734] ring-1 ring-[#e0bcc5] hover:bg-[#ebcdd4]",
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
