function norm(v) {
  return String(v ?? "")
    .trim()
    .toLowerCase();
}

export function badgeClass(kind, isDark) {
  const k = norm(kind);
  const d = isDark;

  if (k === "correct") {
    return d
      ? "bg-emerald-400 border-emerald-300 text-emerald-950"
      : "bg-emerald-500 border-emerald-600 text-white";
  }

  if (k === "present") {
    return d
      ? "bg-yellow-400 border-yellow-300 text-yellow-950"
      : "bg-yellow-500 border-yellow-600 text-yellow-900";
  }

  if (k === "absent") {
    return d
      ? "bg-rose-400 border-rose-300 text-rose-950"
      : "bg-rose-500 border-rose-600 text-white";
  }

  if (k === "higher" || k === "lower") {
    return d
      ? "bg-sky-500 border-sky-400 text-sky-950"
      : "bg-sky-600 border-sky-700 text-white";
  }

  return d
    ? "bg-zinc-700 border-zinc-600 text-zinc-100"
    : "bg-gray-300 border-gray-400 text-gray-900";
}

export function arrow(kind) {
  const k = norm(kind);
  if (k === "higher") return "↓";
  if (k === "lower") return "↑";
  return "";
}
