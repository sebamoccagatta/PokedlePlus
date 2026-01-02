function norm(v) {
  return String(v ?? "")
    .trim()
    .toLowerCase();
}

export function badgeClass(kind) {
  const k = norm(kind);

  // 🟩 CORRECTO (verde brillante)
  if (k === "correct") {
    return "bg-emerald-400 border-emerald-300 text-emerald-950";
  }

  // 🟨 PARCIAL (amarillo fuerte)
  if (k === "present") {
    return "bg-yellow-400 border-yellow-300 text-yellow-950";
  }

  // 🟥 INCORRECTO (rojo coral)
  if (k === "absent") {
    return "bg-rose-400 border-rose-300 text-rose-950";
  }

  // 🔵 MAYOR / MENOR (azul sólido)
  if (k === "higher" || k === "lower") {
    return "bg-sky-500 border-sky-400 text-sky-950";
  }

  // fallback neutro
  return "bg-zinc-700 border-zinc-600 text-zinc-100";
}

export function arrow(kind) {
  const k = norm(kind);
  if (k === "higher") return "↓";
  if (k === "lower") return "↑";
  return "";
}
