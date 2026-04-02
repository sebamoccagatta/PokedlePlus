export function generateShareText(mode, dayKey, attempts, won, currentStreak, t) {
  const emojiMap = {
    correct: "🟩",
    present: "🟨",
    absent: "⬛",
    higher: "🔼",
    lower: "🔽",
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
    .map((attempt) => {
      const cols = attempt.columns || {};
      const keys = ["type1", "type2"];
      if (mode === "classic") keys.push("gen");
      keys.push("habitat", "color", "evolution", "height", "weight");

      return keys
        .map((k) => {
          const val = cols[k];
          if (k === "gen") return val === "correct" ? "🟩" : "⬛";
          return emojiMap[val] || "⬛";
        })
        .join("");
    })
    .join("\n");

  const footer = `\nhttps://pokedle.sebamoccagatta.com/`;
  
  return `${header}\n${grid}\n${footer}`;
}

export async function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    return new Promise((resolve, reject) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        if (successful) {
          resolve();
        } else {
          reject(new Error("Copy command failed"));
        }
      } catch (err) {
        document.body.removeChild(textArea);
        reject(err);
      }
    });
  }
}

/**
 * Share results using native Web Share API (mobile) or fallback to clipboard
 * @param {string} text - The share text to copy/share
 * @returns {Promise<{method: 'native'|'clipboard'}>} - Returns the method used for sharing
 */
export async function shareResults(text) {
  // Try native Web Share API first (better UX on mobile)
  if (navigator.share) {
    try {
      await navigator.share({
        text: text,
      });
      return { method: 'native' };
    } catch (err) {
      // User cancelled share or error occurred
      // Only throw if it's not an AbortError (user cancelled)
      if (err.name !== 'AbortError') {
        console.error('Web Share API failed:', err);
      }
      // Fall through to clipboard fallback
    }
  }

  // Fallback to clipboard
  await copyToClipboard(text);
  return { method: 'clipboard' };
}
