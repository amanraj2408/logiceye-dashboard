export default function StatusBadge({ isOnline }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${
        isOnline
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-red-500/20 bg-red-500/10 text-red-200"
      }`}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          isOnline ? "animate-pulse-slow bg-emerald-400" : "bg-red-400"
        }`}
      />
      {isOnline ? "Online" : "Offline"}
    </span>
  );
}
