export function generateShareText(mode, dayKey, attempts, won, currentStreak, t) {
  const emojiMap = {
    correct: "🟩",
    present: "🟨",
    absent: "🟥",
    higher: "🟦",
    lower: "🟦",
  };

  const score = won ? attempts.length : "X";
  const modeName = mode === "classic" ? "Classic" : mode.toUpperCase();
  
  // Header: Pokedle+ #DayKey 5/15 (Classic)
  let header = `Pokedle+ #${dayKey} ${score}/15 (${modeName})`;
  
  // Add streak if won and streak > 1
  if (won && currentStreak > 1) {
    header += `\nStreak: ${currentStreak} 🔥`;
  }
  header += "\n";

  const grid = attempts
    .slice()
    .reverse()
    .map((attempt) => {
      const cols = attempt.columns || {};
      const keys = ["type1", "type2"];
      if (mode === "classic") keys.push("gen");
      keys.push("habitat", "color", "evolution", "height", "weight");

      return keys
        .map((k) => {
          const val = cols[k];
          if (k === "gen") return val === "correct" ? "🟩" : "🟥";
          return emojiMap[val] || "⬜";
        })
        .join("");
    })
    .join("\n");

  const footer = `\nhttps://pokedle-plus.netlify.app/`;
  
  return `${header}\n${grid}\n${footer}`;
}

export async function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
    } catch (err) {
      console.error("Fallback copy failed", err);
    }
    document.body.removeChild(textArea);
  }
}
